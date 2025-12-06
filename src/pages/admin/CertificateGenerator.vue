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
const validationErrors = ref({}); // State for validation errors

// New form state for Misconduct Details
const offenseDetails = ref({
    offense_type: '',
    date_of_incident: new Date().toISOString().slice(0, 10),
    disciplinary_action: '',
    status: 'Pending', // Default
    school_name: 'Echague State University', 
    school_location: 'Echague, Isabela', 
    official_name: 'Dr. Maria S. Reyes', 
    official_position: 'Dean of Student Affairs', 
});


// --- Layout Styles (Retained) ---
const formWrapperOuterStyle = {
  maxWidth: '800px',
  margin: '20px auto 40px auto',
  padding: '0 0',
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


// --- Logic ---
const downloadUrl = computed(() => {
    if (!certificateId.value) return '#';
    
    // Use the full API base URL for downloads to avoid Vue Router conflicts
    const baseUrl = api.instance.defaults.baseURL || '';
    // Remove '/api' from the end and construct the download URL
    const serverUrl = baseUrl.replace(/\/api\/?$/, '');
    return `${serverUrl}/certificates/download/${certificateId.value}`;
});

const setMessage = (msg, success = true) => {
    message.value = msg;
    isSuccess.value = success;
    if (!success) {
        certificateId.value = null;
    }
    validationErrors.value = {}; // Clear errors on new general message
    setTimeout(() => {
        message.value = '';
    }, 6000);
};

const fetchStudents = async () => {
    try {
        const res = await api.get('/students');
        students.value = res.data.data || res.data || []; 
    } catch (err) {
        console.error('Error fetching students:', err);
        setMessage('Failed to load students. Ensure your server is running.', false);
    }
};

const initiateDownload = async () => {
    if (!downloadUrl.value || downloadUrl.value === '#') {
        setMessage('Error: Certificate download link is not ready.', false);
        return;
    }
    
    // For full URLs, use window.location.href instead of window.open to avoid popup blockers
    window.location.href = downloadUrl.value;
    setMessage("Download initiated. Check your browser's downloads.", true);
};

const generateCertificate = async () => {
    if (!selectedStudent.value) {
        setMessage('Please select a student.', false);
        return;
    }

    // Validate required fields before sending
    if (!offenseDetails.value.offense_type) {
        setMessage('Please enter an offense type.', false);
        return;
    }
    
    if (!offenseDetails.value.date_of_incident) {
        setMessage('Please select a date of incident.', false);
        return;
    }
    
    if (!offenseDetails.value.disciplinary_action) {
        setMessage('Please enter disciplinary action details.', false);
        return;
    }

    isLoading.value = true;
    certificateId.value = null;
    validationErrors.value = {}; // Clear previous validation errors

    try {
        // --- FINAL CORRECTED PAYLOAD (Must be complete and accurate) ---
        const payload = {
            // Student Data (required by validation)
            student_name: `${selectedStudent.value.first_name} ${selectedStudent.value.last_name}`,
            student_id: selectedStudent.value.student_id ? String(selectedStudent.value.student_id) : '', 
            program_grade: selectedStudent.value.program_grade || 'BS Computer Science', 
            
            // Misconduct Details (required by validation)
            offense_type: offenseDetails.value.offense_type.trim(),
            date_of_incident: offenseDetails.value.date_of_incident,
            disciplinary_action: offenseDetails.value.disciplinary_action.trim(),
            status: offenseDetails.value.status,
            
            // Issuance Details
            issued_date: new Date().toISOString().slice(0, 10),
            school_name: offenseDetails.value.school_name.trim(),
            school_location: offenseDetails.value.school_location.trim(),
            official_name: offenseDetails.value.official_name.trim(),
            official_position: offenseDetails.value.official_position.trim(),
        };

        console.log('Sending certificate payload:', payload); // Debug log
        
        const res = await api.post('/certificates', payload);
        
        if (res.data && res.data.id && res.data.certificate_number) {
            certificateId.value = res.data.id;
            setMessage(
                `Certificate ${res.data.certificate_number} generated successfully! Click the button below to download.`,
                true,
            );
        } else {
            setMessage('Generation succeeded but returned an unexpected response.', false);
        }
    } catch (err) {
        console.error('Error generating certificate:', err);
        
        // Log more detailed error information
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error response status:', err.response.status);
            console.error('Error response headers:', err.response.headers);
        }
        
        if (err.response && err.response.status === 422) {
             // Handle 422 validation error response
             validationErrors.value = err.response.data.errors; // Capture the specific error messages object
             setMessage('Validation failed. Please correct the errors below.', false);
        } else {
             // Handle 500 error or network error with more detailed message
             let errorMessage = 'Failed to generate certificate due to a server error.';
             
             if (err.response) {
                 if (err.response.status === 500) {
                     // Check if we have a specific error detail from the server
                     if (err.response.data && err.response.data.detail) {
                         errorMessage = `Server error (500): ${err.response.data.detail}`;
                     } else if (err.response.data && err.response.data.error) {
                         errorMessage = `Server error (500): ${err.response.data.error}`;
                     } else {
                         errorMessage = 'Server error (500): Certificate generation failed. Please check your Laravel logs for more details.';
                     }
                 } else {
                     errorMessage = `Server responded with status ${err.response.status}: ${err.response.statusText}`;
                 }
                 
                 // Include any error details from the server if available
                 if (err.response.data && err.response.data.message) {
                     errorMessage += ` - ${err.response.data.message}`;
                 }
             } else if (err.request) {
                 errorMessage = 'Network error: Unable to reach the server. Please check your connection and ensure the backend is running.';
             }
             
             setMessage(errorMessage, false);
        }
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchStudents);
</script>

<template>
  <AdminNavbar>
    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">STUDENT MISCONDUCT RECORD GENERATOR</div>

        <div :style="contentCardStyle">
          <div class="p-6 bg-white shadow-xl rounded-xl">
            <h1 class="text-3xl font-extrabold text-red-700 mb-6 border-b pb-2">
              Generate Misconduct Record
            </h1>

            <!-- Debug Info - Uncomment to enable -->
            <!--
            <div class="mb-4 p-2 bg-gray-100 rounded text-xs">
              <p>Selected Student: {{ selectedStudent ? selectedStudent.first_name + ' ' + selectedStudent.last_name : 'None' }}</p>
              <p>Certificate ID: {{ certificateId }}</p>
              <p>API Base URL: {{ api.instance ? api.instance.defaults.baseURL : 'Not available' }}</p>
            </div>
            -->

            <div
              v-if="message"
              :class="{
                'bg-green-100 border-green-400 text-green-700': isSuccess,
                'bg-red-110 border-red-400 text-red-700': !isSuccess,
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
                class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-red-500 focus:border-red-500"
              >
                <option disabled :value="null">-- Select a student --</option>
                <option
                  v-for="student in students"
                  :key="student.student_id"
                  :value="student"
                >
                  {{ student.first_name }} {{ student.last_name }} (ID: {{ student.student_id }})
                </option>
              </select>
              <p v-if="validationErrors.student_name" class="text-red-500 text-sm mt-1">
                 {{ validationErrors.student_name[0] }}
              </p>
            </div>
            
            <h2 class="text-xl font-bold mt-6 mb-4 text-red-600 border-b pb-2">Offense Details</h2>

            <div class="mb-4">
              <label class="block mb-1 font-medium text-gray-700">Offense Type:</label>
              <input type="text" v-model="offenseDetails.offense_type" class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-red-500 focus:border-red-500" required>
              <p v-if="validationErrors.offense_type" class="text-red-500 text-sm mt-1">
                 {{ validationErrors.offense_type[0] }}
              </p>
            </div>

            <div class="mb-4">
              <label class="block mb-1 font-medium text-gray-700">Date of Incident:</label>
              <input type="date" v-model="offenseDetails.date_of_incident" class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-red-500 focus:border-red-500" required>
              <p v-if="validationErrors.date_of_incident" class="text-red-500 text-sm mt-1">
                 {{ validationErrors.date_of_incident[0] }}
              </p>
            </div>

            <div class="mb-4">
              <label class="block mb-1 font-medium text-gray-700">Disciplinary Action:</label>
              <textarea v-model="offenseDetails.disciplinary_action" class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-red-500 focus:border-red-500" required></textarea>
              <p v-if="validationErrors.disciplinary_action" class="text-red-500 text-sm mt-1">
                 {{ validationErrors.disciplinary_action[0] }}
              </p>
            </div>

            <div class="mb-4">
              <label class="block mb-1 font-medium text-gray-700">Status:</label>
              <select v-model="offenseDetails.status" class="border rounded-lg shadow-sm px-3 py-2 w-full focus:ring-red-500 focus:border-red-500" required>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
              <p v-if="validationErrors.status" class="text-red-500 text-sm mt-1">
                 {{ validationErrors.status[0] }}
              </p>
            </div>

            <button
              :disabled="!selectedStudent || isLoading"
              class="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
              @click="generateCertificate"
            >
              <span v-if="isLoading">Generating...</span>
              <span v-else>Generate Misconduct Record</span>
            </button>

            <a
              v-if="certificateId"
              href="#"
              @click.prevent="initiateDownload"
              class="mt-4 w-full block text-center bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Download Generated Record
            </a>
          </div>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>

<style scoped>
/* Scoped styles */
</style>