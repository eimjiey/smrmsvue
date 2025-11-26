<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

// --- State Management ---
const students = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('student_number'); 
const sortDirection = ref('asc'); 

// --- API Fetching Logic (Omitted for brevity, but functional) ---
const fetchStudents = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await api.get('/students'); 
        let receivedData = response.data;
        if (typeof receivedData === 'object' && receivedData !== null && Array.isArray(receivedData.data)) {
            receivedData = receivedData.data;
        }
        students.value = Array.isArray(receivedData) ? receivedData : [];
    } catch (err) {
        let errorMessage = 'Could not load student data.';
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (err.message === 'Network error: Unable to connect to the server.') {
             errorMessage = 'Network connection failed. Ensure the Laravel server is running.';
        }
        error.value = errorMessage;
    } finally {
        isLoading.value = false;
    }
};

// --- Computed Properties for Filtering and Sorting (Omitted for brevity, but functional) ---
const getFullName = (student) => {
    const parts = [student.last_name, student.first_name];
    if (student.middle_name) {
        parts.push(student.middle_name);
    }
    return parts.filter(Boolean).join(' ');
};

const filteredStudents = computed(() => {
    const studentList = students.value || [];
    if (!searchTerm.value) return studentList;
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    return studentList.filter(student => 
        (student.student_number && student.student_number.toLowerCase().includes(lowerCaseSearch)) ||
        getFullName(student).toLowerCase().includes(lowerCaseSearch) ||
        (student.program && student.program.toLowerCase().includes(lowerCaseSearch)) ||
        (student.year_level && student.year_level.toLowerCase().includes(lowerCaseSearch))
    );
});

const sortedStudents = computed(() => {
    const list = Array.isArray(filteredStudents.value) ? [...filteredStudents.value] : []; 
    if (!sortBy.value || list.length === 0) return list;
    list.sort((a, b) => {
        let aValue;
        let bValue;
        if (sortBy.value === 'full_name') {
            aValue = a.last_name;
            bValue = b.last_name;
        } else if (sortBy.value === 'student_number') {
            aValue = a.student_number;
            bValue = b.student_number;
        } else {
            aValue = a[sortBy.value];
            bValue = b[sortBy.value];
        }
        const comparison = String(aValue || '').localeCompare(String(bValue || ''));
        return sortDirection.value === 'asc' ? comparison : -comparison;
    });
    return list;
});

// --- Methods for UI Interaction (Omitted for brevity, but functional) ---
const toggleSort = (column) => {
    if (sortBy.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortBy.value = column;
        sortDirection.value = 'asc';
    }
};

const getSortIcon = (column) => {
    if (sortBy.value !== column) {
        return '—';
    }
    return sortDirection.value === 'asc' ? '▲' : '▼';
};

// --- Lifecycle Hook ---
onMounted(fetchStudents);

// --- START STYLING LOGIC ---

// 1. Navigation Styles
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
    background: '#f8fff8',
    color: '#1d3e21',
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

// 2. Page & Heading Styles
const pageContainerStyle = computed(() => ({
    padding: '20px 40px',
    minHeight: '100vh',
    backgroundColor: '#e6f0e7',
    fontFamily: 'Arial, sans-serif',
}));

const mainHeadingStyle = computed(() => ({
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1d3e21',
    marginBottom: '8px',
}));

const subHeadingStyle = computed(() => ({
    color: '#4b5563',
    marginBottom: '24px',
}));

// 3. Control Bar Styles
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
    marginTop: '60px', 
}));

const searchWrapperStyle = computed(() => ({
    width: '33.333%',
    position: 'relative',
}));

const searchInputStyle = computed(() => ({
    width: '100%',
    padding: '10px 10px 10px 40px',
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

const totalStudentsStyle = computed(() => ({
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1d3e21',
}));

// 4. Loading/Error Styles
const loadingStyle = computed(() => ({
    textAlign: 'center',
    padding: '32px',
    color: '#1d3e21',
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

const errorBoxStyle = computed(() => ({
    background: '#fef2f2',
    border: '1px solid #f87171',
    color: '#b91c1c',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '16px',
    fontWeight: '600',
}));

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

// 5. Table Styles
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
    background: '#1d3e21',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
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


// 6. Template Style Helper Functions (defined as regular functions)

// FIX: Removed 'actionButtonStyle' function as it is no longer used in the template.
// This resolves the ESLint 'assigned a value but never used' error.

const tableDataCellStyle = (type) => {
    let fontWeight = '400';
    let color = '#4b5563';
    let textAlign = 'left';

    if (type === 'id') {
        fontWeight = '500';
        color = '#1d3e21';
    } else if (type === 'name') {
        fontWeight = '600';
        color = '#111827';
    } else if (type === 'actions') {
        // 'actions' is now the last column, but the value is still valid.
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

const tableHeaderCellStyle = (position) => {
    let borderRadius = {};
    if (position === 'tl') {
        borderRadius = { borderTopLeftRadius: '12px' };
    } else if (position === 'tr') {
        // 'tr' is no longer the actions column, it's the last displayed column (Year Level)
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
</script>

<template>
    <div :style="pageContainerStyle">
        <div :style="navContainerStyle">
            <div :style="navLeftStyle">
                <button :style="navButtonStyle" @click="$router.push({ name: 'AdminDashboard' })">
                    <span :style="iconStyle">📊</span> DASHBOARD
                </button>
                <div :style="navLinksStyle">
                    <button :style="activeNavButtonStyle">STUDENTS LIST</button>
                    <span @click="$router.push({ name: 'AdminIncidents' })" :style="navLinkStyle">INCIDENT REPORT</span>
                    <span @click="$router.push({ name: 'AddStudent' })" :style="navLinkStyle">ADD STUDENT</span>
                </div>
            </div>
            <div :style="userProfileStyle">
                <span :style="profileIconStyle">👤</span>
            </div>
        </div>

        <h1 :style="mainHeadingStyle">STUDENT DIRECTORY</h1>
        <p :style="subHeadingStyle">Manage all registered students in the system.</p>

        <div :style="controlBarStyle">
            
            <div :style="searchWrapperStyle">
                <input 
                    type="text" 
                    v-model="searchTerm" 
                    placeholder="Search by ID, Name, or Program..."
                    :style="searchInputStyle"
                >
                <svg :style="searchIconStyle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <div :style="totalStudentsStyle">
                Total Students: {{ students.length }}
            </div>
        </div>

        <div v-if="isLoading" :style="loadingStyle">
            <svg class="animate-spin" :style="spinnerStyle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading student list...
        </div>

        <div v-else-if="error" :style="errorBoxStyle">
            <p :style="errorTitleStyle">Error:</p>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="students.length === 0 && !isLoading && !error" :style="noDataStyle">
            <p :style="noDataTitleStyle">No Students Found</p>
            <p :style="noDataSubTitleStyle">The student database is currently empty.</p>
        </div>

        <div v-else :style="tableWrapperStyle">
            <table :style="tableStyle">
                <thead :style="tableHeaderStyle">
                    <tr>
                        <th 
                            :style="tableHeaderCellStyle('tl')"
                            @click="toggleSort('student_number')"
                        >
                            ID {{ getSortIcon('student_number') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                            @click="toggleSort('full_name')"
                        >
                            Full Name {{ getSortIcon('full_name') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('')"
                            @click="toggleSort('program')"
                        >
                            Program {{ getSortIcon('program') }}
                        </th>
                        <th 
                            :style="tableHeaderCellStyle('tr')"
                            @click="toggleSort('year_level')"
                        >
                            Year Level {{ getSortIcon('year_level') }}
                        </th>
                    </tr>
                </thead>
                <tbody :style="tableBodyStyle">
                    <tr v-for="student in sortedStudents" :key="student.student_number" :style="tableRowStyle">
                        <td :style="tableDataCellStyle('id')">{{ student.student_number }}</td>
                        <td :style="tableDataCellStyle('name')">{{ getFullName(student) }}</td>
                        <td :style="tableDataCellStyle('normal')">{{ student.program }}</td>
                        <td :style="tableDataCellStyle('actions')">{{ student.year_level }}</td>
                    </tr>
                    
                    <tr v-if="students.length > 0 && filteredStudents.length === 0">
                        <td colspan="4" :style="noSearchResultsStyle">No results found for "{{ searchTerm }}"</td>
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
</style>