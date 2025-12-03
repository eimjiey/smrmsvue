<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

// --- Setup ---
const router = useRouter();
const statusOptions = ['Pending', 'Under Review', 'Resolved', 'Closed'];

// --- State Management ---
const incidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('date_of_incident');
const sortDirection = ref('desc');

// --- API Fetching Logic ---
const fetchIncidents = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/incidents');
    let receivedData = response.data;
    if (receivedData && receivedData.data && Array.isArray(receivedData.data)) {
      receivedData = receivedData.data;
    }
    incidents.value = Array.isArray(receivedData) ? receivedData : [];
  } catch (err) {
    let errorMessage =
      'Could not load incident reports. Check server connectivity or authentication.';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

// --- Status Update Handler ---
const updateIncidentStatus = async (incident, newStatus) => {
  if (incident.status === newStatus) return;

  const originalStatus = incident.status;
  incident.status = newStatus; // optimistic
  error.value = null;

  try {
    const response = await api.put(`/incidents/${incident.id}/status`, { status: newStatus });
    if (response.data && response.data.incident && response.data.incident.status === newStatus) {
      error.value = `✅ Status updated successfully for ID ${incident.id}.`;
    } else {
      incident.status = originalStatus;
      throw new Error('Server did not confirm status change.');
    }
  } catch (err) {
    incident.status = originalStatus;
    let msg = 'Failed to update status. Check backend logs.';
    if (err.response && err.response.data && err.response.data.message) {
      msg = err.response.data.message;
    }
    error.value = `❌ Failed to update status for incident ${incident.id}. Message: ${msg}`;
  } finally {
    setTimeout(() => { error.value = null; }, 5000);
  }
};

const handleEdit = (incident) => {
  router.push({ name: 'EditIncident', params: { id: incident.id } });
};

const filteredIncidents = computed(() => {
  const incidentList = incidents.value || [];
  if (!searchTerm.value) return incidentList;
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return incidentList.filter(
    (incident) =>
      String(incident.id).includes(lowerCaseSearch) ||
      (incident.full_name && incident.full_name.toLowerCase().includes(lowerCaseSearch)) ||
      (incident.location && incident.location.toLowerCase().includes(lowerCaseSearch)) ||
      (incident.specific_offense && incident.specific_offense.toLowerCase().includes(lowerCaseSearch)) ||
      (incident.status && incident.status.toLowerCase().includes(lowerCaseSearch))
  );
});
const sortedIncidents = computed(() => {
  const list = Array.isArray(filteredIncidents.value) ? [...filteredIncidents.value] : [];
  if (!sortBy.value || list.length === 0) return list;

  list.sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    const comparison = String(aValue || '').localeCompare(String(bValue || ''));
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
  return list;
});
const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
};
const getSortIcon = (column) => {
  if (sortBy.value !== column) return '—';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};
const getStatusClasses = (status) => {
  switch (status) {
    case 'Resolved':
      return { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' };
    case 'Under Review':
      return { backgroundColor: '#cce5ff', color: '#004085', borderColor: '#b8daff' };
    case 'Closed':
      return { backgroundColor: '#e9ecef', color: '#495057', borderColor: '#ced4da' };
    case 'Pending':
    default:
      return { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' };
  }
};
const formatDate = (dateString, timeString) => {
  try {
    const date = new Date(`${dateString}T${timeString}`);
    return (
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return 'N/A';
  }
};
onMounted(fetchIncidents);

// --- Layout Styles ---
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
  maxWidth: '1100px',
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
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  padding: '45px 35px 35px 35px',
  display: 'flex',
  flexDirection: 'column',
};
const mainHeadingStyle = {
  fontSize: '1.4rem',
  fontWeight: '800',
  color: '#1d3e21',
  margin: '0 0 6px 0',
  textAlign: 'center',
};
const subHeadingStyle = {
  color: '#4b5563',
  marginBottom: '18px',
  fontSize: '0.9rem',
  textAlign: 'center',
};
const controlBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#ffffff',
  padding: '10px 18px',
  borderRadius: '999px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '18px',
};
const searchWrapperStyle = {
  width: '50%',
  position: 'relative',
};
const searchInputStyle = {
  width: '100%',
  padding: '8px 10px 8px 36px',
  border: 'none',
  borderRadius: '999px',
  outline: 'none',
  fontSize: '0.85rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
};
const searchIconStyle = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '18px',
  height: '18px',
  color: '#9ca3af',
};
const totalReportsStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#1d3e21',
};
const loadingStyle = {
  textAlign: 'center',
  padding: '24px',
  color: '#1d3e21',
  fontWeight: '600',
  fontSize: '1rem',
};
const spinnerStyle = {
  display: 'inline-block',
  width: '20px',
  height: '20px',
  marginRight: '8px',
  verticalAlign: 'middle',
};
const errorBoxStyle = computed(() => {
  const base = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: '600',
    border: '1px solid',
    fontSize: '0.85rem',
  };
  if (error.value && error.value.startsWith('✅')) {
    return {
      ...base,
      backgroundColor: '#d4edda',
      color: '#155724',
      borderColor: '#c3e6cb',
    };
  }
  return {
    ...base,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderColor: '#f5c6cb',
  };
});
const errorTitleStyle = {
  fontWeight: '700',
};
const noDataStyle = {
  textAlign: 'center',
  padding: '32px',
  background: '#ffffff',
  borderRadius: '18px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};
const noDataTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '700',
  color: '#6b7280',
};
const noDataSubTitleStyle = {
  color: '#9ca3af',
  marginTop: '6px',
};
const tableOuterPanelStyle = {
  marginTop: '4px',
  borderRadius: '22px',
  padding: '10px',
  background: 'linear-gradient(145deg, rgba(0,128,96,0.35), rgba(0,80,180,0.45))',
};
const tableWrapperStyle = {
  overflowX: 'auto',
  borderRadius: '18px',
  background: 'rgba(0,0,0,0.15)',
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
};
const tableHeaderStyle = {
  background: '#064b2a',
  color: '#ffffff',
};
const tableHeaderCellStyle = (position) => {
  let radius = {};
  if (position === 'tl') radius = { borderTopLeftRadius: '16px' };
  if (position === 'tr') radius = { borderTopRightRadius: '16px' };
  return {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    ...radius,
  };
};
const tableBodyStyle = {
  background: 'transparent',
};
const tableRowStyle = {
  transition: 'background-color 0.15s',
};
const tableDataCellStyle = (type) => {
  let color = '#e5fdf4';
  let fontWeight = '400';
  if (type === 'id' || type === 'name') {
    color = '#ffffff';
    fontWeight = '600';
  }
  return {
    padding: '10px 16px',
    fontSize: '0.85rem',
    color,
    fontWeight,
    borderBottom: '1px solid rgba(255,255,255,0.25)',
    whiteSpace: 'nowrap',
  };
};
const noSearchResultsStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#f9fafb',
  fontStyle: 'italic',
  fontSize: '0.9rem',
};
const actionButtonStyle = (type) => {
  let color = '#facc15';
  if (type === 'delete') color = '#fecaca';
  return {
    color,
    marginLeft: '4px',
    marginRight: '4px',
    padding: '4px 8px',
    borderRadius: '999px',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'transparent',
    fontSize: '0.8rem',
    fontWeight: '600',
  };
};
</script>

<template>
  <div :style="adminDashboardContainerStyle">
    <AdminNavbar />
    <h1 :style="mainTitleStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>
    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">INCIDENT REPORTS</div>
        <div :style="contentCardStyle">
          <h2 :style="mainHeadingStyle">Incident Reports</h2>
          <p :style="subHeadingStyle">Manage all filed student misconduct reports and track their status.</p>
          <div :style="controlBarStyle">
            <div :style="searchWrapperStyle">
              <input type="text" v-model="searchTerm" placeholder="Search by ID, Name, or Offense..." :style="searchInputStyle"/>
              <svg :style="searchIconStyle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ircle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 
                  7.938l3-2.647z"/>
              </svg>
            </div>
            <div :style="totalReportsStyle">TOTAL REPORTS: {{ incidents.length }}</div>
          </div>
          <div v-if="isLoading" :style="loadingStyle">
            <svg class="animate-spin" :style="spinnerStyle" viewBox="0 0 24 24" fill="none">
              ircle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 
                       5.373 0 12h4zm2 5.291A7.962 7.962 0 014 
                       12H0c0 3.042 1.135 5.824 3 
                       7.938l3-2.647z"/>
            </svg>
            Loading incident reports...
          </div>
          <div v-else-if="error" :style="errorBoxStyle">
            <p :style="errorTitleStyle">Message:</p>
            <p>{{ error }}</p>
          </div>
          <div v-else-if="incidents.length === 0" :style="noDataStyle">
            <p :style="noDataTitleStyle">No Incident Reports Found</p>
            <p :style="noDataSubTitleStyle">
              The incident database is currently empty.
            </p>
          </div>
          <div v-else :style="tableOuterPanelStyle">
            <div :style="tableWrapperStyle">
              <table :style="tableStyle">
                <thead :style="tableHeaderStyle">
                  <tr>
                    <th :style="tableHeaderCellStyle('tl')" @click="toggleSort('full_name')">
                      STUDENT NAME {{ getSortIcon('full_name') }}
                    </th>
                    <th :style="tableHeaderCellStyle('')" @click="toggleSort('specific_offense')">
                      OFFENSE {{ getSortIcon('specific_offense') }}
                    </th>
                    <th :style="tableHeaderCellStyle('')" @click="toggleSort('date_of_incident')">
                      DATE AND TIME {{ getSortIcon('date_of_incident') }}
                    </th>
                    <th :style="tableHeaderCellStyle('')">STATUS</th>
                    <th :style="tableHeaderCellStyle('tr')">ACTIONS</th>
                  </tr>
                </thead>
                <tbody :style="tableBodyStyle">
                  <tr v-for="incident in sortedIncidents" :key="incident.id" :style="tableRowStyle">
                    <td :style="tableDataCellStyle('name')">{{ incident.full_name }}</td>
                    <td :style="tableDataCellStyle('normal')">
                      <span :style="{ fontWeight: '600', color: '#fffbeb' }">{{ incident.specific_offense }}</span>
                      <span :style="{ fontSize: '0.7rem', color: '#e5e7eb', display: 'block' }">
                        ({{ incident.offense_category }})
                      </span>
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      {{ formatDate(incident.date_of_incident, incident.time_of_incident) }}
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      <select
                        :value="incident.status"
                        @change="updateIncidentStatus(incident, $event.target.value)"
                        :style="{ ...getStatusClasses(incident.status), padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid', cursor: 'pointer', backgroundClip: 'padding-box' }"
                      >
                        <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
                      </select>
                    </td>
                    <td :style="tableDataCellStyle('actions')">
                      <button @click="handleEdit(incident)" :style="actionButtonStyle('view')">Edit</button>
                    </td>
                  </tr>
                  <tr v-if="incidents.length > 0 && filteredIncidents.length === 0">
                    <td colspan="5" :style="noSearchResultsStyle">
                      No results found for "{{ searchTerm }}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(html), :global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23ffffff"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  padding-right: 2rem !important;
}
</style>
