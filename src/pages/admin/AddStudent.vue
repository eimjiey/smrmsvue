<script setup>
import { ref } from 'vue';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

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

// top notifier
const showStatusBar = ref(false);
const statusMessage = ref('');

const triggerStatusBar = (msg) => {
  statusMessage.value = msg;
  showStatusBar.value = true;
  setTimeout(() => {
    showStatusBar.value = false;
  }, 3000);
};

const resetForm = () => {
  student.value = { ...initialStudentState };
  validationErrors.value = {};
  errorMessage.value = '';
};

const addStudent = async () => {
  validationErrors.value = {};
  errorMessage.value = '';
  successMessage.value = '';
  isLoading.value = true;

  try {
    const response = await api.post('/students', student.value);
    if (response.status === 201 || response.status === 200) {
      successMessage.value = 'Student added successfully!';
      triggerStatusBar('Student added successfully!');
      setTimeout(resetForm, 1500);
    }
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 422 && error.response.data.errors) {
        errorMessage.value = 'Validation failed. Please check the fields below.';
        validationErrors.value = error.response.data.errors;
      } else {
        errorMessage.value = `An error occurred: ${
          error.response.data.message || error.message
        }`;
      }
    } else {
      errorMessage.value = 'Network error or server is unreachable.';
    }
    successMessage.value = '';
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <AdminNavbar>
    <div class="add-student-page">
      <!-- Top banner -->
      <header class="add-student-header">
        <div>
          <h1>ADD NEW STUDENT RECORD</h1>
          <p>Please fill out all required fields to create the student profile.</p>
        </div>
        <div class="add-student-header__pill"></div>
      </header>

      <!-- Notifier -->
      <transition name="status-bar">
        <div v-if="showStatusBar" class="status-bar">
          <div class="status-bar__inner">
            {{ statusMessage }}
          </div>
        </div>
      </transition>

      <!-- Card -->
      <div class="add-student-card">
        <div class="add-student-card__inner">
          <!-- Personal info title -->
          <div class="section-title-row">
            <span class="section-title">PERSONAL INFO</span>
          </div>

          <p v-if="successMessage" class="msg msg--success">{{ successMessage }}</p>
          <p v-if="errorMessage" class="msg msg--error">{{ errorMessage }}</p>

          <form @submit.prevent="addStudent" class="form-grid">
            <!-- Row 1: student id + 3 names -->
            <div class="form-row">
              <div class="field">
                <label>STUDENT ID</label>
                <input v-model="student.student_number" required />
                <small v-if="validationErrors.student_number">
                  {{ validationErrors.student_number[0] }}
                </small>
              </div>
              <div class="field">
                <label>FIRST NAME</label>
                <input v-model="student.first_name" required />
                <small v-if="validationErrors.first_name">
                  {{ validationErrors.first_name[0] }}
                </small>
              </div>
              <div class="field">
                <label>MIDDLE NAME</label>
                <input v-model="student.middle_name" />
                <small v-if="validationErrors.middle_name">
                  {{ validationErrors.middle_name[0] }}
                </small>
              </div>
              <div class="field">
                <label>LAST NAME</label>
                <input v-model="student.last_name" required />
                <small v-if="validationErrors.last_name">
                  {{ validationErrors.last_name[0] }}
                </small>
              </div>
            </div>

            <!-- Row 2: gender + contact + email -->
<div class="form-row">
  <div class="field">
    <label>GENDER</label>
    <div class="gender-card">
      <label class="gender-card__option">
        <span>Male</span>
        <span class="gender-card__circle" :class="{ checked: student.gender === 'Male' }"></span>
        <input
          type="radio"
          value="Male"
          v-model="student.gender"
        />
      </label>

      <label class="gender-card__option">
        <span>Female</span>
        <span class="gender-card__circle" :class="{ checked: student.gender === 'Female' }"></span>
        <input
          type="radio"
          value="Female"
          v-model="student.gender"
        />
      </label>
    </div>
    <small v-if="validationErrors.gender">
      {{ validationErrors.gender[0] }}
    </small>
  </div>

  <div class="field">
    <label>CONTACT NUMBER</label>
    <input v-model="student.contact_number" required />
    <small v-if="validationErrors.contact_number">
      {{ validationErrors.contact_number[0] }}
    </small>
  </div>

  <div class="field field--wide">
    <label>EMAIL</label>
    <input type="email" v-model="student.email" required />
    <small v-if="validationErrors.email">
      {{ validationErrors.email[0] }}
    </small>
  </div>
</div>

<!-- Row 3: year / program / section -->
<div class="form-row">
  <div class="field">
    <label>YEAR LEVEL</label>
    <select v-model="student.year_level" required>
      <option value="1st Year">1st Year</option>
      <option value="2nd Year">2nd Year</option>
      <option value="3rd Year">3rd Year</option>
      <option value="4th Year">4th Year</option>
    </select>
    <small v-if="validationErrors.year_level">
      {{ validationErrors.year_level[0] }}
    </small>
  </div>
  <div class="field">
    <label>PROGRAM</label>
    <input v-model="student.program" required />
    <small v-if="validationErrors.program">
      {{ validationErrors.program[0] }}
    </small>
  </div>
  <div class="field field--wide">
    <label>SECTION</label>
    <input v-model="student.section" />
    <small v-if="validationErrors.section">
      {{ validationErrors.section[0] }}
    </small>
  </div>
</div>

            <!-- Row 4: DOB + address -->
            <div class="form-row">
              <div class="field field--wide">
                <label>DATE OF BIRTH</label>
                <input type="date" v-model="student.date_of_birth" required />
                <small v-if="validationErrors.date_of_birth">
                  {{ validationErrors.date_of_birth[0] }}
                </small>
              </div>
              <div class="field field--wide">
                <label>ADDRESS</label>
                <input v-model="student.address" required />
                <small v-if="validationErrors.address">
                  {{ validationErrors.address[0] }}
                </small>
              </div>
            </div>

            <!-- Guardian title -->
            <div class="section-title-row section-title-row--guardian">
              <span class="section-title">GUARDIAN INFO</span>
            </div>

            <!-- Row 5: guardian + contact + button -->
            <div class="form-row form-row--guardian">
              <div class="field field--wide">
                <label>GUARDIAN NAME</label>
                <input v-model="student.guardian_name" required />
                <small v-if="validationErrors.guardian_name">
                  {{ validationErrors.guardian_name[0] }}
                </small>
              </div>
              <div class="field field--wide">
                <label>GUARDIAN CONTACT</label>
                <input v-model="student.guardian_contact" required />
                <small v-if="validationErrors.guardian_contact">
                  {{ validationErrors.guardian_contact[0] }}
                </small>
              </div>
            </div>

            <div class="submit-row">
              <button type="submit" class="btn-submit" :disabled="isLoading">
                {{ isLoading ? 'ADDING...' : 'ADD STUDENT' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>


<style scoped>
.add-student-page {
  min-height: 100vh;
  padding: 24px;
  background-color: #74a765;
  box-sizing: border-box;
}

/* Top banner */
.add-student-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #e1f3d5;
  border-radius: 16px;
  padding: 16px 24px;
  color: #0b3a23;
  margin-bottom: 16px;
}

.add-student-header h1 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
}

.add-student-header p {
  margin: 0;
  font-size: 0.85rem;
}

.add-student-header__pill {
  width: 260px;
  height: 32px;
  border-radius: 999px;
  background-color: #dfead6;
}

/* Notifier bar */
.status-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.status-bar__inner {
  max-width: 900px;
  width: 100%;
  background-color: #e9f8e4;
  color: #000;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 20px;
  box-shadow: inset 0 0 0 4px #003b23, 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 10px;
  text-align: center;
}

.status-bar-enter-active,
.status-bar-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.status-bar-enter-from,
.status-bar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Main card */
.add-student-card {
  background-color: #0b3a23;
  border-radius: 18px;
  padding: 10px;
}

.add-student-card__inner {
  background-color: #f1fbe5;
  border-radius: 16px;
  padding: 24px 24px 20px 24px;
}

/* Section titles (PERSONAL INFO / GUARDIAN INFO) */
.section-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-title-row::after {
  content: "";
  flex: 1;
  height: 1px;
  margin-left: 10px;
  background-color: #9fbf96;
}

.section-title-row--guardian {
  margin-top: 16px;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0b3a23;
}

/* messages */
.msg {
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 0.82rem;
  margin-bottom: 8px;
}

.msg--success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.msg--error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Form layout */
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

/* wide fields (2 columns) */
.field--wide {
  grid-column: span 2;
}

/* Guardian row uses 2 columns only */
.form-row--guardian {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* Field pill style */
.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #0b3a23;
  margin-bottom: 4px;
}

.field input,
.field select {
  height: 34px;
  border-radius: 999px;
  border: none;
  padding: 6px 14px;
  font-size: 0.8rem;
  background-color: #ffffff;
  color: #0b3a23;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  outline: none;
  box-sizing: border-box;
}

/* custom select arrow */
.field select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 1.1em;
  padding-right: 30px;
}

.field small {
  margin-top: 3px;
  font-size: 0.7rem;
  color: #d9534f;
}

/* Gender pill buttons */
.gender-pill {
  display: inline-flex;
  background-color: #d7edd1;
  border-radius: 999px;
  padding: 3px;
}

.gender-pill button {
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0b3a23;
  background-color: transparent;
  cursor: pointer;
}

.gender-pill button.active {
  background-color: #0b3a23;
  color: #ffffff;
}

/* Submit button area */
.submit-row {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.btn-submit {
  padding: 8px 24px;
  border-radius: 999px;
  border: none;
  background-color: #0b3a23;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Focus ring */
input:focus,
select:focus {
  box-shadow: 0 0 0 2px #0e7bff;
}

/* Gender cards like screenshot */
.gender-card {
  display: flex;
  flex-direction: row;   /* was column */
  gap: 8px;
}

.gender-card__option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 999px;
  padding: 6px 12px;
  background: #ffffff;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  color: #0b3a23;
    flex: 1;    
}

/* hide real radio */
.gender-card__option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* circle on the right */
.gender-card__circle {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid #0b3a23;
  background-color: #ffffff;
  box-sizing: border-box;
}

/* filled when checked */
.gender-card__circle.checked {
  background-color: #0b3a23;
  box-shadow: inset 0 0 0 3px #ffffff;
}

</style>
