<template>
  <AdminNavbar>
    <div v-if="isLoading" :style="loadingContainerStyle">
      <svg class="animate-spin" :style="spinnerStyle" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
      Loading incident report...
    </div>

    <div v-else :style="formWrapperOuterStyle">
      <h1 :style="mainTitleStyle">EDIT INCIDENT REPORT #{{ incidentId }}</h1>

      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">INCIDENT INFORMATION</div>

        <p v-if="submitError" :style="submitError.startsWith('✅') ? successMessageStyle : errorMessageStyle">
          {{ submitError }}
        </p>

        <div v-if="!incidentFound" :style="errorMessageStyle">
          Incident not found or failed to load.
        </div>

        <form v-else @submit.prevent="handleSubmit" :style="incidentFormStyle">
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

          <div :style="{ ...formRowStyle, marginTop: '10px' }">
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
                <option v-for="category in offenseList" :key="category.category_id" :value="category.category_name">
                  {{ category.category_name }}
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
                <option v-for="offense in availableOffenses" :key="offense.offense_id" :value="offense.offense_name">
                  {{ offense.offense_name }}
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
              :style="{...inputStyle(), borderRadius: '20px', minHeight: '88px', resize: 'vertical'}"
            ></textarea>
          </div>

          <div :style="{ ...formRowStyle, justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }">
            <div :style="{ flex: '0 0 auto' }">
              <button
                type="button"
                @click="goBack"
                :style="cancelButtonStyle"
              >Cancel</button>
            </div>
            <div :style="{ flex: '0 0 auto' }">
              <button
                type="submit"
                :disabled="isSubmitting"
                :style="submitButtonStyle"
              >{{ isSubmitting ? 'Updating...' : 'Save Changes' }}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

const route = useRoute();
const router = useRouter();
const incidentId = route.params.id;

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

const offenseList = ref([]); 

const form = reactive({
  studentId: '',
  fullName: '',
  program: '', 
  yearLevel: '',
  section: '', 
  dateOfIncident: '',
  timeOfIncident: '',
  location: '',
  offenseCategory: '', // String name of category
  specificOffense: '', // String name of offense
  description: '',
});

const isLoading = ref(true);
const isSubmitting = ref(false);
const submitError = ref(null);
const incidentFound = ref(true);

const loadingContainerStyle = computed(() => ({
    textAlign: 'center', padding: '50px', color: '#1d3e21', fontWeight: '600', fontSize: '1.1rem', marginTop: '50px',
}));

// Helper to find the Offense ID based on the selected name and category
const getOffenseId = (categoryName, offenseName) => {
    const category = offenseList.value.find(c => c.category_name === categoryName);
    if (!category) return null;
    const offense = category.offenses.find(o => o.offense_name === offenseName);
    return offense ? offense.offense_id : null;
};

// Helper to find the Category ID based on the selected name
const getCategoryId = (categoryName) => {
    const category = offenseList.value.find(c => c.category_name === categoryName);
    return category ? category.category_id : null;
};

// Computed property to filter specific offenses based on the selected category
const availableOffenses = computed(() => {
    const category = offenseList.value.find(c => c.category_name === form.offenseCategory);
    return category ? category.offenses : [];
});

// Watcher for category change to reset specific offense 
watch(() => form.offenseCategory, (newCategory) => {
    const category = offenseList.value.find(c => c.category_name === newCategory);

    // If the new category is null/cleared OR if the currently selected specific offense
    // is NOT found in the new list, reset specificOffense.
    if (!newCategory || (category && form.specificOffense &&
        !category.offenses.some(o => o.offense_name === form.specificOffense))) {
        form.specificOffense = '';
    }
}, { immediate: true });


// 🔑 Function to fetch offense data list (MOCK DATA FOR NOW)
const fetchOffenses = async () => {
    // MOCK DATA: REPLACE with a real API call to your Laravel backend (e.g., GET /offenses/list)
    offenseList.value = [
        { 
            category_id: 1, 
            category_name: 'Minor Offense', 
            offenses: [
                { offense_id: 1, offense_name: 'Failure to wear uniform' },
                { offense_id: 2, offense_name: 'Unauthorized use of school facilities' },
                { offense_id: 3, offense_name: 'Littering' },
                { offense_id: 4, offense_name: 'Eating in restricted areas' },
                { offense_id: 5, offense_name: 'Lending/borrowing ID' },
                { offense_id: 6, offense_name: 'Driving violations' },
            ] 
        },
        { 
            category_id: 2, 
            category_name: 'Major Offense', 
            offenses: [
                { offense_id: 7, offense_name: 'Alcohol/drugs/weapons' },
                { offense_id: 8, offense_name: 'Disrespect' },
                { offense_id: 9, offense_name: 'Vandalism' },
                { offense_id: 10, offense_name: 'Cheating/forgery' },
                { offense_id: 11, offense_name: 'Inciting fight/sedition' },
                { offense_id: 12, offense_name: 'Unauthorized activity' },
            ] 
        }
    ];
};

const fetchIncident = async () => {
  isLoading.value = true;
  incidentFound.value = true;
  submitError.value = null;

  await fetchOffenses(); 

  try {
    const response = await api.get(`/incidents/${incidentId}`);
    const data = response.data.incident; 

    if (!data) {
      incidentFound.value = false;
      return;
    }
    
    // Map fetched data to reactive form fields
    form.studentId = data.student_id;
    // Data accessors are used safely:
    form.fullName = data.student?.first_name + ' ' + data.student?.last_name || ''; 
    form.program = data.student?.program?.code || ''; 
    form.yearLevel = data.student?.year_level || '';
    form.section = data.student?.section || '';
    
    // Time handling (stripping seconds if needed)
    form.dateOfIncident = data.date_of_incident;
    form.timeOfIncident = data.time_of_incident ? data.time_of_incident.substring(0, 5) : ''; 
    
    form.location = data.location;
    
    // Offense fields (mapped via accessors)
    form.offenseCategory = data.category?.name || ''; // Use the related object's name
    form.specificOffense = data.offense?.name || ''; // Use the related object's name
    
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

  // 🔑 CRITICAL: Find the IDs corresponding to the selected names before sending to backend
  const categoryId = getCategoryId(form.offenseCategory);
  const specificOffenseId = getOffenseId(form.offenseCategory, form.specificOffense);

  if (!categoryId || !specificOffenseId) {
    submitError.value = 'Submission failed: Could not map Offense Name to a valid ID. Please ensure both offense category and specific offense are selected.';
    isSubmitting.value = false;
    return;
  }

  // Build payload using camelCase for the Laravel Controller
  const updateData = {
    // Foreign Keys required by Controller (sent as non-null integers)
    categoryId: categoryId,
    specificOffenseId: specificOffenseId,
    studentId: form.studentId, 

    // Incident Details
    dateOfIncident: form.dateOfIncident,
    timeOfIncident: form.timeOfIncident,
    location: form.location,
    description: form.description,

    // Descriptive/Verification fields (included to satisfy Laravel's validation rules, 
    // even if not persisted to the Incident table directly)
    fullName: form.fullName,
    program: form.program, 
    yearLevel: form.yearLevel, 
    section: form.section,
  };

  try {
    const response = await api.put(`/incidents/${incidentId}`, updateData);
    if (response.status === 200) {
      submitError.value = `✅ Incident Report #${incidentId} updated successfully!`;
      // Optional: Refresh the incident data to show fresh recommendations, etc.
      // fetchIncident(); 
      setTimeout(() => router.push({ name: 'AdminIncidents' }), 1500); 
    }
  } catch (error) {
    const responseData = error.response?.data;
    if (responseData && responseData.errors) {
        const errorMessages = Object.values(responseData.errors).flat().join('; ');
        submitError.value = `Update failed: ${errorMessages}`;
    } else {
        submitError.value = responseData?.message || 'Update failed due to server error.';
        console.error("PUT Error Response:", responseData);
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  if (incidentId) await fetchIncident();
  else incidentFound.value = false;
});

const goBack = () => router.push({ name: 'AdminIncidents' });

// STYLES (Cleaned for consistency)
const mainTitleStyle = {
    textAlign: 'center', fontSize: '1.6rem', fontWeight: 'bold', color: '#064b2a', margin: '20px 0 8px 0', letterSpacing: '1px',
};
const formWrapperOuterStyle = {
    maxWidth: '850px', margin: '20px auto 40px auto', padding: '0 10px',
};
const formWrapperInnerStyle = {
    padding: '20px', borderRadius: '24px', backgroundImage: `url(${formBg})`, backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.25)', position: 'relative',
};
const sectionHeaderStyle = {
    position: 'absolute', top: '6px', left: '28px', padding: '6px 18px', background: '#ffffff', borderRadius: '999px', fontWeight: 'bold', fontSize: '0.9rem', zIndex: 2,
};
const incidentFormStyle = {
    background: 'rgba(255,255,255,0.9)', borderRadius: '20px', padding: '30px 25px 25px 25px', display: 'flex', flexDirection: 'column',
};
const labelStyle = {
    display: 'block', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '3px', color: '#1d3e21',
};
const formRowStyle = {
    display: 'flex', gap: '20px', flexWrap: 'wrap',
};
const successMessageStyle = {
    padding: '12px', marginBottom: '15px', borderRadius: '8px', fontWeight: 'bold', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', fontSize: '0.9rem',
};
const errorMessageStyle = {
    padding: '12px', marginBottom: '15px', borderRadius: '8px', fontWeight: 'bold', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', fontSize: '0.9rem',
};
const inputStyle = () => ({
    padding: '10px 14px', height: '40px', border: '1px solid #e0e0e0', borderRadius: '10px', background: '#ffffff', color: '#1d3e21', fontSize: '0.9rem', boxSizing: 'border-box', width: '100%', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', outline: 'none', transition: 'box-shadow 0.15s, border-color 0.15s',
});
const selectStyle = () => ({
    ...inputStyle(), appearance: 'none', cursor: 'pointer',
});
const formGroupStyle = (type) => {
    let width = '100%';
    const marginBottom = '15px'; 
    if (type === 'half') width = 'calc(50% - 10px)';
    else if (type === 'third') width = 'calc(33.333% - 13.333px)'; 
    else if (type === 'quarter') width = 'calc(25% - 15px)';
    return {
        flex: type === 'full' ? '1 1 100%' : `1 1 ${width}`, marginBottom,
    };
};
const submitButtonStyle = {
    padding: '10px 30px', background: '#064b2a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 3px 6px rgba(0,0,0,0.25)', alignSelf: 'flex-end', width: 'auto', textTransform: 'uppercase', transition: 'background-color 0.2s',
};
const cancelButtonStyle = {
    padding: '10px 24px', borderRadius: '10px', border: '1px solid #6b7280', backgroundColor: '#6b7280', color: '#ffffff', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 3px 6px rgba(0,0,0,0.25)', transition: 'background-color 0.2s',
};
</script>

<style scoped>
input:focus, select:focus, textarea:focus {
    border-color: #064b2a !important; 
    box-shadow: 0 0 0 2px rgba(6, 75, 42, 0.4);
}
button:hover:not(:disabled) {
    filter: brightness(110%);
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