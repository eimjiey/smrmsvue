<script setup>
import { reactive, computed, watch, ref } from 'vue'; // Added ref for status tracking

// --- Static Data ---
const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
// Structured data for cleaner backend logic (offense_types in the database)
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
    course: '',
    program: '',
    yearLevel: yearLevels[0],
    section: '',
    // Initialize date/time to current values for user convenience
    dateOfIncident: new Date().toISOString().substring(0, 10),
    timeOfIncident: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    location: '',
    offenseCategory: '', // Initial state for the Category dropdown
    specificOffense: '', // Initial state for the specific offense dropdown
    description: '',
});

// --- API State ---
const isSubmitting = ref(false);
const submitError = ref(null);
const isSubmitted = ref(false);
const maxRetries = 3;

// --- Computed Properties & Logic ---

// Dynamically filters the list of specific offenses based on the selected category.
const availableOffenses = computed(() => {
    const category = offenseCategories.find(c => c.name === form.offenseCategory);
    return category ? category.offenses : [];
});

// Resets the specific offense whenever the category changes (The "automatic" part).
watch(() => form.offenseCategory, () => {
    form.specificOffense = '';
});

// --- Utility for Exponential Backoff ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Submission Handler: Connect to Laravel Backend ---
const handleSubmit = async (event) => {
    event.preventDefault();
    isSubmitting.value = true;
    submitError.value = null;
    isSubmitted.value = false;

    // Deep copy of the form data for API transmission
    const submittedData = JSON.parse(JSON.stringify(form));
    const API_URL = '/api/incidents'; // *** The Laravel API Endpoint ***

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Wait for delay if not the first attempt
            if (attempt > 0) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s delay
                await sleep(delay);
            }
            
            console.log(`Attempt ${attempt + 1}: Submitting data to ${API_URL}`);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // NOTE: In a real Laravel application, you would also need to handle
                    // the CSRF token if using session-based authentication:
                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content, 
                },
                body: JSON.stringify(submittedData)
            });

            if (!response.ok) {
                // Read the response body for detailed error message
                let errorDetails = await response.text();
                try {
                    errorDetails = JSON.parse(errorDetails);
                    // Attempt to extract Laravel validation/exception message
                    errorDetails = errorDetails.message || errorDetails.error || JSON.stringify(errorDetails);
                } catch (e) {
                    // Use raw text if JSON parsing fails
                }
                throw new Error(`Server returned status ${response.status}. ${errorDetails}`);
            }

            // Success handling: Assuming Laravel returns a 201 Created or 200 OK
            isSubmitted.value = true;
            isSubmitting.value = false;
            // Optionally reset form after success
            // Object.assign(form, { ...initialFormState, timeOfIncident: form.timeOfIncident, dateOfIncident: form.dateOfIncident }); 
            break; // Exit loop on success

        } catch (error) {
            console.error(`Submission failed on attempt ${attempt + 1}:`, error.message);
            
            // Set error only after the final attempt
            if (attempt === maxRetries - 1) {
                submitError.value = `Failed to file report. Please ensure the server is running and try again. Error: ${error.message}`;
            }
        } finally {
            // Ensure loading state is reset outside of the loop structure if needed, 
            // but we keep it inside the loop to reset on success break.
            if (attempt === maxRetries - 1 || isSubmitted.value) {
                isSubmitting.value = false;
            }
        }
    }
};
</script>

<template>
    <!-- NOTE: This component assumes Tailwind CSS is loaded in the main HTML file. -->
    <div class="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center font-inter">
        <div class="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 md:p-10">
            <h1 class="text-3xl font-extrabold text-indigo-700 mb-6 border-b-4 border-indigo-200 pb-3">File Incident Report</h1>

            <!-- Submission Status Messages -->
            <div v-if="isSubmitting" class="p-4 mb-4 text-center bg-indigo-100 text-indigo-700 rounded-lg shadow-md font-semibold flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Filing report... Please wait.
            </div>

            <div v-else-if="submitError" class="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md font-semibold">
                <p class="font-bold">Submission Error:</p>
                <p>{{ submitError }}</p>
            </div>

            <div v-else-if="isSubmitted" class="p-4 mb-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md font-semibold">
                <p>✅ Incident Report filed successfully!</p>
            </div>

            <form @submit="handleSubmit" class="space-y-8">
                <!-- Section 1: Student Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-indigo-200 p-4 rounded-xl bg-indigo-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-indigo-600 mb-3">Student Details</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="studentId" class="block text-sm font-medium text-gray-700">Student ID Number</label>
                        <input type="text" id="studentId" v-model="form.studentId" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="fullName" v-model="form.fullName" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="program" class="block text-sm font-medium text-gray-700">Program</label>
                        <input type="text" id="program" v-model="form.program"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="yearLevel" class="block text-sm font-medium text-gray-700">Year Level</label>
                        <select id="yearLevel" v-model="form.yearLevel"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border bg-white transition duration-150">
                            <option v-for="level in yearLevels" :key="level" :value="level">{{ level }}</option>
                        </select>
                    </div>

                    <div class="col-span-1">
                        <label for="section" class="block text-sm font-medium text-gray-700">Section</label>
                        <input type="text" id="section" v-model="form.section"
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                </div>

                <!-- Section 2: Incident Details -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-yellow-300 p-4 rounded-xl bg-yellow-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-yellow-700 mb-3">Incident Details</h2>
                    </div>

                    <div class="col-span-1">
                        <label for="date" class="block text-sm font-medium text-gray-700">Date of Incident</label>
                        <input type="date" id="date" v-model="form.dateOfIncident" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="col-span-1">
                        <label for="time" class="block text-sm font-medium text-gray-700">Time of Incident</label>
                        <input type="time" id="time" v-model="form.timeOfIncident" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>

                    <div class="md:col-span-2">
                        <label for="location" class="block text-sm font-medium text-gray-700">Location of Incident</label>
                        <input type="text" id="location" v-model="form.location" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150">
                    </div>
                </div>

                <!-- Section 3: Offense Type (Two-Tier Dropdown) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border border-red-300 p-4 rounded-xl bg-red-50/50">
                    <div class="md:col-span-2">
                        <h2 class="text-xl font-semibold text-red-600 mb-3">Offense Type</h2>
                    </div>

                    <!-- 1. Offense Category (Minor or Major) -->
                    <div class="col-span-1">
                        <label for="offenseCategory" class="block text-sm font-medium text-gray-700 font-bold">1. Offense Category (Minor or Major)</label>
                        <select id="offenseCategory" v-model="form.offenseCategory" required
                            class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border bg-white transition duration-150">
                            <option value="" disabled>Select Category</option>
                            <option v-for="category in offenseCategories" :key="category.name" :value="category.name">
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <!-- 2. Specific Offense (Filtered List) -->
                    <div class="col-span-1">
                        <label for="specificOffense" class="block text-sm font-medium text-gray-700 font-bold">2. Specific Offense</label>
                        <select id="specificOffense" v-model="form.specificOffense" :disabled="!form.offenseCategory" required
                            class="mt-1 block w-full rounded-lg shadow-sm p-2.5 border bg-white transition duration-150"
                            :class="{
                                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500': form.offenseCategory,
                                'bg-gray-200 text-gray-500 cursor-not-allowed': !form.offenseCategory
                            }">
                            <option value="" disabled>
                                {{ form.offenseCategory ? 'Select specific offense' : 'Select a category first' }}
                            </option>
                            <option v-for="offense in availableOffenses" :key="offense" :value="offense">
                                {{ offense }}
                            </option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <div v-if="form.specificOffense" class="mt-2 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm font-semibold">
                            Offense Selected: <span class="font-extrabold">{{ form.specificOffense }}</span>
                            <span class="text-red-600 ml-2">({{ form.offenseCategory }})</span>
                        </div>
                    </div>
                </div>

                <!-- Section 4: Description -->
                <div class="border border-gray-300 p-4 rounded-xl bg-gray-50/50">
                    <h2 class="text-xl font-semibold text-gray-700 mb-3">Description</h2>
                    <label for="description" class="block text-sm font-medium text-gray-700">Detailed Description of Incident (Required)</label>
                    <textarea id="description" v-model="form.description" rows="5" required
                        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border transition duration-150"></textarea>
                </div>

                <!-- Submission Button -->
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