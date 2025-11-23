<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api'; // Import your custom API service

// --- State Management ---
const students = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('student_number'); 
const sortDirection = ref('asc'); // Default sort direction

// --- API Fetching Logic ---

const fetchStudents = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await api.get('/students'); 
        
        // --- DIAGNOSTIC LOGGING ---
        console.log("API Response Status:", response.status);
        console.log("API Response Data:", response.data);
        // --- END DIAGNOSTIC LOGGING ---

        let receivedData = response.data;
        
        // CRITICAL FIX: Check if the response is an object with a nested 'data' property
        if (typeof receivedData === 'object' && receivedData !== null && Array.isArray(receivedData.data)) {
            receivedData = receivedData.data;
            console.log("Extracted nested 'data' array.");
        }

        // Ensure the final result is always an array before assignment
        students.value = Array.isArray(receivedData) ? receivedData : [];
        
    } catch (err) {
        console.error('Failed to fetch students:', err);
        let errorMessage = 'Could not load student data.';
        if (err.response && err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
        } else if (err.message === 'Network error: Unable to connect to the server.') {
             errorMessage = 'Network connection failed. Ensure the Laravel server is running.';
        }
        error.value = errorMessage;
    } finally {
        isLoading.value = false;
        console.log("Students Ref Value after fetch:", students.value);
    }
};

// --- Computed Properties for Filtering and Sorting ---

// Helper function to create the full name string
const getFullName = (student) => {
    // We prioritize Last, First Middle format for directory view
    const parts = [student.last_name, student.first_name];
    if (student.middle_name) {
        parts.push(student.middle_name);
    }
    // Joining only the existing parts
    return parts.filter(Boolean).join(' ');
};

// 1. Filtering: Filters students based on the search term
const filteredStudents = computed(() => {
    const studentList = students.value || [];

    if (!searchTerm.value) {
        return studentList;
    }
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    
    return studentList.filter(student => 
        // 1. Check student number
        (student.student_number && student.student_number.toLowerCase().includes(lowerCaseSearch)) ||
        // 2. Check individual name fields or the combined name
        getFullName(student).toLowerCase().includes(lowerCaseSearch) ||
        // 3. Check program and year level
        (student.program && student.program.toLowerCase().includes(lowerCaseSearch)) ||
        (student.year_level && student.year_level.toLowerCase().includes(lowerCaseSearch))
    );
});

// 2. Sorting: Sorts the filtered students
const sortedStudents = computed(() => {
    const list = Array.isArray(filteredStudents.value) ? [...filteredStudents.value] : []; 
    
    if (!sortBy.value || list.length === 0) return list;

    list.sort((a, b) => {
        let aValue;
        let bValue;
        
        // Custom sort for 'full_name' field, sorting primarily by last_name
        if (sortBy.value === 'full_name') {
            aValue = a.last_name;
            bValue = b.last_name;
        } else if (sortBy.value === 'student_number') {
            aValue = a.student_number;
            bValue = b.student_number;
        } else {
            // Default sorting for fields like 'program' or 'year_level'
            aValue = a[sortBy.value];
            bValue = b[sortBy.value];
        }

        // Handle case sensitivity for strings
        // Ensure values are strings before comparison
        const comparison = String(aValue || '').localeCompare(String(bValue || ''));
        
        return sortDirection.value === 'asc' ? comparison : -comparison;
    });

    return list;
});

// --- Methods for UI Interaction ---

const toggleSort = (column) => {
    if (sortBy.value === column) {
        // Toggle direction if clicking the current sort column
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new column and default to ascending
        sortBy.value = column;
        sortDirection.value = 'asc';
    }
};

// Utility to display the current sort icon
const getSortIcon = (column) => {
    if (sortBy.value !== column) {
        return '—'; // Default or neutral icon
    }
    return sortDirection.value === 'asc' ? '▲' : '▼'; // Ascending/Descending
};

// --- Lifecycle Hook ---
// Fetch data when the component is first loaded
onMounted(fetchStudents);

</script>

<template>
    <div class="p-6 md:p-10 bg-gray-50 min-h-screen">
        <h1 class="text-4xl font-extrabold text-indigo-800 mb-2">Student Directory</h1>
        <p class="text-gray-600 mb-6">Manage all registered students in the system.</p>

        <!-- Control Bar (Search & Stats) -->
        <div class="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-8">
            
            <!-- Search Bar -->
            <div class="w-full md:w-1/3 mb-4 md:mb-0 relative">
                <input 
                    type="text" 
                    v-model="searchTerm" 
                    placeholder="Search by ID, Name, or Program..."
                    class="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <!-- Stats/Total -->
            <div class="text-lg font-semibold text-indigo-700">
                Total Students: {{ students.length }}
            </div>
        </div>

        <!-- Status Indicators -->
        <div v-if="isLoading" class="text-center p-8 text-indigo-600 font-semibold text-xl">
            <svg class="animate-spin inline-block w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading student list...
        </div>

        <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg shadow-md mb-4 font-semibold">
            <p class="font-bold">Error:</p>
            <p>{{ error }}</p>
        </div>

        <div v-else-if="students.length === 0 && !isLoading && !error" class="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-200">
            <p class="text-2xl font-bold text-gray-500">No Students Found</p>
            <p class="text-gray-400 mt-2">The student database is currently empty.</p>
        </div>

        <!-- Student Table -->
        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-indigo-600 text-white sticky top-0">
                    <tr>
                        <!-- Table Headers with Sorting -->
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-indigo-700 rounded-tl-xl"
                            @click="toggleSort('student_number')"
                        >
                            ID {{ getSortIcon('student_number') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-indigo-700"
                            @click="toggleSort('full_name')"
                        >
                            Full Name {{ getSortIcon('full_name') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-indigo-700"
                            @click="toggleSort('program')"
                        >
                            Program {{ getSortIcon('program') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition hover:bg-indigo-700"
                            @click="toggleSort('year_level')"
                        >
                            Year Level {{ getSortIcon('year_level') }}
                        </th>
                        <th 
                            class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider rounded-tr-xl"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="student in sortedStudents" :key="student.student_number" class="hover:bg-indigo-50 transition duration-150">
                        <!-- Use student_number for ID -->
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-indigo-700">{{ student.student_number }}</td>
                        <!-- Use combined name helper for display -->
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-semibold">{{ getFullName(student) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ student.program }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ student.year_level }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                            <!-- Placeholder Actions -->
                            <button class="text-indigo-600 hover:text-indigo-900 mx-1 p-1 rounded-md hover:bg-indigo-100 transition">View</button>
                            <button class="text-red-600 hover:text-red-900 mx-1 p-1 rounded-md hover:bg-red-100 transition">Delete</button>
                        </td>
                    </tr>
                    
                    <!-- No search results row -->
                    <tr v-if="students.length > 0 && filteredStudents.length === 0">
                        <td colspan="5" class="text-center py-6 text-gray-500 italic">No results found for "{{ searchTerm }}"</td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<style scoped>
/* Scoped styles are generally not needed when using a comprehensive utility framework like Tailwind CSS */
</style>