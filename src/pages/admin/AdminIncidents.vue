<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // 1. Import useRouter
import api from '@/services/api'; 

// --- Setup ---
const router = useRouter(); // 2. Initialize router

// --- Configuration ---
const statusOptions = ['Pending', 'Under Review', 'Resolved', 'Closed'];

// --- State Management ---
const incidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('date_of_incident');
const sortDirection = ref('desc');

// Modal State
const showConfirmModal = ref(false);
const incidentToDelete = ref(null);

// --- API Fetching Logic (Omitted for brevity, remains the same) ---
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
        console.error('Failed to fetch incidents:', err);
        let errorMessage = 'Could not load incident reports. Check server connectivity or authentication.';
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        }
        error.value = errorMessage;
    } finally {
        isLoading.value = false;
    }
};

// --- Status Update Handler (Omitted for brevity, remains the same) ---
const updateIncidentStatus = async (incident, newStatus) => {
    if (incident.status === newStatus) return;

    const originalStatus = incident.status;
    incident.status = newStatus; // Optimistic update
    error.value = null; 

    try {
        console.log(`[STATUS] Sending PUT request to update ID ${incident.id} to ${newStatus}`);
        const response = await api.put(`/incidents/${incident.id}/status`, { status: newStatus });

        if (response.data && response.data.incident && response.data.incident.status === newStatus) {
            error.value = `✅ Status updated successfully for ID ${incident.id}.`;
        } else {
            incident.status = originalStatus;
            throw new Error("Server did not confirm status change.");
        }
        
    } catch (err) {
        console.error(`[STATUS FAILED] Error on PUT /incidents/${incident.id}/status:`, err);
        incident.status = originalStatus; 
        let msg = "Failed to update status. Check backend logs.";
        if (err.response && err.response.data && err.response.data.message) { msg = err.response.data.message; }
        error.value = `❌ Failed to update status for incident ${incident.id}. Message: ${msg}`;
    } finally {
        setTimeout(() => { error.value = null; }, 5000); 
    }
};

// --- DELETE HANDLER (Omitted for brevity, remains the same) ---
const confirmDelete = (incident) => {
    incidentToDelete.value = incident;
    showConfirmModal.value = true;
};

const deleteIncident = async () => {
    if (!incidentToDelete.value) return;

    const incidentId = incidentToDelete.value.id;
    error.value = null; 
    showConfirmModal.value = false;
    incidentToDelete.value = null;

    try {
        console.log(`[DELETE] Sending DELETE request for ID ${incidentId}`);
        await api.delete(`/incidents/${incidentId}`);
        incidents.value = incidents.value.filter(i => i.id !== incidentId);
        error.value = `✅ Incident ${incidentId} deleted successfully.`;
    } catch (err) {
        console.error(`[DELETE FAILED] Error on DELETE /incidents/${incidentId}:`, err);
        let msg = "Failed to delete report. Check backend logs.";
        if (err.response && err.response.data && err.response.data.message) { msg = err.response.data.message; }
        error.value = `❌ Failed to delete incident ${incidentId}. Message: ${msg}`;
    } finally {
        setTimeout(() => { error.value = null; }, 5000);
    }
};

// 3. Edit Handler (FIXED to use router push)
const handleEdit = (incident) => {
    console.log(`[EDIT] Navigating to edit page for Incident ID: ${incident.id}`);
    
    // *** CRITICAL FIX: Navigate to the dynamic route 'EditIncident' ***
    router.push({ name: 'EditIncident', params: { id: incident.id } }); 
};


// --- Computed Properties & Utility Methods (Omitted for brevity, remain the same) ---

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
        case 'Resolved': return 'bg-green-100 text-green-800 border-green-500';
        case 'Under Review': return 'bg-blue-100 text-blue-800 border-blue-500';
        case 'Closed': return 'bg-gray-200 text-gray-800 border-gray-500';
        case 'Pending': 
        default: return 'bg-red-100 text-red-800 border-red-500 animate-pulse';
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
</script>

<template>
    <div class="p-6 md:p-10 bg-gray-50 min-h-screen font-inter">
        <h1 class="text-4xl font-extrabold text-red-800 mb-2">Incident Reports</h1>
        <p class="text-gray-600 mb-6">Manage all filed student misconduct reports and track their status.</p>

        <!-- Control Bar (Search & Stats) -->
        <div class="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-8">
            
            <!-- Search Bar -->
            <div class="w-full md:w-1/3 mb-4 md:mb-0 relative">
                <input 
                    type="text" 
                    v-model="searchTerm" 
                    placeholder="Search by ID, Name, or Offense..."
                    class="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 transition"
                >
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <!-- Stats/Total -->
            <div class="text-lg font-semibold text-red-700">
                Total Reports: {{ incidents.length }}
            </div>
        </div>

        <!-- Status Indicators & Error Display -->
        <div v-if="isLoading" class="text-center p-8 text-red-600 font-semibold text-xl">
            <svg class="animate-spin inline-block w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading incident reports...
        </div>

        <div v-else-if="error" 
             :class="{'bg-green-100 border-green-400 text-green-700': error.startsWith('✅'), 'bg-red-100 border-red-400 text-red-700': error.startsWith('❌') || !error.startsWith('✅')}" 
             class="border p-4 rounded-lg shadow-md mb-4 font-semibold">
            <p class="font-bold">Message:</p>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="incidents.length === 0" class="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <p class="text-2xl font-bold text-gray-500">No Incident Reports Found</p>
            <p class="text-gray-400 mt-2">The incident database is currently empty.</p>
        </div>

        <!-- Incident Table -->
        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-red-700 text-white sticky top-0">
                    <tr>
                        <!-- Table Headers with Sorting -->
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-red-800 rounded-tl-xl"
                            @click="toggleSort('id')"
                        >
                            Report ID {{ getSortIcon('id') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-red-800"
                            @click="toggleSort('full_name')"
                        >
                            Student Name {{ getSortIcon('full_name') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-red-800"
                            @click="toggleSort('specific_offense')"
                        >
                            Offense {{ getSortIcon('specific_offense') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-red-800"
                            @click="toggleSort('date_of_incident')"
                        >
                            Date/Time {{ getSortIcon('date_of_incident') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        >
                            Status
                        </th>
                        <th 
                            class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider rounded-tr-xl"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="incident in sortedIncidents" :key="incident.id" class="hover:bg-red-50 transition duration-150">
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-700">{{ incident.id }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold">{{ incident.full_name }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">
                            <span class="font-medium text-red-600">{{ incident.specific_offense }}</span> 
                            <span class="text-xs text-gray-400 block">({{ incident.offense_category }})</span>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {{ formatDate(incident.date_of_incident, incident.time_of_incident) }}
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <select 
                                :value="incident.status"
                                @change="updateIncidentStatus(incident, $event.target.value)"
                                :class="[getStatusClasses(incident.status), 'p-1 rounded-full text-xs font-semibold border']"
                                class="shadow-sm appearance-none cursor-pointer"
                            >
                                <option v-for="status in statusOptions" :key="status" :value="status">
                                    {{ status }}
                                </option>
                            </select>
                        </td>
                        <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                            <button @click="handleEdit(incident)" class="text-blue-600 hover:text-blue-900 mx-1 p-1 rounded-md hover:bg-blue-100 transition">Edit</button>
                            <button @click="confirmDelete(incident)" class="text-red-600 hover:text-red-900 mx-1 p-1 rounded-md hover:bg-red-100 transition">Delete</button>
                        </td>
                    </tr>
                    
                    <!-- No search results row -->
                    <tr v-if="incidents.length > 0 && filteredIncidents.length === 0">
                        <td colspan="6" class="text-center py-6 text-gray-500 italic">No results found for "{{ searchTerm }}"</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Delete Confirmation Modal (NEW) -->
        <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-transform duration-300 scale-100">
                <h3 class="text-lg font-bold text-red-600 mb-4">Confirm Deletion</h3>
                <p class="text-gray-700 mb-6">
                    Are you sure you want to permanently delete Incident Report 
                    <span class="font-bold text-red-800">#{{ incidentToDelete?.id }}</span>? This action cannot be undone.
                </p>
                <div class="flex justify-end space-x-3">
                    <button @click="showConfirmModal = false" class="py-2 px-4 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button @click="deleteIncident" class="py-2 px-4 rounded-lg text-white bg-red-600 hover:bg-red-700 transition">
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
/* Ensure the select dropdown looks clean and overrides default styles */
select {
    /* Removes default system styling */
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