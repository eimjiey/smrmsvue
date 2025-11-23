<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api'; 

// --- Setup ---
const route = useRoute();
const router = useRouter();
const incidentId = route.params.id;

// --- Static Data ---
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const offenseCategories = [
    { name: 'Minor Offense', offenses: ['Failure to wear uniform', 'Pornographic materials', 'Littering', 'Loitering', 'Eating in restricted areas', 'Unauthorized use of school facilities', 'Lending/borrowing ID', 'Driving violations'] },
    { name: 'Major Offense', offenses: ['Alcohol/drugs/weapons', 'Smoking', 'Disrespect', 'Vandalism', 'Cheating/forgery', 'Barricades/obstructions', 'Physical/verbal assault', 'Hazing', 'Harassment/sexual abuse', 'Unauthorized software/gadgets', 'Unrecognized fraternity/sorority', 'Gambling', 'Public indecency', 'Offensive/subversive materials', 'Grave threats', 'Inciting fight/sedition', 'Unauthorized activity', 'Bullying'] }
];

// --- Form State ---
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

// --- Component State ---
const isLoading = ref(true);
const isSubmitting = ref(false);
const submitError = ref(null);
const incidentFound = ref(true);

// --- Computed Properties & Logic ---

const availableOffenses = computed(() => {
    const category = offenseCategories.find(c => c.name === form.offenseCategory);
    return category ? category.offenses : [];
});

// --- API Logic ---

const fetchIncident = async () => {
    isLoading.value = true;
    try {
        const response = await api.get(`/incidents/${incidentId}`); 
        const data = response.data;

        if (!data) {
            incidentFound.value = false;
            return;
        }

        // Map snake_case from Laravel model to camelCase for the form state
        form.studentId = data.student_id;
        form.fullName = data.full_name;
        form.program = data.program || '';
        form.yearLevel = data.year_level;
        form.section = data.section || '';
        form.dateOfIncident = data.date_of_incident;
        form.timeOfIncident = data.time_of_incident.substring(0, 5); // Format HH:MM
        form.location = data.location;
        form.offenseCategory = data.offense_category;
        form.specificOffense = data.specific_offense;
        form.description = data.description;

    } catch (err) {
        console.error('Failed to fetch incident for editing:', err);
        incidentFound.value = false;
        submitError.value = `Error loading report: ${err.response?.data?.message || err.message}`;
    } finally {
        isLoading.value = false;
    }
};

const handleSubmit = async (event) => {
    event.preventDefault();
    isSubmitting.value = true;
    submitError.value = null;

    // Data structure for PUT request, using the snake_case keys Laravel expects
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
            // Redirect back to the incidents list after a short delay
            setTimeout(() => {
                router.push({ name: 'AdminIncidents' });
            }, 1500);
        }
    } catch (error) {
        console.error('Update failed:', error);
        submitError.value = error.response?.data?.message || 'Update failed due to server error.';
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    if (incidentId) {
        fetchIncident();
    } else {
        incidentFound.value = false;
    }
});

// Helper function to redirect back to the list
const goBack = () => {
    router.push({ name: 'AdminIncidents' });
};
</script>

<template>
    <div class="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center font-inter">
        <div class="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-10">
            <h1 class="text-3xl font-extrabold text-indigo-700 mb-6 border-b-4 border-indigo-200 pb-3">
                Edit Incident Report #{{ incidentId }}
            </h1>

            <div v-if="isLoading" class="text-center p-12 text-indigo-600 font-semibold text-xl">
                Loading report data...
            </div>

            <div v-else-if="!incidentFound" class="text-center p-12 bg-red-100 rounded-xl shadow-lg border border-red-400">
                <p class="text-2xl font-bold text-red-700">Error: Report Not Found</p>
                <p class="text-red-500 mt-2">The incident report with ID {{ incidentId }} does not exist or could not be loaded.</p>
                <button @click="goBack" class="mt-4 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Go Back to List</button>
            </div>

            <form v-else @submit="handleSubmit" class="space-y-8">
                <div v-if="submitError" 
                     :class="{'bg-green-100 border-green-400 text-green-700': submitError.startsWith('✅'), 'bg-red-100 border-red-400 text-red-700': !submitError.startsWith('✅')}" 
                     class="border p-4 rounded-lg shadow-md font-semibold">
                    <p>{{ submitError }}</p>
                </div>

                <!-- Section 1: Student Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-indigo-600 mb-3">Student Details</h2>
                    </div>
                    
                    <div class="col-span-1">
                        <label for="studentId" class="block text-sm font-medium text-gray-700">Student ID Number</label>
                        <input type="text" id="studentId" v-model="form.studentId" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                    <div class="col-span-1">
                        <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="fullName" v-model="form.fullName" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                    <div class="col-span-1">
                        <label for="program" class="block text-sm font-medium text-gray-700">Program</label>
                        <input type="text" id="program" v-model="form.program" :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                    <div class="col-span-1">
                        <label for="yearLevel" class="block text-sm font-medium text-gray-700">Year Level</label>
                        <select id="yearLevel" v-model="form.yearLevel" :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border bg-white transition duration-150">
                            <option v-for="level in yearLevels" :key="level" :value="level">{{ level }}</option>
                        </select>
                    </div>
                </div>

                <!-- Section 2: Incident Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-yellow-300 p-4 rounded-xl bg-yellow-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-yellow-700 mb-3">Incident Details</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="date" class="block text-sm font-medium text-gray-700">Date of Incident</label>
                        <input type="date" id="date" v-model="form.dateOfIncident" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="time" class="block text-sm font-medium text-gray-700">Time of Incident</label>
                        <input type="time" id="time" v-model="form.timeOfIncident" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="md:col-span-2">
                        <label for="location" class="block text-sm font-medium text-gray-700">Location of Incident</label>
                        <input type="text" id="location" v-model="form.location" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                </div>

                <!-- Section 3: Offense Type (Two-Tier Dropdown) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-red-300 p-4 rounded-xl bg-red-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-red-600 mb-3">Offense Type</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="offenseCategory" class="block text-sm font-medium text-gray-700 font-bold">1. Offense Category</label>
                        <select id="offenseCategory" v-model="form.offenseCategory" required :disabled="isSubmitting"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border bg-white transition duration-150">
                            <option v-for="category in offenseCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
                        </select>
                    </div>

                    <div class="col-span-1">
                        <label for="specificOffense" class="block text-sm font-medium text-gray-700 font-bold">2. Specific Offense</label>
                        <select id="specificOffense" v-model="form.specificOffense" :disabled="!form.offenseCategory || isSubmitting" required
                            class="mt-1 block w-full rounded-lg shadow-sm p-2.5 border bg-white transition duration-150"
                            :class="{ 'bg-gray-200 text-gray-500 cursor-not-allowed': !form.offenseCategory }">
                            <option v-for="offense in availableOffenses" :key="offense" :value="offense">{{ offense }}</option>
                        </select>
                    </div>
                </div>

                <!-- Section 4: Description -->
                <div class="border border-gray-300 p-4 rounded-xl bg-gray-50/50">
                    <h2 class="text-xl font-semibold text-gray-700 mb-3">Description</h2>
                    <label for="description" class="block text-sm font-medium text-gray-700">Detailed Description of Incident (Required)</label>
                    <textarea id="description" v-model="form.description" rows="5" required :disabled="isSubmitting"
                        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150"></textarea>
                </div>

                <!-- Submission Button -->
                <div class="pt-4 flex justify-between space-x-4">
                    <button type="button" @click="goBack" class="py-3 px-4 rounded-lg shadow-md text-lg font-bold bg-gray-300 text-gray-800 hover:bg-gray-400 transition duration-300">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isSubmitting"
                        class="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-xl text-lg font-bold text-white bg-green-600 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                        :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }">
                        {{ isSubmitting ? 'Updating...' : 'Save Changes' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>