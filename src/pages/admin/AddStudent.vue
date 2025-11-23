<template>
  <div class="add-student-container">
    <div class="header">
      <button class="back-btn" @click="$router.back()">← Back</button>
      <h2>➕ Add New Student</h2>
    </div>

    <p v-if="successMessage" class="message success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>

    <form @submit.prevent="addStudent" class="student-form">
      <div class="form-group">
        <label for="student_number">Student Number:</label>
        <input type="text" id="student_number" v-model="student.student_number" required>
        <span class="error-text" v-if="validationErrors.student_number">{{ validationErrors.student_number[0] }}</span>
      </div>

      <div class="name-fields">
        <div class="form-group">
          <label for="first_name">First Name:</label>
          <input type="text" id="first_name" v-model="student.first_name" required>
          <span class="error-text" v-if="validationErrors.first_name">{{ validationErrors.first_name[0] }}</span>
        </div>
        <div class="form-group">
          <label for="middle_name">Middle Name:</label>
          <input type="text" id="middle_name" v-model="student.middle_name">
          <span class="error-text" v-if="validationErrors.middle_name">{{ validationErrors.middle_name[0] }}</span>
        </div>
        <div class="form-group">
          <label for="last_name">Last Name:</label>
          <input type="text" id="last_name" v-model="student.last_name" required>
          <span class="error-text" v-if="validationErrors.last_name">{{ validationErrors.last_name[0] }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="gender">Gender:</label>
          <select id="gender" v-model="student.gender" required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <span class="error-text" v-if="validationErrors.gender">{{ validationErrors.gender[0] }}</span>
        </div>
        <div class="form-group">
          <label for="date_of_birth">Date of Birth:</label>
          <input type="date" id="date_of_birth" v-model="student.date_of_birth" required>
          <span class="error-text" v-if="validationErrors.date_of_birth">{{ validationErrors.date_of_birth[0] }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="program">Program:</label>
          <input type="text" id="program" v-model="student.program" required>
          <span class="error-text" v-if="validationErrors.program">{{ validationErrors.program[0] }}</span>
        </div>
        <div class="form-group">
          <label for="year_level">Year Level:</label>
          <select id="year_level" v-model="student.year_level" required>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
          <span class="error-text" v-if="validationErrors.year_level">{{ validationErrors.year_level[0] }}</span>
        </div>
        <div class="form-group">
          <label for="section">Section:</label>
          <input type="text" id="section" v-model="student.section">
          <span class="error-text" v-if="validationErrors.section">{{ validationErrors.section[0] }}</span>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="contact_number">Contact Number:</label>
          <input type="text" id="contact_number" v-model="student.contact_number" required>
          <span class="error-text" v-if="validationErrors.contact_number">{{ validationErrors.contact_number[0] }}</span>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="student.email" required>
          <span class="error-text" v-if="validationErrors.email">{{ validationErrors.email[0] }}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="address">Address:</label>
        <textarea id="address" v-model="student.address" rows="3" required></textarea>
        <span class="error-text" v-if="validationErrors.address">{{ validationErrors.address[0] }}</span>
      </div>

      <h3>Guardian Information</h3>
      <div class="form-row">
        <div class="form-group">
          <label for="guardian_name">Guardian Name:</label>
          <input type="text" id="guardian_name" v-model="student.guardian_name" required>
          <span class="error-text" v-if="validationErrors.guardian_name">{{ validationErrors.guardian_name[0] }}</span>
        </div>
        <div class="form-group">
          <label for="guardian_contact">Guardian Contact:</label>
          <input type="text" id="guardian_contact" v-model="student.guardian_contact" required>
          <span class="error-text" v-if="validationErrors.guardian_contact">{{ validationErrors.guardian_contact[0] }}</span>
        </div>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Adding...' : 'Add Student' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
// Import path should be correct relative to src/pages/admin/AddStudent.vue
import api from '@/services/api'; 

const initialStudentState = {
  student_number: '',
  first_name: '',
  middle_name: null, 
  last_name: '',
  gender: 'Male', 
  date_of_birth: '',
  program: '',
  year_level: '1st Year', 
  section: null, 
  contact_number: '',
  email: '',
  address: '',
  guardian_name: '',
  guardian_contact: '',
};

const student = ref({ ...initialStudentState });
const validationErrors = ref({});
const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const resetForm = () => {
  student.value = { ...initialStudentState };
  validationErrors.value = {};
  errorMessage.value = '';
};

const addStudent = async () => {
  // Clear previous validation/errors but keep form data until the request completes
  validationErrors.value = {};
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    // API endpoint for your Laravel store method
    const response = await api.post('/students', student.value);
    
    if (response.status === 201 || response.status === 200) {
      successMessage.value = '✅ Student added successfully! Clearing form...';
      setTimeout(resetForm, 2000); 
    }

  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 422 && error.response.data.errors) {
        // Handle Laravel Validation Errors
        errorMessage.value = 'Validation failed. Please check the fields below.';
        validationErrors.value = error.response.data.errors;
      } else {
        // General error handling 
        errorMessage.value = `An error occurred: ${error.response.data.message || error.message}`;
      }
    } else {
      // Network error
      errorMessage.value = 'Network error or server is unreachable.';
    }
    
    successMessage.value = '';

  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Scoped CSS for the form styling */
.add-student-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-btn {
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #5a6268;
}

.header h2 {
  margin: 0;
}

h2, h3 {
  color: #343a40;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 5px;
  margin-bottom: 15px;
}

.student-form .form-group {
  margin-bottom: 15px;
}

.student-form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #495057;
}

.student-form input[type="text"],
.student-form input[type="email"],
.student-form input[type="date"],
.student-form select,
.student-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.name-fields, .form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.name-fields .form-group, .form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.message {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  font-weight: bold;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.error-text {
  color: #dc3545;
  font-size: 0.85em;
  margin-top: 5px;
  display: block;
}

button[type="submit"] {
  background-color: #28a745;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  width: 100%;
  margin-top: 20px;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #218838;
}

button[type="submit"]:disabled {
  background-color: #90ee90;
  cursor: not-allowed;
}
</style>