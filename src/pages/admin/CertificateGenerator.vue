<template>
  <div class="p-6 max-w-lg mx-auto bg-white shadow-xl rounded-xl">
    <h1 class="text-3xl font-extrabold text-green-700 mb-6 border-b pb-2">
      Certificate Generator
    </h1>

    <!-- Success/Error Message Notifier -->
    <div
      v-if="message"
      :class="{
        'bg-green-100 border-green-400 text-green-700': isSuccess,
        'bg-red-100 border-red-400 text-red-700': !isSuccess,
      }"
      class="border px-4 py-3 rounded relative mb-4 transition-all duration-300"
      role="alert"
    >
      <span class="block sm:inline">{{ message }}</span>
    </div>

    <div class="mb-4">
      <label for="student" class="block mb-1 font-medium text-gray-700">Select Student:</label>
      <select
        id="student"
        v-model="selectedStudent"
        class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-green-500 focus:border-green-500"
      >
        <option disabled :value="null">-- Select a student --</option>
        <option
          v-for="student in students"
          :key="student.student_id"
          :value="student"
        >
          {{ student.first_name }} {{ student.last_name }}
        </option>
      </select>
    </div>

    <button
      :disabled="!selectedStudent || isLoading"
      class="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
      @click="generateCertificate"
    >
      <span v-if="isLoading">Generating...</span>
      <span v-else>Generate Certificate</span>
    </button>
    
    <!-- Download Button (Visible after successful generation) -->
    <a
      v-if="certificateId"
      href="#"
      @click.prevent="initiateDownload"
      class="mt-4 w-full block text-center bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
    >
      Download Generated Certificate
    </a>
  </div>
</template>

<script>
import api from "@/services/api";

export default {
  data() {
    return {
      students: [],
      selectedStudent: null,
      certificateId: null, // Stores ID for manual download
      isLoading: false,
      message: "",
      isSuccess: true,
    };
  },
  
  computed: {
    downloadUrl() {
      return this.certificateId ? `/certificates/download/${this.certificateId}` : '#';
    }
  },

  mounted() {
    this.fetchStudents();
  },
  
  methods: {
    setMessage(msg, success = true) {
      this.message = msg;
      this.isSuccess = success;
      if (!success) {
        this.certificateId = null;
      }
      setTimeout(() => {
        this.message = "";
      }, 6000);
    },

    async fetchStudents() {
      try {
        const res = await api.get("/students");
        this.students = res.data.data || [];
        this.setMessage("Students loaded successfully.", true);
      } catch (err) {
        console.error("Error fetching students:", err);
        this.setMessage("Failed to load students.", false);
      }
    },

    async initiateDownload() {
      if (!this.downloadUrl || this.downloadUrl === '#') {
        this.setMessage("Error: Certificate download link is not ready.", false);
        return;
      }

      try {
        const response = await fetch(this.downloadUrl, { method: 'HEAD' });
        if (response.ok) {
          window.open(this.downloadUrl, '_blank');
          this.setMessage("Download initiated. Check your browser's downloads.", true);
        } else if (response.status === 404) {
          this.setMessage("Download failed: Certificate file was not found on the server (404). **ACTION: Clear route cache and restart server.**", false);
        } else if (response.status === 401 || response.status === 403) {
          this.setMessage("Download failed: Authentication error (401/403). Ensure the download route is public.", false);
        } else {
          this.setMessage(`Download failed: Server returned status ${response.status}.`, false);
        }
      } catch (error) {
        console.error("Download check error:", error);
        this.setMessage("Network error during download check. Ensure server is running.", false);
      }
    },

    async generateCertificate() {
      if (!this.selectedStudent) {
        this.setMessage("Please select a student.", false);
        return;
      }
      
      this.isLoading = true;
      this.certificateId = null;

      try {
        const payload = {
          recipient_name: `${this.selectedStudent.first_name} ${this.selectedStudent.last_name}`,
          title: "Certificate of Completion",
          notes: "Congratulations on your achievement!",
          issued_at: new Date().toISOString().slice(0, 10),
        };

        const res = await api.post("/certificates", payload);
        console.log("Certificate generated:", res.data);

        if (res.data && res.data.id && res.data.certificate_number) {
          this.certificateId = res.data.id;
          this.setMessage(
            `Certificate ${res.data.certificate_number} generated successfully! Click the button below to download.`,
            true
          );
        } else {
          this.setMessage("Generation succeeded but returned an unexpected response.", false);
        }

      } catch (err) {
        console.error("Error generating certificate:", err);
        this.setMessage(
          err.response?.data?.message || "Failed to generate certificate.",
          false
        );
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* No custom styles needed beyond Tailwind utility classes */
</style>
