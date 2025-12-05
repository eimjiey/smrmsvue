<template>
  <AdminNavbar>
    <h1 :style="mainTitleStyle">EDIT INCIDENT REPORT #{{ incidentId }}</h1>

    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">INCIDENT INFORMATION</div>

        <p v-if="submitError" :style="submitError.value && submitError.value.startsWith('✅') ? successMessageStyle : errorMessageStyle">
          {{ submitError }}
        </p>

        <form v-if="incidentFound" @submit.prevent="handleSubmit" :style="incidentFormStyle">
          <div :style="formRowStyle">
            <div :style="formGroupStyle('half')">
              <label for="studentId" :style="labelStyle">Student ID Number</label>
              <input
                type="text"
                id="studentId"
                v-model="form.studentId"
                required
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
            <div :style="formGroupStyle('half')">
              <label for="fullName" :style="labelStyle">Full Name</label>
              <input
                type="text"
                id="fullName"
                v-model="form.fullName"
                required
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
          </div>
          <div :style="formRowStyle">
            <div :style="formGroupStyle('third')">
              <label for="program" :style="labelStyle">Program</label>
              <input
                type="text"
                id="program"
                v-model="form.program"
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
            <div :style="formGroupStyle('third')">
              <label for="yearLevel" :style="labelStyle">Year Level</label>
              <select
                id="yearLevel"
                v-model="form.yearLevel"
                :disabled="isSubmitting"
                :style="selectStyle()"
              >
                <option v-for="level in yearLevels" :key="level" :value="level">{{ level }}</option>
              </select>
            </div>
            <div :style="formGroupStyle('third')">
              <label for="section" :style="labelStyle">Section</label>
              <input
                type="text"
                id="section"
                v-model="form.section"
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
          </div>
          <div :style="formRowStyle">
            <div :style="formGroupStyle('half')">
              <label for="dateOfIncident" :style="labelStyle">Date of Incident</label>
              <input
                type="date"
                id="dateOfIncident"
                v-model="form.dateOfIncident"
                required
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
            <div :style="formGroupStyle('half')">
              <label for="timeOfIncident" :style="labelStyle">Time of Incident</label>
              <input
                type="time"
                id="timeOfIncident"
                v-model="form.timeOfIncident"
                required
                :disabled="isSubmitting"
                :style="inputStyle()"
              >
            </div>
          </div>
          <div :style="formGroupStyle('full')">
            <label for="location" :style="labelStyle">Location</label>
            <input
              type="text"
              id="location"
              v-model="form.location"
              required
              :disabled="isSubmitting"
              :style="inputStyle()"
            >
          </div>
          <div :style="formRowStyle">
            <div :style="formGroupStyle('half')">
              <label for="offenseCategory" :style="labelStyle">Offense Category</label>
              <select
                id="offenseCategory"
                v-model="form.offenseCategory"
                required
                :disabled="isSubmitting"
                :style="selectStyle()"
              >
                <option v-for="category in offenseCategories" :key="category.name" :value="category.name">
                  {{ category.name }}
                </option>
              </select>
            </div>
            <div :style="formGroupStyle('half')">
              <label for="specificOffense" :style="labelStyle">Specific Offense</label>
              <select
                id="specificOffense"
                v-model="form.specificOffense"
                required
                :disabled="!form.offenseCategory || isSubmitting"
                :style="selectStyle()"
              >
                <option v-for="offense in availableOffenses" :key="offense" :value="offense">
                  {{ offense }}
                </option>
              </select>
            </div>
          </div>
          <div :style="formGroupStyle('full')">
            <label for="description" :style="labelStyle">Description</label>
            <textarea
              id="description"
              v-model="form.description"
              rows="5"
              required
              :disabled="isSubmitting"
              :style="{...inputStyle(), borderRadius: '20px', minHeight: '88px'}"
            ></textarea>
          </div>
          <div :style="formRowStyle">
            <div :style="formGroupStyle('third')">
              <button
                type="button"
                @click="goBack"
                :style="cancelButtonStyle"
              >Cancel</button>
            </div>
            <div :style="formGroupStyle('third')"></div>
            <div :style="formGroupStyle('third')">
              <button
                type="submit"
                :disabled="isSubmitting"
                :style="submitButtonStyle"
              >{{ isSubmitting ? 'Updating...' : 'Save Changes' }}</button>
            </div>
          </div>
        </form>
        <div v-else :style="errorMessageStyle">
          Incident not found or failed to load.
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

const route = useRoute();
const router = useRouter();
const incidentId = route.params.id;

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const offenseCategories = [
  { name: 'Minor Offense', offenses: ['Failure to wear uniform', 'Pornographic materials', 'Littering', 'Loitering', 'Eating in restricted areas', 'Unauthorized use of school facilities', 'Lending/borrowing ID', 'Driving violations'] },
  { name: 'Major Offense', offenses: ['Alcohol/drugs/weapons', 'Smoking', 'Disrespect', 'Vandalism', 'Cheating/forgery', 'Barricades/obstructions', 'Physical/verbal assault', 'Hazing', 'Harassment/sexual abuse', 'Unauthorized software/gadgets', 'Unrecognized fraternity/sorority', 'Gambling', 'Public indecency', 'Offensive/subversive materials', 'Grave threats', 'Inciting fight/sedition', 'Unauthorized activity', 'Bullying'] }
];

const form = reactive({
  studentId: '',
  fullName: '',
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

const isLoading = ref(true);
const isSubmitting = ref(false);
const submitError = ref(null);
const incidentFound = ref(true);

const availableOffenses = computed(() => {
  const category = offenseCategories.find(c => c.name === form.offenseCategory);
  return category ? category.offenses : [];
});

const fetchIncident = async () => {
  isLoading.value = true;
  try {
    const response = await api.get(`/incidents/${incidentId}`);
    const data = response.data;
    if (!data) {
      incidentFound.value = false;
      return;
    }
    form.studentId = data.student_id;
    form.fullName = data.full_name;
    form.program = data.program || '';
    form.yearLevel = data.year_level;
    form.section = data.section || '';
    form.dateOfIncident = data.date_of_incident;
    form.timeOfIncident = data.time_of_incident.substring(0, 5);
    form.location = data.location;
    form.offenseCategory = data.offense_category;
    form.specificOffense = data.specific_offense;
    form.description = data.description;
  } catch (err) {
    incidentFound.value = false;
    submitError.value = `Error loading report: ${err.response?.data?.message || err.message}`;
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  submitError.value = null;
  const updateData = {
    student_id: form.studentId,
    full_name: form.fullName,
    program: form.program,
    year_level: form.yearLevel,
    section: form.section,
    date_of_incident: form.dateOfIncident,
    time_of_incident: form.timeOfIncident,
    location: form.location,
    offense_category: form.offenseCategory,
    specific_offense: form.specificOffense,
    description: form.description,
  };

  try {
    const response = await api.put(`/incidents/${incidentId}`, updateData);
    if (response.status === 200) {
      submitError.value = `✅ Incident Report #${incidentId} updated successfully!`;
      setTimeout(() => router.push({ name: 'AdminIncidents' }), 1500);
    }
  } catch (error) {
    submitError.value = error.response?.data?.message || 'Update failed due to server error.';
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (incidentId) fetchIncident();
  else incidentFound.value = false;
});

const goBack = () => router.push({ name: 'AdminIncidents' });

// STYLES (from AddStudent for consistency)
// Removed conflicting adminDashboardContainerStyle
const mainTitleStyle = {
  textAlign: 'center',
  fontSize: '1.6rem',
  fontWeight: 'bold',
  color: '#198040',
  margin: '20px 0 8px 0', // Centered below topbar/navbar
  letterSpacing: '1px',
};
const formWrapperOuterStyle = {
  maxWidth: '850px',
  margin: '20px auto 40px auto', // Centered horizontally in the green panel
  padding: '0 10px',
};
const formWrapperInnerStyle = {
  padding: '20px',
  borderRadius: '24px',
  backgroundImage: `url(${formBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
  position: 'relative',
};
const sectionHeaderStyle = {
  position: 'absolute',
  top: '6px',
  left: '28px',
  padding: '6px 18px',
  background: '#ffffff',
  borderRadius: '999px',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  zIndex: 2,
};
const incidentFormStyle = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '20px',
  padding: '30px 25px 25px 25px',
  display: 'flex',
  flexDirection: 'column',
};
const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  marginBottom: '3px',
  color: '#1d3e21',
};
const formRowStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};
const successMessageStyle = {
  padding: '8px',
  marginBottom: '10px',
  borderRadius: '4px',
  fontWeight: 'bold',
  backgroundColor: '#d4edda',
  color: '#155724',
  border: '1px solid #c3e6cb',
  fontSize: '0.85rem',
};
const errorMessageStyle = {
  padding: '8px',
  marginBottom: '10px',
  borderRadius: '4px',
  fontWeight: 'bold',
  backgroundColor: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  fontSize: '0.85rem',
};
const inputStyle = () => ({
  padding: '8px 14px',
  height: '38px',
  border: 'none',
  borderRadius: '999px',
  background: '#ffffff',
  color: '#1d3e21',
  fontSize: '0.85rem',
  boxSizing: 'border-box',
  width: '100%',
  fontFamily: 'inherit',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  outline: 'none',
  transition: 'box-shadow 0.15s',
});
const selectStyle = () => ({
  ...inputStyle(),
  appearance: 'none',
  cursor: 'pointer',
});
const formGroupStyle = (type) => {
  let width = '100%';
  const marginBottom = '12px';
  if (type === 'half') width = 'calc(50% - 5px)';
  else if (type === 'third') width = 'calc(33.333% - 7px)';
  else if (type === 'quarter') width = 'calc(25% - 8px)';
  return {
    flex: type === 'full' ? '1 1 100%' : `1 1 ${width}`,
    marginBottom,
  };
};
const submitButtonStyle = {
  marginTop: '1.2rem',
  padding: '10px 30px',
  background: '#064b2a',
  color: '#ffffff',
  border: 'none',
  borderRadius: '10px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
  alignSelf: 'flex-end',
  width: 'auto',
  textTransform: 'uppercase',
};
const cancelButtonStyle = {
  padding: '10px 24px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#6b7280',
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  cursor: 'pointer',
  boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
};
</script>

<style scoped>
input:focus, select:focus, textarea:focus {
  box-shadow: 0 0 0 2px #0e7bff;
}
/* Custom select arrow styling */
select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 1.2em;
    padding-right: 30px !important;
}
</style>