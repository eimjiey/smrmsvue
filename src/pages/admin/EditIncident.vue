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
            setTimeout(() => {
                router.push({ name: 'AdminIncidents' });
            }, 1500);
        }
    } catch (error) {
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

const goBack = () => {
    router.push({ name: 'AdminIncidents' });
};


// --- START STYLING LOGIC (Helper functions must be defined as standard functions or exposed) ---

// Style Helpers (Functions must be defined outside computed if taking arguments)
const getInputStyle = (isSubmitting, isSelect = false, isOffenseDisabled = false) => {
    let base = {
        marginTop: '4px',
        display: 'block',
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        padding: '10px',
        border: '1px solid #ced4da',
        transition: 'all 0.15s',
        color: '#1d3e21', // Dark green text
        backgroundColor: '#f8fff8', // Off-white input background
        outline: 'none',
        boxSizing: 'border-box',
    };

    if (isSubmitting) {
        base = { ...base, opacity: 0.7, cursor: 'not-allowed' };
    }
    
    if (isSelect) {
        base = { ...base, appearance: 'none', backgroundColor: '#f8fff8' };
    }

    if (isOffenseDisabled) {
        base = { ...base, backgroundColor: '#e9ecef', color: '#6c757d', cursor: 'not-allowed' };
    }

    return base;
};

const getSectionContainerStyle = (sectionType) => {
    let base = {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid',
        marginBottom: '32px',
    };
    
    // Applying the general green theme colors
    if (sectionType === 'student') {
        return { ...base, borderColor: '#c3e6cb', backgroundColor: '#f0fff0' }; // Light mint/green
    } else if (sectionType === 'incident') {
        return { ...base, borderColor: '#ffd591', backgroundColor: '#fffbe5' }; // Light yellow/orange
    } else if (sectionType === 'offense') {
        return { ...base, borderColor: '#f5c6cb', backgroundColor: '#fffafa' }; // Light red/pink
    } else {
        return { ...base, borderColor: '#ced4da', backgroundColor: '#f8f9fa' }; // Gray
    }
};

const getSectionHeaderStyle = (sectionType) => {
    let color = '#1d3e21';
    if (sectionType === 'incident') {
        color = '#d97706'; // Darker orange
    } else if (sectionType === 'offense') {
        color = '#dc2626'; // Red
    }
    return {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: color,
        marginBottom: '12px',
    };
};

// --- COMPUTED STYLES ---

const containerStyle = computed(() => ({
    minHeight: '100vh',
    backgroundColor: '#e6f0e7', // Light green background
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Inter, Arial, sans-serif',
}));

const wrapperStyle = computed(() => ({
    width: '100%',
    maxWidth: '1024px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '24px 40px',
    marginTop: '50px', // Offset for fixed nav
}));

const mainTitleStyle = computed(() => ({
    fontSize: '1.875rem', 
    fontWeight: '800',
    color: '#1d3e21',
    marginBottom: '24px',
    borderBottom: '4px solid #c3e6cb',
    paddingBottom: '12px',
}));

const loadingStyle = computed(() => ({
    textAlign: 'center',
    padding: '48px',
    color: '#1d3e21',
    fontWeight: '600',
    fontSize: '1.25rem',
}));

const notFoundBoxStyle = computed(() => ({
    textAlign: 'center',
    padding: '48px',
    backgroundColor: '#f8d7da',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f5c6cb',
}));

const notFoundTitleStyle = computed(() => ({
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#721c24',
}));

const notFoundSubTitleStyle = computed(() => ({
    color: '#721c24',
    marginTop: '8px',
}));

const goBackButtonStyle = computed(() => ({
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#1d3e21',
    color: '#fff',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
}));

const submitErrorBoxStyle = computed(() => {
    let base = {
        border: '1px solid',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontWeight: '600',
        marginBottom: '20px',
    };
    if (submitError.value && submitError.value.startsWith('✅')) {
        return { ...base, backgroundColor: '#d4edda', color: '#155724', borderColor: '#c3e6cb' };
    } else {
        return { ...base, backgroundColor: '#f8d7da', color: '#721c24', borderColor: '#f5c6cb' };
    }
});

const formGroupLabelStyle = computed(() => ({
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
}));

const submissionButtonContainerStyle = computed(() => ({
    paddingTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
}));

const submitButtonStyle = computed(() => ({
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#38763a',
    transition: 'all 0.3s',
    cursor: 'pointer',
    outline: 'none',
}));

const cancelButtonStyle = computed(() => ({
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    fontSize: '1.125rem',
    fontWeight: '700',
    backgroundColor: '#6b7280',
    color: '#fff',
    transition: 'background-color 0.3s',
    border: 'none',
    cursor: 'pointer',
}));
</script>

<template>
    <div :style="containerStyle">
        <div :style="wrapperStyle">
            <h1 :style="mainTitleStyle">
                Edit Incident Report #{{ incidentId }}
            </h1>

            <div v-if="isLoading" :style="loadingStyle">
                Loading report data...
            </div>

            <div v-else-if="!incidentFound" :style="notFoundBoxStyle">
                <p :style="notFoundTitleStyle">Error: Report Not Found</p>
                <p :style="notFoundSubTitleStyle">The incident report with ID {{ incidentId }} does not exist or could not be loaded.</p>
                <button @click="goBack" :style="goBackButtonStyle">Go Back to List</button>
            </div>

            <form v-else @submit="handleSubmit" :style="{ display: 'flex', flexDirection: 'column', gap: '32px' }">
                <div v-if="submitError" :style="submitErrorBoxStyle">
                    <p>{{ submitError }}</p>
                </div>

                <div :style="getSectionContainerStyle('student')">
                    <h2 :style="getSectionHeaderStyle('student')">Student Details</h2>
                    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }">
                        
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="studentId" :style="formGroupLabelStyle">Student ID Number</label>
                            <input type="text" id="studentId" v-model="form.studentId" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="fullName" :style="formGroupLabelStyle">Full Name</label>
                            <input type="text" id="fullName" v-model="form.fullName" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="program" :style="formGroupLabelStyle">Program</label>
                            <input type="text" id="program" v-model="form.program" :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="yearLevel" :style="formGroupLabelStyle">Year Level</label>
                            <select id="yearLevel" v-model="form.yearLevel" :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting, true)">
                                <option v-for="level in yearLevels" :key="level" :value="level">{{ level }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div :style="getSectionContainerStyle('incident')">
                    <h2 :style="getSectionHeaderStyle('incident')">Incident Details</h2>
                    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }">
                        
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="date" :style="formGroupLabelStyle">Date of Incident</label>
                            <input type="date" id="date" v-model="form.dateOfIncident" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>

                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="time" :style="formGroupLabelStyle">Time of Incident</label>
                            <input type="time" id="time" v-model="form.timeOfIncident" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>

                        <div :style="{ gridColumn: 'span 2' }">
                            <label for="location" :style="formGroupLabelStyle">Location of Incident</label>
                            <input type="text" id="location" v-model="form.location" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting)">
                        </div>
                    </div>
                </div>

                <div :style="getSectionContainerStyle('offense')">
                    <h2 :style="getSectionHeaderStyle('offense')">Offense Type</h2>
                    <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }">
                        
                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="offenseCategory" :style="formGroupLabelStyle">1. Offense Category</label>
                            <select id="offenseCategory" v-model="form.offenseCategory" required :disabled="isSubmitting"
                                :style="getInputStyle(isSubmitting, true)">
                                <option v-for="category in offenseCategories" :key="category.name" :value="category.name">{{ category.name }}</option>
                            </select>
                        </div>

                        <div :style="{ gridColumn: 'span 1' }">
                            <label for="specificOffense" :style="formGroupLabelStyle">2. Specific Offense</label>
                            <select id="specificOffense" v-model="form.specificOffense" :disabled="!form.offenseCategory || isSubmitting" required
                                :style="getInputStyle(isSubmitting, true, !form.offenseCategory)">
                                <option v-for="offense in availableOffenses" :key="offense" :value="offense">{{ offense }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div :style="getSectionContainerStyle('description')">
                    <h2 :style="getSectionHeaderStyle('description')">Description</h2>
                    <label for="description" :style="formGroupLabelStyle">Detailed Description of Incident (Required)</label>
                    <textarea id="description" v-model="form.description" rows="5" required :disabled="isSubmitting"
                        :style="{...getInputStyle(isSubmitting), height: '120px'}"></textarea>
                </div>

                <div :style="submissionButtonContainerStyle">
                    <button type="button" @click="goBack" :style="cancelButtonStyle">
                        Cancel
                    </button>
                    <button type="submit" :disabled="isSubmitting" :style="submitButtonStyle">
                        {{ isSubmitting ? 'Updating...' : 'Save Changes' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>