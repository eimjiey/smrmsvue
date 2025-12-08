<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

// --- Setup ---
const router = useRouter();

// --- State Management ---
const trashIncidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('deleted_at');
const sortDirection = ref('desc');

// --- Pagination State ---
const currentPage = ref(1);
const itemsPerPage = ref(10);

// --- API Fetching Logic ---
const fetchTrashIncidents = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        // 🔑 Fetch ALL incidents, including soft-deleted ones (using Laravel's 'trashed' query scope)
        const response = await api.get('/incidents?trashed=true'); 
        let receivedData = response.data;
        if (receivedData && receivedData.data && Array.isArray(receivedData.data)) {
            receivedData = receivedData.data;
        }
        // Filter client-side to only show soft-deleted records (deleted_at is not null)
        trashIncidents.value = Array.isArray(receivedData) 
            ? receivedData.filter(i => i.deleted_at !== null) 
            : [];
        currentPage.value = 1; 
    } catch (err) {
        let errorMessage = 'Could not load trash reports. Check server connectivity or Admin privileges.';
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        }
        error.value = errorMessage;
    } finally {
        isLoading.value = false;
    }
};

// --- Action Handlers (Admin Only) ---

const handleRestore = async (incident) => {
    if (!confirm(`Are you sure you want to RESTORE incident ID ${incident.id}?`)) return;

    try {
        await api.post(`/incidents/${incident.id}/restore`);
        error.value = `✅ Incident ID ${incident.id} restored successfully.`;
        await fetchTrashIncidents(); // Refresh the trash list
    } catch (err) {
        error.value = `❌ Failed to restore incident ${incident.id}. Check permissions.`;
    } finally {
        setTimeout(() => { error.value = null; }, 5000);
    }
};

const handleForceDelete = async (incident) => {
    if (!confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE incident ID ${incident.id}? This action cannot be undone.`)) return;

    try {
        // Uses the dedicated force-delete route
        await api.delete(`/incidents/${incident.id}/force-delete`); 
        error.value = `✅ Incident ID ${incident.id} permanently deleted.`;
        await fetchTrashIncidents(); // Refresh the trash list
    } catch (err) {
        error.value = `❌ Failed to force delete incident ${incident.id}. Check permissions.`;
    } finally {
        setTimeout(() => { error.value = null; }, 5000);
    }
};

// --- Computed Properties for Filtering, Sorting, and Pagination ---

const filteredIncidents = computed(() => {
    const incidentList = trashIncidents.value || [];
    if (!searchTerm.value) return incidentList;
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    return incidentList.filter(
        (incident) =>
            String(incident.id).includes(lowerCaseSearch) ||
            (incident.full_name && incident.full_name.toLowerCase().includes(lowerCaseSearch)) ||
            (incident.specific_offense && incident.specific_offense.toLowerCase().includes(lowerCaseSearch))
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

const paginatedIncidents = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return sortedIncidents.value.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(sortedIncidents.value.length / itemsPerPage.value);
});

// --- Utility Functions ---

const toggleSort = (column) => {
    if (sortBy.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortBy.value = column;
        sortDirection.value = 'desc';
    }
    currentPage.value = 1;
};

const getSortIcon = (column) => {
    if (sortBy.value !== column) return ''; 
    return sortDirection.value === 'asc' ? '▲' : '▼';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


onMounted(fetchTrashIncidents);

// --- Layout Styles (Reusing main component styles for consistency) ---

const formWrapperOuterStyle = { maxWidth: '100%', margin: '0 auto', padding: '0 0' };
const formWrapperInnerStyle = { padding: '30px', borderRadius: '30px', backgroundImage: `url(${formBg})`, backgroundSize: 'cover', boxShadow: '0 10px 20px rgba(0,0,0,0.25)', position: 'relative' };
const sectionHeaderStyle = { position: 'absolute', top: '10px', left: '40px', padding: '8px 25px', background: '#ffffff', borderRadius: '999px', fontWeight: 'bold', fontSize: '1rem', zIndex: 2 };
const contentCardStyle = { background: 'rgba(255,255,255,0.9)', borderRadius: '25px', padding: '45px 35px 35px 35px', display: 'flex', flexDirection: 'column' };
const mainHeadingStyle = { fontSize: '1.4rem', fontWeight: '800', color: '#cc0000', margin: '0 0 6px 0', textAlign: 'center' };
const subHeadingStyle = { color: '#4b5563', marginBottom: '18px', fontSize: '0.9rem', textAlign: 'center' };
const controlBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '10px 18px', borderRadius: '999px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '18px' };
const searchWrapperStyle = { width: '50%', position: 'relative' };
const searchInputStyle = { width: '100%', padding: '8px 10px 8px 36px', border: 'none', borderRadius: '999px', outline: 'none', fontSize: '0.85rem', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' };
const searchIconStyle = { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' };
const totalReportsStyle = { fontSize: '0.95rem', fontWeight: '600', color: '#1d3e21' };
const loadingStyle = { textAlign: 'center', padding: '24px', color: '#1d3e21', fontWeight: '600', fontSize: '1rem' };
const tableOuterPanelStyle = { marginTop: '4px', borderRadius: '22px', padding: '10px', background: 'linear-gradient(145deg, rgba(204,0,0,0.35), rgba(255,102,0,0.45))' };
const tableWrapperStyle = { overflowX: 'auto', borderRadius: '18px', background: 'rgba(0,0,0,0.15)' };
const tableStyle = { width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '900px' };
const tableHeaderStyle = { background: '#8b0000', color: '#ffffff' };
const tableHeaderCellStyle = (position) => {
    let radius = {};
    if (position === 'tl') radius = { borderTopLeftRadius: '16px' };
    if (position === 'tr') radius = { borderTopRightRadius: '16px' };
    return { padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', ...radius };
};
const tableDataCellStyle = (type) => {
    let color = '#fff0f0';
    let fontWeight = '400';
    if (type === 'id' || type === 'name') { color = '#ffffff'; fontWeight = '600'; }
    return { padding: '10px 16px', fontSize: '0.85rem', color, fontWeight, borderBottom: '1px solid rgba(255,255,255,0.25)', whiteSpace: 'nowrap' };
};
const actionButtonStyle = (type) => {
    let color = '#facc15';
    let background = '#374151';
    if (type === 'restore') { color = '#10b981'; background = '#d1fae5'; }
    if (type === 'force-delete') { color = '#f87171'; background = '#fee2e2'; }
    return { color, background, marginLeft: '4px', marginRight: '4px', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', border: '1px solid', fontSize: '0.8rem', fontWeight: '600', transition: 'background-color 0.2s' };
};
</script>

<template>
    <AdminNavbar>
        
        <div :style="formWrapperOuterStyle">
            <div :style="formWrapperInnerStyle">
                <div :style="sectionHeaderStyle">DELETED REPORTS</div>
                <div :style="contentCardStyle">
                    <h2 :style="mainHeadingStyle">Incident Trash Bin</h2>
                    <p :style="subHeadingStyle">Soft-deleted reports available for restoration or permanent deletion. Only records with a deletion date are shown.</p>
                    
                    <div :style="controlBarStyle">
                        <div :style="searchWrapperStyle">
                            <input type="text" v-model="searchTerm" placeholder="Search by ID, Name, or Offense..." :style="searchInputStyle"/>
                            <svg :style="searchIconStyle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                            </svg>
                        </div>
                        <div :style="totalReportsStyle">RECORDS IN TRASH: {{ trashIncidents.length }}</div>
                    </div>
                    
                    <div v-if="isLoading" :style="loadingStyle">Loading deleted incident reports...</div>
                    <div v-else-if="error" :style="{ ...errorBoxStyle, color: '#cc0000', borderColor: '#cc0000' }">{{ error }}</div>
                    
                    <div v-else-if="trashIncidents.length === 0" :style="noDataStyle">
                        <p :style="noDataTitleStyle">Trash is Empty</p>
                        <p :style="noDataSubTitleStyle">No soft-deleted reports found.</p>
<button @click="router.push({ name: 'AdminIncidents' })" :style="{...actionButtonStyle(), marginTop: '15px', background: '#1d3e21', color: 'white'}">Back to Active Reports</button>
                    </div>
                    
                    <div v-else :style="tableOuterPanelStyle">
                        <div :style="tableWrapperStyle">
                            <table :style="tableStyle">
                                <thead :style="tableHeaderStyle">
                                    <tr>
                                        <th :style="tableHeaderCellStyle('tl')" @click="toggleSort('id')">ID{{ getSortIcon('id') }}</th>
                                        <th :style="tableHeaderCellStyle('')" @click="toggleSort('full_name')">STUDENT NAME{{ getSortIcon('full_name') }}</th>
                                        <th :style="tableHeaderCellStyle('')" @click="toggleSort('specific_offense')">OFFENSE{{ getSortIcon('specific_offense') }}</th>
                                        <th :style="tableHeaderCellStyle('')" @click="toggleSort('deleted_at')">DELETED AT{{ getSortIcon('deleted_at') }}</th>
                                        <th :style="tableHeaderCellStyle('tr')">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody :style="{ background: 'rgba(255,255,255,0.1)' }">
                                    <tr v-for="incident in paginatedIncidents" :key="incident.id">
                                        <td :style="tableDataCellStyle('id')">{{ incident.id }}</td>
                                        <td :style="tableDataCellStyle('name')">{{ incident.full_name }}</td>
                                        <td :style="tableDataCellStyle('normal')">
                                            <span :style="{ fontWeight: '600', color: '#fff' }">{{ incident.specific_offense }}</span>
                                            <span :style="{ fontSize: '0.7rem', color: '#e5e7eb', display: 'block' }">({{ incident.offense_category }})</span>
                                        </td>
                                        <td :style="tableDataCellStyle('normal')">
                                            {{ formatDate(incident.deleted_at) }}
                                        </td>
                                        <td :style="tableDataCellStyle('actions')">
                                            <button @click="handleRestore(incident)" :style="actionButtonStyle('restore')">Restore</button>
                                            <button @click="handleForceDelete(incident)" :style="actionButtonStyle('force-delete')">Permanently Delete</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div v-if="totalPages > 1" :style="paginationContainerStyle">
                            <button 
                                @click="goToPage(currentPage - 1)" 
                                :disabled="currentPage === 1" 
                                :style="{...paginationButtonStyle(currentPage === 1), backgroundColor: '#1d3e21'}">
                                Previous
                            </button>
                            <span :style="paginationInfoStyle">
                                Page {{ currentPage }} of {{ totalPages }}
                            </span>
                            <button 
                                @click="goToPage(currentPage + 1)" 
                                :disabled="currentPage === totalPages" 
                                :style="{...paginationButtonStyle(currentPage === totalPages), backgroundColor: '#1d3e21'}">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AdminNavbar>
</template>