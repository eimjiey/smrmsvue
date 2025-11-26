<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

// --- Setup ---
const router = useRouter(); 

// --- Configuration ---
const statusOptions = ['Pending', 'Under Review', 'Resolved', 'Closed'];

// --- State Management ---
const incidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('date_of_incident');
const sortDirection = ref('desc');

// Modal State (DELETE MODAL REMOVED)
// const showConfirmModal = ref(false);
// const incidentToDelete = ref(null);

// --- API Fetching Logic (Functional) ---
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
        let errorMessage = 'Could not load incident reports. Check server connectivity or authentication.';
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        }
        error.value = errorMessage;
    } finally {
        isLoading.value = false;
    }
};

// --- Status Update Handler (Functional) ---
const updateIncidentStatus = async (incident, newStatus) => {
    if (incident.status === newStatus) return;

    const originalStatus = incident.status;
    incident.status = newStatus; // Optimistic update
    error.value = null; 

    try {
        const response = await api.put(`/incidents/${incident.id}/status`, { status: newStatus });

        if (response.data && response.data.incident && response.data.incident.status === newStatus) {
            error.value = `✅ Status updated successfully for ID ${incident.id}.`;
        } else {
            incident.status = originalStatus;
            throw new Error("Server did not confirm status change.");
        }
        
    } catch (err) {
        incident.status = originalStatus; 
        let msg = "Failed to update status. Check backend logs.";
        if (err.response && err.response.data && err.response.data.message) { msg = err.response.data.message; }
        error.value = `❌ Failed to update status for incident ${incident.id}. Message: ${msg}`;
    } finally {
        setTimeout(() => { error.value = null; }, 5000); 
    }
};

// --- DELETE HANDLER (Removed) ---
// const confirmDelete = (incident) => {
//     // Functionality removed
// };
// const deleteIncident = async () => {
//     // Functionality removed
// };

// 3. Edit Handler
const handleEdit = (incident) => {
    router.push({ name: 'EditIncident', params: { id: incident.id } }); 
};


// --- Computed Properties & Utility Methods (Functional) ---

const filteredIncidents = computed(() => {
    const incidentList = incidents.value || [];
    if (!searchTerm.value) { return incidentList; }
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    
    return incidentList.filter(incident => 
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
    if (sortBy.value !== column) {
        return '—'; 
    }
    return sortDirection.value === 'asc' ? '▲' : '▼';
};

const getStatusClasses = (status) => {
    switch (status) {
        case 'Resolved': return { backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' };
        case 'Under Review': return { backgroundColor: '#cce5ff', color: '#004085', borderColor: '#b8daff' };
        case 'Closed': return { backgroundColor: '#e9ecef', color: '#495057', borderColor: '#ced4da' };
        case 'Pending': 
        default: return { backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' };
    }
};

const formatDate = (dateString, timeString) => {
    try {
        const date = new Date(`${dateString}T${timeString}`);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + 
               ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'N/A';
    }
}

// --- Lifecycle Hook ---
onMounted(fetchIncidents);

// --- START STYLING LOGIC ---

// --- General & Container Styles ---
const pageContainerStyle = computed(() => ({
    padding: '20px 40px',
    minHeight: '100vh',
    backgroundColor: '#e6f0e7', // Light green background
    fontFamily: 'Arial, sans-serif',
}));

const mainHeadingStyle = computed(() => ({
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1d3e21', // Dark green title color
    marginBottom: '8px',
    marginTop: '60px', // Push content below fixed nav
}));

const subHeadingStyle = computed(() => ({
    color: '#4b5563',
    marginBottom: '24px',
}));

// --- Navigation Styles (Replicating Dashboard Header) ---
const navContainerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    background: '#1d3e21',
    color: '#fff',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
}));

const navLeftStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
}));

const navButtonStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    padding: '8px 15px',
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
}));

const activeNavButtonStyle = computed(() => ({
     display: 'flex',
    alignItems: 'center',
    padding: '8px 15px',
    background: '#f8fff8', // Light background for active button
    color: '#1d3e21', // Dark green text for active button
    border: 'none',
    borderRadius: '5px',
    cursor: 'default',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    textTransform: 'uppercase',
}));

const iconStyle = computed(() => ({
    marginRight: '8px',
}));

const navLinksStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    color: '#ddd',
}));

const navLinkStyle = computed(() => ({
    cursor: 'pointer',
    transition: 'color 0.2s',
    padding: '8px 0',
    color: '#fff',
}));

const userProfileStyle = computed(() => ({
    padding: '8px 10px',
    background: '#f8fff8', 
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '35px',
    height: '35px',
    color: '#1d3e21', 
}));

const profileIconStyle = computed(() => ({
    fontSize: '1.2rem',
}));

// --- Control Bar Styles (Search/Total) ---
const controlBarStyle = computed(() => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '32px',
}));

const searchWrapperStyle = computed(() => ({
    width: '33.333%',
    position: 'relative',
}));

const searchInputStyle = computed(() => ({
    width: '100%',
    padding: '10px 10px 10px 40px', // Extra padding for the icon
    border: '1px solid #ccc',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
}));

const searchIconStyle = computed(() => ({
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    color: '#9ca3af',
}));

const totalReportsStyle = computed(() => ({
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1d3e21', // Dark green text
}));

// --- Error/Loading/No Data Styles ---
const loadingStyle = computed(() => ({
    textAlign: 'center',
    padding: '32px',
    color: '#dc2626', // Red color for loading indicator
    fontWeight: '600',
    fontSize: '1.25rem',
}));

const spinnerStyle = computed(() => ({
    display: 'inline-block',
    width: '24px',
    height: '24px',
    marginRight: '12px',
    verticalAlign: 'middle',
}));

const errorBoxStyle = computed(() => {
    let base = {
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px',
        fontWeight: '600',
        border: '1px solid',
    };
    if (error.value && error.value.startsWith('✅')) {
        return { ...base, backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' };
    } else {
        return { ...base, backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' };
    }
});

const errorTitleStyle = computed(() => ({
    fontWeight: '700',
}));

const noDataStyle = computed(() => ({
    textAlign: 'center',
    padding: '48px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
}));

const noDataTitleStyle = computed(() => ({
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#6b7280',
}));

const noDataSubTitleStyle = computed(() => ({
    color: '#9ca3af',
    marginTop: '8px',
}));

// --- Table Styles ---
const tableWrapperStyle = computed(() => ({
    overflowX: 'auto',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
}));

const tableStyle = computed(() => ({
    minWidth: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
}));

const tableHeaderStyle = computed(() => ({
    background: '#1d3e21', // Dark green header
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    borderBottom: '1px solid #e5e7eb',
}));

const tableBodyStyle = computed(() => ({
    background: '#fff',
    borderTop: '1px solid #f3f4f6', 
}));

const tableRowStyle = computed(() => ({
    transition: 'background-color 0.15s',
}));

const noSearchResultsStyle = computed(() => ({
    textAlign: 'center',
    padding: '24px',
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: '1rem',
}));


// Table Helper Functions (Methods)

const tableHeaderCellStyle = (position) => {
    let borderRadius = {};
    if (position === 'tl') {
        borderRadius = { borderTopLeftRadius: '12px' };
    } else if (position === 'tr') {
        borderRadius = { borderTopRightRadius: '12px' };
    }

    return {
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        cursor: position !== 'tr' ? 'pointer' : 'default',
        transition: 'background-color 0.15s',
        ...borderRadius,
    };
};

const tableDataCellStyle = (type) => {
    let fontWeight = '400';
    let color = '#4b5563';
    let textAlign = 'left';

    if (type === 'id') {
        fontWeight = '500';
        color = '#1d3e21'; // Dark green text for IDs
    } else if (type === 'name') {
        fontWeight = '600';
        color = '#111827';
    } else if (type === 'actions') {
        textAlign = 'center';
    }

    return {
        padding: '12px 16px',
        whiteSpace: 'nowrap',
        fontSize: '0.875rem',
        fontWeight: fontWeight,
        color: color,
        textAlign: textAlign,
        borderBottom: '1px solid #f3ff4f6', 
    };
};

const actionButtonStyle = (type) => {
    let color = '#3b82f6'; // Blue for Edit

    if (type === 'delete') {
        // DELETE STYLES ARE NO LONGER USED, but keeping structure intact
        color = '#dc2626'; 
    }

    return {
        color: color,
        marginLeft: '4px',
        marginRight: '4px',
        padding: '4px 8px',
        borderRadius: '6px',
        transition: 'all 0.15s',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
    };
};

// Modal styles are removed entirely since the modal is gone
</script>

<template>
    <div :style="pageContainerStyle">
        <div :style="navContainerStyle">
            <div :style="navLeftStyle">
                <button @click="router.push({ name: 'AdminDashboard' })" :style="navButtonStyle">
                    <span :style="iconStyle">📊</span> DASHBOARD
                </button>
                <div :style="navLinksStyle">
                    <span @click="router.push({ name: 'AdminStudents' })" :style="navLinkStyle">STUDENTS LIST</span>
                    <button :style="activeNavButtonStyle">INCIDENT REPORT</button>
                    <span @click="router.push({ name: 'AddStudent' })" :style="navLinkStyle">ADD STUDENT</span>
                </div>
            </div>
            <div :style="userProfileStyle">
                <span :style="profileIconStyle">👤</span>
            </div>
        </div>

        <h1 :style="mainHeadingStyle">INCIDENT REPORTS</h1>
        <p :style="subHeadingStyle">Manage all filed student misconduct reports and track their status.</p>

        <div :style="controlBarStyle">
            
            <div :style="searchWrapperStyle">
                <input 
                    type="text" 
                    v-model="searchTerm" 
                    placeholder="Search by ID, Name, or Offense..."
                    :style="searchInputStyle"
                >
                <svg :style="searchIconStyle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <div :style="totalReportsStyle">
                Total Reports: {{ incidents.length }}
            </div>
        </div>

        <div v-if="isLoading" :style="loadingStyle">
            <svg class="animate-spin" :style="spinnerStyle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading incident reports...
        </div>

        <div v-else-if="error" 
             :style="errorBoxStyle">
            <p :style="errorTitleStyle">Message:</p>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="incidents.length === 0" :style="noDataStyle">
            <p :style="noDataTitleStyle">No Incident Reports Found</p>
            <p :style="noDataSubTitleStyle">The incident database is currently empty.</p>
        </div>

        <div v-else :style="tableWrapperStyle">
            <table :style="tableStyle">
                <thead :style="tableHeaderStyle">
                    <tr>
                        <th 
                            :style="tableHeaderCellStyle('tl')"
                            @click="toggleSort('id')"
                        >
                            Report ID {{ getSortIcon('id') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                            @click="toggleSort('full_name')"
                        >
                            Student Name {{ getSortIcon('full_name') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                            @click="toggleSort('specific_offense')"
                        >
                            Offense {{ getSortIcon('specific_offense') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                            @click="toggleSort('date_of_incident')"
                        >
                            Date/Time {{ getSortIcon('date_of_incident') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                        >
                            Status
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('tr')"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody :style="tableBodyStyle">
                    <tr v-for="incident in sortedIncidents" :key="incident.id" :style="tableRowStyle">
                        <td :style="tableDataCellStyle('id')">{{ incident.id }}</td>
                        <td :style="tableDataCellStyle('name')">{{ incident.full_name }}</td>
                        <td :style="tableDataCellStyle('normal')">
                            <span :style="{ fontWeight: '500', color: '#dc2626' }">{{ incident.specific_offense }}</span> 
                            <span :style="{ fontSize: '0.75rem', color: '#9ca3af', display: 'block' }">({{ incident.offense_category }})</span>
                        </td>
                        <td :style="tableDataCellStyle('normal')">
                            {{ formatDate(incident.date_of_incident, incident.time_of_incident) }}
                        </td>
                        <td :style="tableDataCellStyle('normal')">
                            <select 
                                :value="incident.status"
                                @change="updateIncidentStatus(incident, $event.target.value)"
                                :style="{...getStatusClasses(incident.status), ...{padding: '4px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid', cursor: 'pointer'}}"
                            >
                                <option v-for="status in statusOptions" :key="status" :value="status">
                                    {{ status }}
                                </option>
                            </select>
                        </td>
                        <td :style="tableDataCellStyle('actions')">
                            <button @click="handleEdit(incident)" :style="actionButtonStyle('view')">Edit</button>
                        </td>
                    </tr>
                    
                    <tr v-if="incidents.length > 0 && filteredIncidents.length === 0">
                        <td colspan="6" :style="noSearchResultsStyle">No results found for "{{ searchTerm }}"</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
/* Basic CSS for the spinner */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
.animate-spin {
    animation: spin 1s linear infinite;
}

/* Custom CSS for select dropdown arrow */
select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23374151"><path d="M7 7l3-3 3 3m0 6l-3 3-3-3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.5rem center;
    background-size: 1em;
    padding-right: 2rem !important;
}
</style>