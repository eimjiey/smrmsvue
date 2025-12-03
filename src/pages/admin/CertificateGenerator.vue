<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

// --- State ---
const students = ref([]);
const selectedStudent = ref(null);
const certificateId = ref(null);
const isLoading = ref(false);
const message = ref('');
const isSuccess = ref(true);

// --- Layout styles (same design family as StudentsList.vue) ---
const adminDashboardContainerStyle = {
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#e6f0e7',
  padding: '0',
};

const mainTitleStyle = {
  textAlign: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#198040',
  margin: '25px 0 10px 0',
  letterSpacing: '1px',
};

const formWrapperOuterStyle = {
  maxWidth: '700px',
  margin: '20px auto 40px auto',
  padding: '0 20px',
};

const formWrapperInnerStyle = {
  padding: '30px',
  borderRadius: '30px',
  backgroundImage: `url(${formBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
  position: 'relative',
};

const sectionHeaderStyle = {
  position: 'absolute',
  top: '10px',
  left: '40px',
  padding: '8px 25px',
  background: '#ffffff',
  borderRadius: '999px',
  fontWeight: 'bold',
  fontSize: '1rem',
  zIndex: 2,
};

const contentCardStyle = {
  background: 'rgba(255,255,255,0.95)',
  borderRadius: '25px',
  padding: '30px 28px 28px 28px',
};

// --- Logic from your original component ---
const downloadUrl = computed(() =>
  certificateId.value ? `/certificates/download/${certificateId.value}` : '#',
);

const setMessage = (msg, success = true) => {
  message.value = msg;
  isSuccess.value = success;
  if (!success) {
    certificateId.value = null;
  }
  setTimeout(() => {
    message.value = '';
  }, 6000);
};

const fetchStudents = async () => {
  try {
    const res = await api.get('/students');
    students.value = res.data.data || [];
    setMessage('Students loaded successfully.', true);
  } catch (err) {
    console.error('Error fetching students:', err);
    setMessage('Failed to load students.', false);
  }
};

const initiateDownload = async () => {
  if (!downloadUrl.value || downloadUrl.value === '#') {
    setMessage('Error: Certificate download link is not ready.', false);
    return;
  }

  try {
    const response = await fetch(downloadUrl.value, { method: 'HEAD' });
    if (response.ok) {
      window.open(downloadUrl.value, '_blank');
      setMessage("Download initiated. Check your browser's downloads.", true);
    } else if (response.status === 404) {
      setMessage(
        'Download failed: Certificate file was not found on the server (404). **ACTION: Clear route cache and restart server.**',
        false,
      );
    } else if (response.status === 401 || response.status === 403) {
      setMessage(
        'Download failed: Authentication error (401/403). Ensure the download route is public.',
        false,
      );
    } else {
      setMessage(
        `Download failed: Server returned status ${response.status}.`,
        false,
      );
    }
  } catch (error) {
    console.error('Download check error:', error);
    setMessage('Network error during download check. Ensure server is running.', false);
  }
};

const generateCertificate = async () => {
  if (!selectedStudent.value) {
    setMessage('Please select a student.', false);
    return;
  }

  isLoading.value = true;
  certificateId.value = null;

  try {
    const payload = {
      recipient_name: `${selectedStudent.value.first_name} ${selectedStudent.value.last_name}`,
      title: 'Certificate of Completion',
      notes: 'Congratulations on your achievement!',
      issued_at: new Date().toISOString().slice(0, 10),
    };

    const res = await api.post('/certificates', payload);
    console.log('Certificate generated:', res.data);

    if (res.data && res.data.id && res.data.certificate_number) {
      certificateId.value = res.data.id;
      setMessage(
        `Certificate ${res.data.certificate_number} generated successfully! Click the button below to download.`,
        true,
      );
    } else {
      setMessage(
        'Generation succeeded but returned an unexpected response.',
        false,
      );
    }
  } catch (err) {
    console.error('Error generating certificate:', err);
    setMessage(
      err.response?.data?.message || 'Failed to generate certificate.',
      false,
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchStudents);
</script>

<template>
  <div :style="adminDashboardContainerStyle">
    <AdminNavbar />

    <h1 :style="mainTitleStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">CERTIFICATE GENERATOR</div>

        <div :style="contentCardStyle">
          <!-- Your original inner card with Tailwind -->
          <div class="p-6 bg-white shadow-xl rounded-xl">
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
              <label
                for="student"
                class="block mb-1 font-medium text-gray-700"
              >Select Student:</label>
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}
</style>
