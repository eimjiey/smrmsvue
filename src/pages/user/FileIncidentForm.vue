<template>
  <div class="report-page">
    <!-- Green header strip reused -->
    <div class="hero">
      <UserNavbar />
      <h1 class="hero-title">MISCONTRACK</h1>
        <p class="hero-subtitle">
          Providing a Smarter Approach and Secure Reporting You Can Rely On.
        </p>
    </div>

    <!-- Centered glass card wrapper like AddStudent -->
    <div class="card-outer">
      <div class="card-inner">
        <div class="section-header">REPORT AN INCIDENT</div>

        <div v-if="isSubmitting" class="submission-status submission-loading">
          Submitting report... Please wait.
        </div>

        <div v-else-if="submitError" class="submission-status submission-error">
          🚨 {{ submitError }}
        </div>

        <!-- White inner form card -->
        <form @submit.prevent="handleSubmit" class="incident-form">
          <!-- Student ID -->
          <div class="form-row">
            <div class="form-group full">
              <label for="studentId" class="label">Student ID</label>
              <input
                type="text"
                id="studentId"
                v-model="form.studentNumber"
                disabled
                required
                class="input pill auto-filled"
              />
              <p v-if="studentsLoadError" class="lookup-status lookup-error">
                ❌ {{ studentsLoadError }}
              </p>
              <p
                v-if="validationErrors.studentNumber"
                class="error-message"
              >
                {{ validationErrors.studentNumber[0] }}
              </p>
            </div>
          </div>

          <!-- Full name select -->
          <div class="form-row">
            <div class="form-group full">
              <label for="fullNameSelect" class="label">
                Full Name (Select Student)
              </label>

              <template v-if="isStudentsLoading">
                <input
                  type="text"
                  disabled
                  value="Loading student roster from database..."
                  class="input pill loading-input"
                />
              </template>

              <template v-else>
                <select
                  id="fullNameSelect"
                  v-model="form.studentId"
                  :disabled="isSubmitting"
                  required
                  class="input pill select"
                >
                  <option value="" disabled>Select Student Name</option>
                  <option
                    v-for="student in allStudents"
                    :key="student.id"
                    :value="student.id"
                  >
                    {{ student.full_name }}
                  </option>
                </select>
              </template>

              <p
                v-if="validationErrors.studentId"
                class="error-message"
              >
                {{ validationErrors.studentId[0] }}
              </p>
            </div>
          </div>

          <!-- Program / Year / Section -->
          <div class="form-row">
            <div class="form-group third">
              <label for="program" class="label">Program</label>
              <input
                type="text"
                id="program"
                v-model="form.program"
                disabled
                required
                class="input pill auto-filled"
              />
              <p
                v-if="validationErrors.program"
                class="error-message"
              >
                {{ validationErrors.program[0] }}
              </p>
            </div>

            <div class="form-group third">
              <label for="yearLevel" class="label">Year Level</label>
              <input
                type="text"
                id="yearLevel"
                v-model="form.yearLevel"
                disabled
                required
                class="input pill auto-filled"
              />
              <p
                v-if="validationErrors.yearLevel"
                class="error-message"
              >
                {{ validationErrors.yearLevel[0] }}
              </p>
            </div>

            <div class="form-group third">
              <label for="section" class="label">Section</label>
              <input
                type="text"
                id="section"
                v-model="form.section"
                disabled
                class="input pill auto-filled"
              />
              <p
                v-if="validationErrors.section"
                class="error-message"
              >
                {{ validationErrors.section[0] }}
              </p>
            </div>
          </div>

          <!-- Location / Date / Time -->
          <div class="form-row">
            <div class="form-group half">
              <label for="location" class="label">Location</label>
              <input
                type="text"
                id="location"
                v-model="form.location"
                required
                class="input pill"
              />
              <p
                v-if="validationErrors.location"
                class="error-message"
              >
                {{ validationErrors.location[0] }}
              </p>
            </div>

            <div class="form-group quarter">
              <label for="dateOfIncident" class="label">Date of Incident</label>
              <input
                type="date"
                id="dateOfIncident"
                v-model="form.dateOfIncident"
                required
                class="input pill"
              />
              <p
                v-if="validationErrors.dateOfIncident"
                class="error-message"
              >
                {{ validationErrors.dateOfIncident[0] }}
              </p>
            </div>

            <div class="form-group quarter">
              <label for="timeOfIncident" class="label">Time of Incident</label>
              <input
                type="time"
                id="timeOfIncident"
                v-model="form.timeOfIncident"
                required
                class="input pill"
              />
              <p
                v-if="validationErrors.timeOfIncident"
                class="error-message"
              >
                {{ validationErrors.timeOfIncident[0] }}
              </p>
            </div>
          </div>

          <!-- Offense Category / Specific Offense -->
          <div class="form-row">
            <div class="form-group half">
              <label for="offenseCategory" class="label">Offense Category</label>
              <select
                id="offenseCategory"
                v-model="form.offenseCategory"
                required
                class="input pill select"
              >
                <option value="" disabled>Select Category</option>
                <option value="Minor Offense">Minor Offense</option>
                <option value="Major Offense">Major Offense</option>
              </select>
              <p
                v-if="validationErrors.offenseCategory"
                class="error-message"
              >
                {{ validationErrors.offenseCategory[0] }}
              </p>
            </div>

            <div class="form-group half">
              <label for="specificOffense" class="label">Specific Offense</label>
              <select
                id="specificOffense"
                v-model="form.specificOffense"
                :disabled="!form.offenseCategory"
                required
                class="input pill select"
              >
                <option value="" disabled>
                  {{ form.offenseCategory
                    ? 'Select specific offense'
                    : 'Select category first' }}
                </option>
                <option
                  v-for="offense in filteredSpecificOffenses"
                  :key="offense"
                  :value="offense"
                >
                  {{ offense }}
                </option>
              </select>
              <p
                v-if="validationErrors.specificOffense"
                class="error-message"
              >
                {{ validationErrors.specificOffense[0] }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <div class="form-row">
            <div class="form-group full">
              <label for="description" class="label">Description</label>
              <textarea
                id="description"
                v-model="form.description"
                required
                class="textarea pill-textarea"
              ></textarea>
              <p
                v-if="validationErrors.description"
                class="error-message"
              >
                {{ validationErrors.description[0] }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-row actions-row">
            <button
              type="button"
              class="btn btn-cancel"
              @click="resetForm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-save"
              :disabled="isSubmitting || isStudentsLoading || !form.studentId"
            >
              {{ isSubmitting ? 'Filing...' : 'Save Incident' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Notifier -->
    <div
      v-if="notifier.visible"
      class="notifier"
      :class="{
        'notifier-success': notifier.type === 'success',
        'notifier-error': notifier.type === 'error'
      }"
    >
      <div v-if="notifier.type === 'success'" class="recommendation-content">
        <p class="notification-title">
          ✅ Report Filed! System Recommendation:
        </p>
        <div class="recommendation-box">
          <strong>{{ recommendationText }}</strong>
        </div>
        <div class="notifier-actions">
          <button @click="resetNotifier" class="btn-notifier-close">
            File New
          </button>
          <button @click="navigateToDetails" class="btn-notifier-view">
            View Details
          </button>
        </div>
      </div>
      <div v-else>
        {{ notifier.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserNavbar from '@/components/UserNavbar.vue';
import api from '@/services/api';

const router = useRouter();

/* --------- STUDENT DATA --------- */
const allStudents = ref([]);
const isStudentsLoading = ref(true);
const studentsLoadError = ref(null);

/* --------- OFFENSE OPTIONS --------- */
const specificOffenseOptions = {
  'Minor Offense': [
    'Failure to wear uniform',
    'Pornographic materials',
    'Littering',
    'Loitering',
    'Eating in restricted areas',
    'Unauthorized use of school facilities',
    'Lending/borrowing ID',
    'Driving violations',
  ],
  'Major Offense': [
    'Alcohol/drugs/weapons',
    'Smoking',
    'Disrespect',
    'Vandalism',
    'Cheating/forgery',
    'Barricades/obstructions',
    'Physical/verbal assault',
    'Hazing',
    'Harassment/sexual abuse',
    'Unauthorized software/gadgets',
    'Unrecognized fraternity/sorority',
    'Gambling',
    'Public indecency',
    'Offensive/subversive materials',
    'Grave threats',
    'Inciting fight/sedition',
    'Unauthorized activity',
    'Bullying',
  ],
};

/* --------- FORM STATE --------- */
const form = reactive({
  studentId: '',
  studentNumber: '',
  program: '',
  yearLevel: '',
  section: '',
  dateOfIncident: '',
  timeOfIncident: '',
  location: '',
  offenseCategory: '',
  specificOffense: '',
  description: '',
});

/* --------- SUBMISSION / VALIDATION STATE --------- */
const isSubmitting = ref(false);
const submitError = ref(null);
const validationErrors = ref({});

/* --------- NOTIFIER STATE --------- */
const notifier = reactive({
  visible: false,
  message: '',
  type: 'success',
});
const recommendationText = ref('');
const newIncidentId = ref(null);

/* --------- COMPUTED --------- */
const filteredSpecificOffenses = computed(() => {
  const category = form.offenseCategory;
  return specificOffenseOptions[category] || [];
});

/* --------- DATA FETCH --------- */
const fetchAllStudents = async () => {
  isStudentsLoading.value = true;
  studentsLoadError.value = null;
  try {
    const response = await api.get('/students/dropdown');
    allStudents.value = response.data || [];
  } catch (e) {
    studentsLoadError.value =
      'Failed to load student roster. Check API configuration or server logs.';
    console.error(e.response?.data?.error || e);
  } finally {
    isStudentsLoading.value = false;
  }
};

onMounted(fetchAllStudents);

/* --------- WATCHERS --------- */
watch(
  () => form.studentId,
  newId => {
    if (!newId) {
      form.studentNumber = '';
      form.program = '';
      form.yearLevel = '';
      form.section = '';
      return;
    }
    const selectedStudent = allStudents.value.find(s => s.id === newId);
    if (selectedStudent) {
      form.studentNumber =
        selectedStudent.student_number || selectedStudent.student_id || '';
      form.program = selectedStudent.program || '';
      form.yearLevel = selectedStudent.year_level || '';
      form.section = selectedStudent.section || '';
      studentsLoadError.value = null;
    } else {
      form.studentNumber = '';
      form.program = '';
      form.yearLevel = '';
      form.section = '';
      studentsLoadError.value = 'Selected student details are missing.';
    }
  }
);

watch(
  () => form.offenseCategory,
  (newCategory, oldCategory) => {
    if (newCategory !== oldCategory) form.specificOffense = '';
  }
);

/* --------- NOTIFIER HELPERS --------- */
const showNotifier = (message, type = 'success', duration = 3000) => {
  notifier.message = message;
  notifier.type = type;
  notifier.visible = true;
  if (type === 'error') {
    setTimeout(() => {
      notifier.visible = false;
    }, duration);
  }
};

const resetNotifier = () => {
  notifier.visible = false;
  resetForm();
};

const resetForm = () => {
  form.studentId = '';
  form.studentNumber = '';
  form.program = '';
  form.yearLevel = '';
  form.section = '';
  form.dateOfIncident = '';
  form.timeOfIncident = '';
  form.location = '';
  form.offenseCategory = '';
  form.specificOffense = '';
  form.description = '';
  studentsLoadError.value = null;
  validationErrors.value = {};
  submitError.value = null;
};

/* --------- NAVIGATION --------- */
const navigateToDetails = () => {
  if (newIncidentId.value) {
    router.push({ name: 'ReportDetails', params: { id: newIncidentId.value } });
  }
  resetNotifier();
};

/* --------- SUBMIT --------- */
const handleSubmit = async () => {
  submitError.value = null;
  validationErrors.value = {};

  if (isStudentsLoading.value) {
    submitError.value = 'Please wait for student roster to finish loading.';
    showNotifier(submitError.value, 'error', 3000);
    return;
  }

  const selectedStudent = allStudents.value.find(s => s.id === form.studentId);
  const fullName = selectedStudent?.full_name || '';

  const requiredFields = [
    'studentId',
    'studentNumber',
    'program',
    'yearLevel',
    'dateOfIncident',
    'timeOfIncident',
    'location',
    'offenseCategory',
    'specificOffense',
    'description',
  ];
  const missing = requiredFields.filter(
    f => !form[f] || String(form[f]).trim() === ''
  );
  if (missing.length) {
    submitError.value = 'Please fill out all required fields.';
    showNotifier(submitError.value, 'error', 3000);
    return;
  }

  isSubmitting.value = true;

  const payload = {
    student_id: form.studentNumber,
    offenseCategory: form.offenseCategory,
    specificOffense: form.specificOffense,
    dateOfIncident: form.dateOfIncident,
    timeOfIncident: form.timeOfIncident,
    location: form.location,
    description: form.description,
    fullName: fullName,
    program: form.program,
    yearLevel: form.yearLevel,
    section: form.section,
    actionTaken: null,
  };

  try {
    const response = await api.post('/incidents', payload);
    const data = response.data;
    recommendationText.value =
      data.recommendation || 'The case has been filed and is awaiting review.';
    newIncidentId.value = data.incident?.id || null;
    showNotifier('✅ Incident Successfully Reported!', 'success', 60000);
  } catch (error) {
    let msg = 'An unexpected error occurred.';
    if (error.response) {
      if (error.response.status === 422) {
        validationErrors.value = error.response.data.errors || {};
        msg =
          error.response.data.message ||
          'Validation failed. Please correct the highlighted fields.';
      } else if (error.response.data?.message) {
        msg = error.response.data.message;
      } else {
        msg = `Server Error (${error.response.status}).`;
      }
    } else {
      msg = 'Network Error: Could not connect to the API server.';
    }
    submitError.value = msg;
    showNotifier(msg, 'error', 5000);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.report-page {
  min-height: 100vh;
  background-color: #cfe9c1;
  display: flex;
  flex-direction: column;
}

.hero {
  background-color: #78ae63;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  padding-bottom: 30px;
}

.hero-title {
  margin: 0;
  padding: 18px 0 0;
  text-align: center;
  color: #0e5821;
  font-size: 22px;
  font-weight: 700;
}

/* Outer card wrapper like AddStudent */
.card-outer {
  max-width: 860px;
  margin: 24px auto 40px auto;
  padding: 0 12px;
}

.card-inner {
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(180deg, #f4faf8 0%, #e4f3ec 40%, #d7ecdf 100%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  position: relative;
}

/* Floating section header pill */
.section-header {
  position: absolute;
  top: 6px;
  left: 28px;
  padding: 6px 18px;
  background: #ffffff;
  border-radius: 999px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #1d3e21;
  z-index: 2;
}

/* Inner white form card */
.incident-form {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px 24px 24px 24px;
  display: flex;
  flex-direction: column;
}

/* Grid-style layout */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 4px;
  flex: 1 1 100%;
}

.form-group.full {
  flex: 1 1 100%;
}

.form-group.half {
  flex: 1 1 calc(50% - 5px);
}

.form-group.third {
  flex: 1 1 calc(33.333% - 7px);
}

.form-group.quarter {
  flex: 1 1 calc(25% - 8px);
}

/* Labels and inputs styled like AddStudent */
.label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 3px;
  color: #1d3e21;
}

.input {
  width: 100%;
  padding: 8px 14px;
  font-size: 0.9rem;
  box-sizing: border-box;
  border: none;
  outline: none;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.pill {
  border-radius: 999px;
}

.auto-filled {
  background-color: #f0fff0;
}

.textarea {
  width: 100%;
  min-height: 140px;
  padding: 10px 16px;
  font-size: 0.9rem;
  border: none;
  outline: none;
  resize: vertical;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.pill-textarea {
  border-radius: 16px;
}

/* Select custom arrow */
.select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 1.2em;
  padding-right: 30px;
}

/* Messages */
.submission-status {
  margin-bottom: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 8px 10px;
  border-radius: 6px;
}

.submission-loading {
  background-color: #fffbe6;
  border: 1px solid #ffcc00;
  color: #a07e00;
}

.submission-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.error-message {
  color: #d9534f;
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Actions row */
.actions-row {
  justify-content: flex-end;
  margin-top: 12px;
  gap: 10px;
}

.btn {
  padding: 10px 24px;
  border-radius: 10px;
  border: none;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
}

.btn-save {
  background-color: #064b2a;
  color: #ffffff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
}

.btn-cancel {
  background-color: #778899;
  color: #ffffff;
}

/* Notifier */
.notifier {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Responsive */
@media (max-width: 768px) {
  .card-outer {
    margin: 16px auto 32px auto;
    padding: 0 10px;
  }

  .incident-form {
    padding: 22px 16px 18px 16px;
  }

  .form-group.half,
  .form-group.third,
  .form-group.quarter {
    flex: 1 1 100%;
  }

  .hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 0;
  text-align: center;
}

.hero-hello {
  margin-top: 20px;
  font-size: 2rem;
  letter-spacing: 2px;
  color: #0e5821;
}

.hero-title {
  color: #0e5821;
  font-size: 2.4rem;
  letter-spacing: 3px;
  margin: 10px 0 10px;
  font-weight: 800;
}

.hero-subtitle {
  color: #f7fff4;
  font-size: 0.95rem;
}
}
</style>
