<template>
  <AdminNavbar>
    <div class="misconduct-page">
      <!-- Top banner -->
      <header class="misconduct-header">
        <div>
          <h1>MISCONDUCT CERTIFICATE</h1>
          <p>
            Fill out the details below to log a new incident and generate the required
            disciplinary action document.
          </p>
        </div>
        <div class="misconduct-header__pill"></div>
      </header>

      <!-- Notifier -->
      <transition name="status-bar">
        <div v-if="message" class="status-bar">
          <div
            class="status-bar__inner"
            :class="isSuccess ? 'status-bar__inner--success' : 'status-bar__inner--error'"
          >
            {{ message }}
          </div>
        </div>
      </transition>

      <!-- Card -->
      <section class="misconduct-card">
        <div class="misconduct-card__inner">
          <!-- Section label -->
          <div class="section-title-row">
            <span class="section-title">MISCONDUCT RECORD</span>
          </div>

          <form @submit.prevent="generateCertificate" class="misconduct-form">
            <!-- SELECT STUDENT -->
            <div class="form-row">
              <div class="field field--full">
                <label for="student">SELECT A STUDENT</label>
                <select
                  id="student"
                  v-model="selectedStudent"
                  class="pill-input"
                  required
                >
                  <option disabled :value="null">-- Select a student --</option>
                  <option
                    v-for="student in students"
                    :key="student.id"
                    :value="student"
                  >
                    {{ student.full_name }}
                  </option>
                </select>
                <small v-if="validationErrors.student_name">
                  {{ validationErrors.student_name[0] }}
                </small>
              </div>
            </div>

            <!-- OFFENSE TYPE -->
            <div class="form-row">
              <div class="field field--full">
                <label for="offense_type">OFFENSE TYPE</label>
                <input
                  id="offense_type"
                  type="text"
                  v-model="offenseDetails.offense_type"
                  class="pill-input"
                  placeholder="e.g., Academic dishonesty"
                  required
                />
                <small v-if="validationErrors.offense_type">
                  {{ validationErrors.offense_type[0] }}
                </small>
              </div>
            </div>

            <!-- STATUS + DATE OF INCIDENT -->
            <div class="form-row form-row--two">
              <div class="field">
                <label for="status">STATUS</label>
                <select
                  id="status"
                  v-model="offenseDetails.status"
                  class="pill-input"
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div class="field">
                <label for="date_of_incident">DATE OF INCIDENT</label>
                <input
                  id="date_of_incident"
                  type="date"
                  v-model="offenseDetails.date_of_incident"
                  class="pill-input"
                  required
                />
                <small v-if="validationErrors.date_of_incident">
                  {{ validationErrors.date_of_incident[0] }}
                </small>
              </div>
            </div>

            <!-- DISCIPLINARY ACTION -->
            <div class="form-row">
              <div class="field field--full">
                <label for="disciplinary_action">DISCIPLINARY ACTION</label>
                <textarea
                  id="disciplinary_action"
                  v-model="offenseDetails.disciplinary_action"
                  class="pill-textarea"
                  rows="4"
                  placeholder="Describe the disciplinary action taken or recommended."
                  required
                ></textarea>
                <small v-if="validationErrors.disciplinary_action">
                  {{ validationErrors.disciplinary_action[0] }}
                </small>
              </div>
            </div>

            <!-- Buttons -->
            <div class="form-actions">
              <button
                type="submit"
                class="btn-primary"
                :disabled="isLoading || !selectedStudent"
              >
                {{ isLoading ? 'GENERATING...' : 'GENERATE RECORD' }}
              </button>

              <button
                v-if="certificateId"
                type="button"
                class="btn-secondary"
                @click="initiateDownload"
              >
                DOWNLOAD RECORD
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

const students = ref([]);
const selectedStudent = ref(null);
const certificateId = ref(null);
const isLoading = ref(false);
const message = ref('');
const isSuccess = ref(true);
const validationErrors = ref({});

const offenseDetails = ref({
  offense_type: '',
  date_of_incident: new Date().toISOString().slice(0, 10),
  disciplinary_action: '',
  status: 'Pending',
  school_name: 'Isabela State University',
  school_location: 'Echague, Isabela',
  official_name: 'Dr. Maria S. Reyes',
  official_position: 'Dean of Student Affairs',
});

const downloadUrl = computed(() => {
  if (!certificateId.value) return '#';
  const baseUrl = api.instance?.defaults?.baseURL || '';
  const serverUrl = baseUrl.replace(/\/api\/?$/, '');
  return `${serverUrl}/certificates/download/${certificateId.value}`;
});

function setMessage(msg, success = true) {
  message.value = msg;
  isSuccess.value = success;
  if (!success) certificateId.value = null;
  validationErrors.value = {};
  setTimeout(() => (message.value = ''), 6000);
}

async function fetchStudents() {
  try {
    const res = await api.get('/students/dropdown');
    students.value = res.data || [];
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || 'Failed to load students for selection.';
    setMessage(errorMessage, false);
  }
}

function initiateDownload() {
  if (!downloadUrl.value || downloadUrl.value === '#') {
    setMessage('Error: Download link is not ready.', false);
    return;
  }
  window.location.href = downloadUrl.value;
  setMessage("Download started. Check your browser's downloads.", true);
}

async function generateCertificate() {
  if (!selectedStudent.value) return setMessage('Please select a student.', false);
  if (!offenseDetails.value.offense_type)
    return setMessage('Please enter an offense type.', false);
  if (!offenseDetails.value.date_of_incident)
    return setMessage('Please select a date of incident.', false);
  if (!offenseDetails.value.disciplinary_action)
    return setMessage('Please enter disciplinary action details.', false);

  isLoading.value = true;
  certificateId.value = null;
  validationErrors.value = {};

  try {
    const payload = {
      student_name: selectedStudent.value.full_name,
      student_id: selectedStudent.value.student_id
        ? String(selectedStudent.value.student_id)
        : '',
      program_grade: selectedStudent.value.program || 'BS Computer Science',
      offense_type: offenseDetails.value.offense_type.trim(),
      date_of_incident: offenseDetails.value.date_of_incident,
      disciplinary_action: offenseDetails.value.disciplinary_action.trim(),
      status: offenseDetails.value.status,
      issued_date: new Date().toISOString().slice(0, 10),
      school_name: offenseDetails.value.school_name.trim(),
      school_location: offenseDetails.value.school_location.trim(),
      official_name: offenseDetails.value.official_name.trim(),
      official_position: offenseDetails.value.official_position.trim(),
    };

    const res = await api.post('/certificates', payload);

    if (res.data && res.data.id && res.data.certificate_number) {
      certificateId.value = res.data.id;
      setMessage(
        `Certificate ${res.data.certificate_number} generated successfully. You may now download it.`,
        true
      );
    } else {
      setMessage('Generation succeeded but response was unexpected.', false);
    }
  } catch (err) {
    if (err.response && err.response.status === 422) {
      validationErrors.value = err.response.data.errors;
      setMessage('Validation failed. Please check the fields.', false);
    } else {
      setMessage('Server error or network issue.', false);
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchStudents);
</script>

<style scoped>
.misconduct-page {
  min-height: 100vh;
  padding: 24px;
  background-color: #74a765;
  box-sizing: border-box;
}

/* Header */
.misconduct-header {
  background-color: #e1f3d5;
  border-radius: 16px;
  padding: 16px 24px;
  color: #0b3a23;
  margin-bottom: 16px;
}

.misconduct-header h1 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
}

.misconduct-header p {
  margin: 0;
  font-size: 0.85rem;
}

.misconduct-header__pill {
  margin-top: 12px;
  width: 100%;
  height: 32px;
  border-radius: 999px;
  background-color: #dfead6;
}

/* Notifier */
.status-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.status-bar__inner {
  max-width: 900px;
  width: 100%;
  border-radius: 20px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

.status-bar__inner--success {
  background-color: #e9f8e4;
  color: #155724;
  box-shadow: inset 0 0 0 4px #003b23;
}

.status-bar__inner--error {
  background-color: #f8d7da;
  color: #721c24;
  box-shadow: inset 0 0 0 4px #721c24;
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

/* Card */
.misconduct-card {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.misconduct-card__inner {
  width: 760px;
  background-color: #0b3a23;
  border-radius: 22px;
  padding: 10px;
}

.misconduct-form {
  background-color: #e1f3d5;
  border-radius: 18px;
  padding: 26px 26px 22px 26px;
}

/* Title inside card */
.section-title-row {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #0b3a23;
}

/* Form layout */
.form-row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.form-row--two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.field--full {
  width: 100%;
}

.field label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0b3a23;
  margin-bottom: 4px;
}

/* Inputs */
.pill-input {
  height: 38px;
  border-radius: 999px;
  border: none;
  padding: 8px 14px;
  font-size: 0.85rem;
  background-color: #ffffff;
  color: #0b3a23;
  box-sizing: border-box;
  outline: none;
}

.pill-textarea {
  border-radius: 20px;
  border: none;
  padding: 10px 16px;
  font-size: 0.85rem;
  background-color: #ffffff;
  color: #0b3a23;
  resize: none;
  min-height: 100px;
  box-sizing: border-box;
  outline: none;
}

/* select arrow */
select.pill-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 1.1em;
  padding-right: 30px;
}

/* validation text */
.field small {
  margin-top: 3px;
  font-size: 0.7rem;
  color: #d9534f;
}

/* Buttons */
.form-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  padding: 8px 26px;
  border-radius: 999px;
  border: none;
  background-color: #0b3a23;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 7px 22px;
  border-radius: 999px;
  border: none;
  background-color: #0b6b4f;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  cursor: pointer;
}

/* focus ring */
input:focus,
select:focus,
textarea:focus {
  box-shadow: 0 0 0 2px #0e7bff;
}
</style>
