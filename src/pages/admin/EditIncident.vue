<template>
  <AdminNavbar>
    <!-- loading state -->
    <div v-if="isLoading" :style="loadingContainerStyle">
      <svg class="animate-spin" :style="spinnerStyle" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading incident report...
    </div>

    <!-- main layout -->
    <div v-else :style="pageStyle">
      <!-- top banner -->
      <div :style="bannerStyle">
        <div>
          <h1 :style="bannerTitleStyle">EDIT INCIDENT REPORT #{{ incidentId }}</h1>
          <p :style="bannerSubtitleStyle">
            Please fill out all required fields to update this record.
          </p>
        </div>
        <div :style="bannerPillStyle"></div>
      </div>

      <!-- framed form -->
      <div :style="frameOuterStyle">
        <div :style="frameInnerStyle">
          <div :style="sectionTitleBarStyle">
            INCIDENT INFORMATION
          </div>

          <p
            v-if="submitError"
            :style="submitError.startsWith('✅') ? successMessageStyle : errorMessageStyle"
          >
            {{ submitError }}
          </p>

          <div v-if="!incidentFound" :style="errorMessageStyle">
            Incident not found or failed to load.
          </div>

          <form v-else @submit.prevent="handleSubmit" :style="formStyle">
            <!-- student + name + program + section -->
            <div :style="formRowStyle">
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">STUDENT ID</label>
                <input
                  type="text"
                  v-model="form.studentId"
                  required
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">FULL NAME</label>
                <input
                  type="text"
                  v-model="form.fullName"
                  required
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">PROGRAM</label>
                <input
                  type="text"
                  v-model="form.program"
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">SECTION</label>
                <input
                  type="text"
                  v-model="form.section"
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
            </div>

            <!-- year level + date/time + location -->
            <div :style="formRowStyle">
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">YEAR LEVEL</label>
                <select
                  v-model="form.yearLevel"
                  :disabled="isSubmitting"
                  :style="selectStyle()"
                >
                  <option v-for="level in yearLevels" :key="level" :value="level">
                    {{ level }}
                  </option>
                </select>
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">DATE OF INCIDENT</label>
                <input
                  type="date"
                  v-model="form.dateOfIncident"
                  required
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">TIME OF INCIDENT</label>
                <input
                  type="time"
                  v-model="form.timeOfIncident"
                  required
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
              <div :style="formGroupStyle('quarter')">
                <label :style="labelStyle">LOCATION</label>
                <input
                  type="text"
                  v-model="form.location"
                  required
                  :disabled="isSubmitting"
                  :style="inputStyle()"
                />
              </div>
            </div>

            <!-- offense fields -->
            <div :style="formRowStyle">
              <div :style="formGroupStyle('half')">
                <label :style="labelStyle">OFFENSE CATEGORY</label>
                <select
                  v-model="form.offenseCategory"
                  required
                  :disabled="isSubmitting"
                  :style="selectStyle()"
                >
                  <option
                    v-for="category in offenseList"
                    :key="category.category_id"
                    :value="category.category_name"
                  >
                    {{ category.category_name }}
                  </option>
                </select>
              </div>
              <div :style="formGroupStyle('half')">
                <label :style="labelStyle">SPECIFIC OFFENSE</label>
                <select
                  v-model="form.specificOffense"
                  required
                  :disabled="!form.offenseCategory || isSubmitting"
                  :style="selectStyle()"
                >
                  <option
                    v-for="offense in availableOffenses"
                    :key="offense.offense_id"
                    :value="offense.offense_name"
                  >
                    {{ offense.offense_name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- description -->
            <div :style="formGroupStyle('full')">
              <label :style="labelStyle">DESCRIPTION</label>
              <textarea
                v-model="form.description"
                rows="5"
                required
                :disabled="isSubmitting"
                :style="textareaStyle"
              ></textarea>
            </div>

            <!-- actions -->
            <div :style="actionsRowStyle">
              <button
                type="button"
                @click="goBack"
                :style="cancelButtonStyle"
              >
                CANCEL
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                :style="submitButtonStyle"
              >
                {{ isSubmitting ? 'UPDATING…' : 'SAVE CHANGES' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { reactive, computed, ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

const route = useRoute();
const router = useRouter();
const incidentId = route.params.id;

const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

const offenseList = ref([]); // list of categories + offenses

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

// loading styles
const loadingContainerStyle = {
  textAlign: 'center',
  padding: '50px',
  color: '#1d3e21',
  fontWeight: '600',
  fontSize: '1.1rem',
  marginTop: '50px',
};
const spinnerStyle = {
  width: '32px',
  height: '32px',
  marginBottom: '8px',
  color: '#14532d',
};

// layout (green add‑record style)[web:45][web:47]
const pageStyle = {
  maxWidth: '100%',
  minHeight: '100vh',
  margin: '0',
  padding: '24px 40px 40px 40px',
  background: '#74a765',
  boxSizing: 'border-box',
};

// banner
const bannerStyle = {
  background: '#dcf4d7',
  borderRadius: '18px',
  padding: '20px 28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '18px',
};
const bannerTitleStyle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  letterSpacing: '0.06em',
  color: '#0a3315',
};
const bannerSubtitleStyle = {
  marginTop: '6px',
  fontSize: '0.9rem',
  color: '#14532d',
};
const bannerPillStyle = {
  width: '220px',
  height: '38px',
  borderRadius: '999px',
  background: '#cbeec3',
};

// outer frame
const frameOuterStyle = {
  borderRadius: '24px',
  background: '#0d4a25',
  padding: '10px',
};
const frameInnerStyle = {
  borderRadius: '20px',
  background: '#e9f9e5',
  padding: '24px 26px 28px 26px',
  boxSizing: 'border-box',
};

// section title bar
const sectionTitleBarStyle = {
  fontWeight: '800',
  fontSize: '1rem',
  color: '#0a3315',
  marginBottom: '18px',
  paddingBottom: '6px',
  borderBottom: '2px solid #c4e6bc',
};

// form layout
const formStyle = {
  background: '#f4fff2',
  borderRadius: '18px',
  padding: '22px 20px 20px 20px',
  boxSizing: 'border-box',
};
const formRowStyle = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
  marginBottom: '14px',
};
const formGroupStyle = type => {
  let basis = '100%';
  if (type === 'half') basis = 'calc(50% - 8px)';
  else if (type === 'third') basis = 'calc(33.333% - 11px)';
  else if (type === 'quarter') basis = 'calc(25% - 12px)';
  return { flex: `1 1 ${basis}`, marginBottom: '6px' };
};
const labelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: '800',
  letterSpacing: '0.08em',
  color: '#0a3315',
  textTransform: 'uppercase',
  marginBottom: '4px',
};

const baseInput = {
  padding: '10px 14px',
  height: '38px',
  borderRadius: '999px',
  border: '1px solid #d1e6cf',
  background: '#ffffff',
  fontSize: '0.9rem',
  color: '#0a3315',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
};
const inputStyle = () => ({
  ...baseInput,
});
const selectStyle = () => ({
  ...baseInput,
  appearance: 'none',
  cursor: 'pointer',
});
const textareaStyle = {
  ...baseInput,
  borderRadius: '20px',
  minHeight: '88px',
  resize: 'vertical',
  height: 'auto',
  paddingTop: '10px',
};

// messages
const successMessageStyle = {
  padding: '10px 14px',
  marginBottom: '12px',
  borderRadius: '10px',
  fontWeight: '600',
  backgroundColor: '#d1fae5',
  color: '#065f46',
  border: '1px solid #a7f3d0',
  fontSize: '0.9rem',
};
const errorMessageStyle = {
  padding: '10px 14px',
  marginBottom: '12px',
  borderRadius: '10px',
  fontWeight: '600',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  border: '1px solid #fecaca',
  fontSize: '0.9rem',
};

// actions
const actionsRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '20px',
};
const cancelButtonStyle = {
  padding: '10px 28px',
  borderRadius: '999px',
  border: '1px solid #14532d',
  background: '#ffffff',
  color: '#14532d',
  fontWeight: '700',
  fontSize: '0.85rem',
  cursor: 'pointer',
};
const submitButtonStyle = {
  padding: '10px 32px',
  borderRadius: '999px',
  border: 'none',
  background: '#0b3b1c',
  color: '#ffffff',
  fontWeight: '800',
  fontSize: '0.9rem',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

// offense helpers
const getOffenseId = (categoryName, offenseName) => {
  const category = offenseList.value.find(c => c.category_name === categoryName);
  if (!category) return null;
  const offense = category.offenses.find(o => o.offense_name === offenseName);
  return offense ? offense.offense_id : null;
};
const getCategoryId = categoryName => {
  const category = offenseList.value.find(c => c.category_name === categoryName);
  return category ? category.category_id : null;
};

const availableOffenses = computed(() => {
  const category = offenseList.value.find(c => c.category_name === form.offenseCategory);
  return category ? category.offenses : [];
});

watch(
  () => form.offenseCategory,
  newCategory => {
    const category = offenseList.value.find(c => c.category_name === newCategory);
    if (
      !newCategory ||
      (category &&
        form.specificOffense &&
        !category.offenses.some(o => o.offense_name === form.specificOffense))
    ) {
      form.specificOffense = '';
    }
  },
  { immediate: true },
);

// mock offense list (replace with real API if available)[web:68]
const fetchOffenses = async () => {
  offenseList.value = [
    {
      category_id: 1,
      category_name: 'Minor Offense',
      offenses: [
        { offense_id: 1, offense_name: 'Failure to wear uniform' },
        { offense_id: 2, offense_name: 'Unauthorized use of school facilities' },
        { offense_id: 3, offense_name: 'Littering' },
      ],
    },
    {
      category_id: 2,
      category_name: 'Major Offense',
      offenses: [
        { offense_id: 7, offense_name: 'Alcohol/drugs/weapons' },
        { offense_id: 8, offense_name: 'Disrespect' },
        { offense_id: 9, offense_name: 'Vandalism' },
      ],
    },
  ];
};

// FETCH INCIDENT CORRECTLY using mapped keys from IncidentController@show[web:78][web:19]
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

    // Map exactly from controller's mappedIncident array
    form.studentId       = data.student_id || '';
    form.fullName        = data.full_name || '';
    form.program         = data.program || '';
    form.yearLevel       = data.year_level || '';
    form.section         = data.section || '';
    form.dateOfIncident  = data.date_of_incident || '';
    form.timeOfIncident  = data.time_of_incident
      ? data.time_of_incident.substring(0, 5)
      : '';
    form.location        = data.location || '';
    form.offenseCategory = data.offenseCategory || '';
    form.specificOffense = data.specificOffense || '';
    form.description     = data.description || '';
  } catch (err) {
    incidentFound.value = false;
    submitError.value = `Error loading report: ${
      err.response?.data?.message || err.message
    }`;
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  submitError.value = null;

  const categoryId = getCategoryId(form.offenseCategory);
  const specificOffenseId = getOffenseId(form.offenseCategory, form.specificOffense);

  if (!categoryId || !specificOffenseId) {
    submitError.value =
      'Submission failed: Please make sure both offense category and specific offense are selected.';
    isSubmitting.value = false;
    return;
  }

  const updateData = {
    categoryId,
    specificOffenseId,
    studentId: form.studentId,
    dateOfIncident: form.dateOfIncident,
    timeOfIncident: form.timeOfIncident,
    location: form.location,
    description: form.description,
    fullName: form.fullName,
    program: form.program,
    yearLevel: form.yearLevel,
    section: form.section,
  };

  try {
    const response = await api.put(`/incidents/${incidentId}`, updateData);
    if (response.status === 200) {
      submitError.value = `✅ Incident Report #${incidentId} updated successfully!`;
      setTimeout(() => router.push({ name: 'AdminIncidents' }), 1500);
    }
  } catch (error) {
    const data = error.response?.data;
    if (data?.errors) {
      const msg = Object.values(data.errors).flat().join('; ');
      submitError.value = `Update failed: ${msg}`;
    } else {
      submitError.value = data?.message || 'Update failed due to server error.';
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
</script>

<style scoped>
input:focus,
select:focus,
textarea:focus {
  border-color: #064b2a !important;
  box-shadow: 0 0 0 2px rgba(6, 75, 42, 0.35);
}
button:hover:not(:disabled) {
  filter: brightness(1.05);
}

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 1.1em;
  padding-right: 30px !important;
}
</style>
