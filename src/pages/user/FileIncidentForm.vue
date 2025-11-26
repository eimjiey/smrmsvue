<script setup>
import { reactive, computed, watch, ref } from 'vue';
import api from '@/services/api'; 

// --- Static Data ---
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const programs = ['BSIT', 'BSCS', 'BSDSA', 'BLIS', 'BSIS']; // Program list for dropdown

const offenseCategories = [
    {
        name: 'Minor Offense',
        offenses: [
            'Failure to wear uniform', 'Pornographic materials', 'Littering', 'Loitering',
            'Eating in restricted areas', 'Unauthorized use of school facilities',
            'Lending/borrowing ID', 'Driving violations'
        ]
    },
    {
        name: 'Major Offense',
        offenses: [
            'Alcohol/drugs/weapons', 'Smoking', 'Disrespect', 'Vandalism', 'Cheating/forgery',
            'Barricades/obstructions', 'Physical/verbal assault', 'Hazing', 'Harassment/sexual abuse',
            'Unauthorized software/gadgets', 'Unrecognized fraternity/sorority',
            'Gambling', 'Public indecency', 'Offensive/subversive materials', 'Grave threats',
            'Inciting fight/sedition', 'Unauthorized activity', 'Bullying'
        ]
    }
];

// --- Form State ---
const form = reactive({
    studentId: '',
    fullName: '',
    course: '', // Not used in form/controller, but retained in state
    program: '', // Initialized to empty string for dropdown selection
    yearLevel: yearLevels[0],
    section: '',
    // Initialize date/time to current values for user convenience
    dateOfIncident: new Date().toISOString().substring(0, 10),
    timeOfIncident: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: '',
    offenseCategory: '', 
    specificOffense: '', 
    description: '',
});

// --- API State ---
const isSubmitting = ref(false);
const submitError = ref(null);
const validationErrors = ref({}); // To hold field-specific errors
const isSubmitted = ref(false);
const maxRetries = 3;

// --- Computed Properties & Logic ---

const availableOffenses = computed(() => {
    const category = offenseCategories.find(c => c.name === form.offenseCategory);
    return category ? category.offenses : [];
});

watch(() => form.offenseCategory, () => {
    form.specificOffense = '';
});

// --- Utility for Exponential Backoff ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Submission Handler: UPDATED to handle 422 validation errors and fix ESLint error ---
const handleSubmit = async (event) => {
    event.preventDefault();
    isSubmitting.value = true;
    submitError.value = null;
    validationErrors.value = {}; // Clear errors on new submission
    isSubmitted.value = false;

    const submittedData = JSON.parse(JSON.stringify(form));
    
    const API_ENDPOINT = '/incidents'; 

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.pow(2, attempt) * 1000; 
                await sleep(delay);
            }
            
            console.log(`Attempt ${attempt + 1}: Submitting data to ${API_ENDPOINT} (via API Service)`);

            const response = await api.post(API_ENDPOINT, submittedData); 
            
            if (response.status === 201 || response.status === 200) {
                 isSubmitted.value = true;
                 break; // Exit loop on success
            }
        } catch (error) {
            console.error(`Submission failed on attempt ${attempt + 1}:`, error.message);
            
            let errorMessage = 'An unexpected error occurred.';

            if (error.response) {
                if (error.response.status === 422) {
                    // Handle Laravel Validation Errors
                    validationErrors.value = error.response.data.errors;
                    submitError.value = 'Validation failed. Please correct the highlighted fields.';
                    isSubmitting.value = false; // Stop loading here for immediate feedback
                    break; // Exit loop immediately on validation failure
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.status === 404) {
                    errorMessage = `Route Not Found (404). Check Laravel route.`;
                } else {
                    errorMessage = `Server Error (${error.response.status}).`;
                }
            } else if (error.request) {
                errorMessage = 'Network Error: Could not reach the API server. Check server address/connectivity.';
            } else {
                errorMessage = error.message;
            }

            // Set final general error message if retries fail 
            if (attempt === maxRetries - 1) {
                submitError.value = `Failed to file report after ${maxRetries} attempts. Error: ${errorMessage}`;
            }

        } finally {
            // FIX: Only check the loop termination condition. isSubmitting is set to false 
            // either upon success, 422 error, or on the final failed attempt.
            if (attempt === maxRetries - 1 || isSubmitted.value) {
                isSubmitting.value = false;
            }
        }
    }
};

// Helper function to get the first error message for a field
const getError = (fieldName) => {
    return validationErrors.value[fieldName] ? validationErrors.value[fieldName][0] : null;
};
</script>

<template>
    <div class="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center font-inter">
        <div class="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-10">
            <h1 class="text-3xl font-extrabold text-indigo-700 mb-6 border-b-4 border-indigo-200 pb-3">File Incident Report</h1>

            <div v-if="isSubmitting" class="p-4 mb-4 text-center bg-indigo-100 text-indigo-700 rounded-lg shadow-md font-semibold flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Filing report... Please wait.
            </div>

            <div v-else-if="submitError" class="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md font-semibold">
                <p class="font-bold">🚨 Submission Error: Please fix the errors below.</p>
                <p>{{ submitError }}</p>
            </div>

            <div v-else-if="isSubmitted" class="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md font-semibold">
                <p>✅ Incident Report filed successfully!</p>
            </div>

            <form @submit="handleSubmit" class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-indigo-600 mb-3">Student Details</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="studentId" class="block text-sm font-medium text-gray-700">Student ID Number</label>
                        <input type="text" id="studentId" v-model="form.studentId" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('studentId'), 'border-gray-300 focus:border-indigo-500': !getError('studentId')}">
                        <p v-if="getError('studentId')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('studentId') }}</p>
                    </div>

                    <div class="col-span-1">
                        <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="fullName" v-model="form.fullName" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('fullName'), 'border-gray-300 focus:border-indigo-500': !getError('fullName')}">
                        <p v-if="getError('fullName')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('fullName') }}</p>
                    </div>

                    <div class="col-span-1">
                        <label for="program" class="block text-sm font-medium text-gray-700">Program</label>
                        <select id="program" v-model="form.program" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border bg-white transition duration-150"
                            :class="{'border-red-500': getError('program'), 'border-gray-300 focus:border-indigo-500': !getError('program')}">
                            <option value="" disabled>Select Program</option>
                            <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
                        </select>
                        <p v-if="getError('program')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('program') }}</p>
                    </div>
                    
                    <div class="col-span-1">
                        <label for="yearLevel" class="block text-sm font-medium text-gray-700">Year Level</label>
                        <select id="yearLevel" v-model="form.yearLevel" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border bg-white transition duration-150"
                            :class="{'border-red-500': getError('yearLevel'), 'border-gray-300 focus:border-indigo-500': !getError('yearLevel')}">
                            <option v-for="level in yearLevels" :key="level" :value="level">{{ level }}</option>
                        </select>
                        <p v-if="getError('yearLevel')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('yearLevel') }}</p>
                    </div>

                    <div class="col-span-1">
                        <label for="section" class="block text-sm font-medium text-gray-700">Section</label>
                        <input type="text" id="section" v-model="form.section"
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('section'), 'border-gray-300 focus:border-indigo-500': !getError('section')}">
                        <p v-if="getError('section')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('section') }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-yellow-300 p-4 rounded-xl bg-yellow-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-yellow-700 mb-3">Incident Details</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="date" class="block text-sm font-medium text-gray-700">Date of Incident</label>
                        <input type="date" id="date" v-model="form.dateOfIncident" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('dateOfIncident'), 'border-gray-300 focus:border-indigo-500': !getError('dateOfIncident')}">
                        <p v-if="getError('dateOfIncident')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('dateOfIncident') }}</p>
                    </div>

                    <div class="col-span-1">
                        <label for="time" class="block text-sm font-medium text-gray-700">Time of Incident</label>
                        <input type="time" id="time" v-model="form.timeOfIncident" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('timeOfIncident'), 'border-gray-300 focus:border-indigo-500': !getError('timeOfIncident')}">
                        <p v-if="getError('timeOfIncident')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('timeOfIncident') }}</p>
                    </div>

                    <div class="md:col-span-2">
                        <label for="location" class="block text-sm font-medium text-gray-700">Location of Incident</label>
                        <input type="text" id="location" v-model="form.location" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                            :class="{'border-red-500': getError('location'), 'border-gray-300 focus:border-indigo-500': !getError('location')}">
                        <p v-if="getError('location')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('location') }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-red-300 p-4 rounded-xl bg-red-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-red-600 mb-3">Offense Type</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="offenseCategory" class="block text-sm font-medium text-gray-700 font-bold">1. Offense Category (Minor or Major)</label>
                        <select id="offenseCategory" v-model="form.offenseCategory" required
                            class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border bg-white transition duration-150"
                            :class="{'border-red-500': getError('offenseCategory'), 'border-gray-300 focus:border-indigo-500': !getError('offenseCategory')}">
                            <option value="" disabled>Select Category</option>
                            <option v-for="category in offenseCategories" :key="category.name" :value="category.name">
                                {{ category.name }}
                            </option>
                        </select>
                        <p v-if="getError('offenseCategory')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('offenseCategory') }}</p>
                    </div>

                    <div class="col-span-1">
                        <label for="specificOffense" class="block text-sm font-medium text-gray-700 font-bold">2. Specific Offense</label>
                        <select id="specificOffense" v-model="form.specificOffense" :disabled="!form.offenseCategory" required
                            class="mt-1 block w-full rounded-lg shadow-sm p-2.5 border bg-white transition duration-150"
                            :class="{
                                'border-red-500': getError('specificOffense'), 
                                'border-gray-300 focus:border-indigo-500': !getError('specificOffense'),
                                'bg-gray-200 text-gray-500 cursor-not-allowed': !form.offenseCategory
                            }">
                            <option value="" disabled>
                                {{ form.offenseCategory ? 'Select specific offense' : 'Select a category first' }}
                            </option>
                            <option v-for="offense in availableOffenses" :key="offense" :value="offense">
                                {{ offense }}
                            </option>
                        </select>
                        <p v-if="getError('specificOffense')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('specificOffense') }}</p>
                    </div>

                    <div class="md:col-span-2">
                        <div v-if="form.specificOffense" class="mt-2 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm font-semibold">
                            Offense Selected: <span class="font-extrabold">{{ form.specificOffense }}</span>
                            <span class="text-red-600 ml-2">({{ form.offenseCategory }})</span>
                        </div>
                    </div>
                </div>

                <div class="border border-gray-300 p-4 rounded-xl bg-gray-50/50">
                    <h2 class="text-xl font-semibold text-gray-700 mb-3">Description</h2>
                    <label for="description" class="block text-sm font-medium text-gray-700">Detailed Description of Incident (Required)</label>
                    <textarea id="description" v-model="form.description" rows="5" required
                        class="mt-1 block w-full rounded-lg shadow-sm focus:ring-indigo-500 p-2.5 border transition duration-150"
                        :class="{'border-red-500': getError('description'), 'border-gray-300 focus:border-indigo-500': !getError('description')}"></textarea>
                    <p v-if="getError('description')" class="mt-1 text-sm text-red-600 font-semibold">{{ getError('description') }}</p>
                </div>

                <div class="pt-4">
                    <button type="submit" :disabled="isSubmitting"
                        class="w-full py-3 px-4 border border-transparent rounded-lg shadow-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:-translate-y-0.5"
                        :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }">
                        {{ isSubmitting ? 'Filing...' : 'File Report' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
/* Optional: Adding 'Inter' font via a common Tailwind setup or global styles for consistency */
</style>