<template>
    <div class="report-page">
        <header class="report-header-bar">
            <div class="report-title-left">
                <svg viewBox="0 0 24 24" fill="currentColor" class="header-icon-svg">
                    <path d="M4 4h6v6H4V4zm0 10h6v6H4v-6zm10-10h6v6h-6V4zm0 10h6v6h-6v-6z"/>
                </svg>
                REPORT AN INCIDENT
            </div>
            <div class="profile-icon-right">
                <svg viewBox="0 0 24 24" fill="currentColor" class="header-icon-svg-profile">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        </header>

        <div class="form-container">
            <h1 class="main-title-text">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>
            
            <div v-if="isSubmitting" class="submission-status submission-loading">
                Submitting report... Please wait.
            </div>

            <div v-else-if="submitError" class="submission-status submission-error">
                🚨 Submission Error: {{ submitError }}
            </div>

            <form @submit.prevent="handleSubmit" class="incident-form-grid">

                <div class="input-group">
                    <label for="studentId">Student ID</label>
                    <input 
                        type="text" 
                        id="studentId" 
                        v-model="form.studentId" 
                        :disabled="true"
                        required
                        class="auto-filled-field"
                    >
                    <p v-if="studentsLoadError" class="lookup-status lookup-error">
                        ❌ Load Error: {{ studentsLoadError }}
                    </p>
                    <p v-if="validationErrors.studentId" class="error-message">{{ validationErrors.studentId[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="fullNameSelect">Full Name (Select Student)</label>
                    
                    <template v-if="isStudentsLoading">
                        <input type="text" disabled value="Loading student roster from database..." class="loading-input"/>
                    </template>
                    
                    <template v-else>
                        <select 
                            id="fullNameSelect" 
                            v-model="form.studentId" 
                            :disabled="isSubmitting"
                            required
                        >
                            <option value="" disabled>Select Student Name</option>
                            <option 
                                v-for="student in allStudents" 
                                :key="student.id" 
                                :value="student.id"
                            >
                                {{ student.fullName }}
                            </option>
                        </select>
                    </template>

                    <p v-if="validationErrors.fullName" class="error-message">{{ validationErrors.fullName[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="program">Program</label>
                    <input 
                        type="text" 
                        id="program" 
                        v-model="form.program" 
                        disabled 
                        required 
                        class="auto-filled-field"
                    >
                    <p v-if="validationErrors.program" class="error-message">{{ validationErrors.program[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="yearLevel">Year Level</label>
                    <input 
                        type="text" 
                        id="yearLevel" 
                        v-model="form.yearLevel" 
                        disabled 
                        required 
                        class="auto-filled-field"
                    >
                    <p v-if="validationErrors.yearLevel" class="error-message">{{ validationErrors.yearLevel[0] }}</p>
                </div>
                
                <div class="input-group">
                    <label for="section">Section</label>
                    <input 
                        type="text" 
                        id="section" 
                        v-model="form.section"
                        disabled
                        class="auto-filled-field"
                    >
                    <p v-if="validationErrors.section" class="error-message">{{ validationErrors.section[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" v-model="form.location" required>
                    <p v-if="validationErrors.location" class="error-message">{{ validationErrors.location[0] }}</p>
                </div>
                
                <div class="date-time-container input-group">
                    <label for="dateOfIncident" class="date-time-label">Date of Incident</label>
                    <input type="date" id="dateOfIncident" v-model="form.dateOfIncident" required> 
                    <p v-if="validationErrors.dateOfIncident" class="error-message">{{ validationErrors.dateOfIncident[0] }}</p>
                </div>
                
                <div class="date-time-container input-group">
                    <label for="timeOfIncident" class="date-time-label">Time of Incident</label>
                    <input type="time" id="timeOfIncident" v-model="form.timeOfIncident" required> 
                    <p v-if="validationErrors.timeOfIncident" class="error-message">{{ validationErrors.timeOfIncident[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="offenseCategory">Offense Category</label>
                    <select id="offenseCategory" v-model="form.offenseCategory" required>
                        <option value="" disabled>Select Category</option>
                        <option value="Minor Offense">Minor Offense</option>
                        <option value="Major Offense">Major Offense</option>
                    </select>
                    <p v-if="validationErrors.offenseCategory" class="error-message">{{ validationErrors.offenseCategory[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="specificOffense">Specific Offense</label>
                    <select 
                        id="specificOffense" 
                        v-model="form.specificOffense" 
                        :disabled="!form.offenseCategory"
                        required
                    >
                        <option value="" disabled>
                            {{ form.offenseCategory ? 'Select specific offense' : 'Select category first' }}
                        </option>
                        <option 
                            v-for="offense in filteredSpecificOffenses" 
                            :key="offense" 
                            :value="offense"
                        >
                            {{ offense }}
                        </option>
                    </select>
                    <p v-if="validationErrors.specificOffense" class="error-message">{{ validationErrors.specificOffense[0] }}</p>
                </div>
                
                <div class="input-group description-group full-span">
                    <label for="description">Description</label>
                    <textarea id="description" v-model="form.description" required></textarea>
                    <p v-if="validationErrors.description" class="error-message">{{ validationErrors.description[0] }}</p>
                </div>

                <div class="form-actions full-span">
                    <button type="button" class="btn-cancel" @click="resetForm">
                        Cancel
                    </button>
                    <button type="submit" class="btn-save" :disabled="isSubmitting || isStudentsLoading || !form.studentId">
                        {{ isSubmitting ? 'Filing...' : 'Save Incident' }}
                    </button>
                </div>
            </form>
        </div>
        
        <div 
            v-if="notifier.visible" 
            class="notifier"
            :class="{'notifier-success': notifier.type === 'success', 'notifier-error': notifier.type === 'error'}"
        >
             <div v-if="notifier.type === 'success'" class="recommendation-content">
                <p class="notification-title">✅ Report Filed! System Recommendation:</p>
                <div class="recommendation-box">
                    <strong>{{ recommendationText }}</strong>
                </div>
                <div class="notifier-actions">
                    <button @click="resetNotifier" class="btn-notifier-close">File New</button>
                    <button @click="navigateToDetails" class="btn-notifier-view">View Details</button>
                </div>
             </div>
             <div v-else>
                 {{ notifier.message }}
             </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; // Import your Axios instance

const router = useRouter(); 

// 📚 Data Store for all students (fetched from database)
const allStudents = ref([]);
const isStudentsLoading = ref(true); 
const studentsLoadError = ref(null);

// --- Offense Data ---
// CORRECTED OFFENSE LIST 
const specificOffenseOptions = {
    'Minor Offense': [
        "Failure to wear uniform", 
        "Pornographic materials", 
        "Littering", 
        "Loitering", 
        "Eating in restricted areas", 
        "Unauthorized use of school facilities",
        "Lending/borrowing ID", 
        "Driving violations",
    ],
    'Major Offense': [
        "Alcohol/drugs/weapons", 
        "Smoking", 
        "Disrespect", 
        "Vandalism", 
        "Cheating/forgery", 
        "Barricades/obstructions", 
        "Physical/verbal assault", 
        "Hazing", 
        "Harassment/sexual abuse", 
        "Unauthorized software/gadgets", 
        "Unrecognized fraternity/sorority", 
        "Gambling", 
        "Public indecency", 
        "Offensive/subversive materials", 
        "Grave threats", 
        "Inciting fight/sedition", 
        "Unauthorized activity", 
        "Bullying",
    ],
};

// --- Form State ---
const form = reactive({
    studentId: '', // Binds to Full Name dropdown value (the student_number)
    fullName: '', // Display/Submission field
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

// --- API/Submission State ---
const isSubmitting = ref(false);
const submitError = ref(null);
const validationErrors = ref({}); 

// --- Optimization/Notifier State ---
const notifier = reactive({
    visible: false,
    message: '',
    type: 'success', 
});
const recommendationText = ref('');
const newIncidentId = ref(null);

// --- Computed Property for Filtering ---
const filteredSpecificOffenses = computed(() => {
    const category = form.offenseCategory;
    return specificOffenseOptions[category] || [];
});


// ------------------------------------------------------------------
// 🎯 DATA FETCHING IMPLEMENTATION (Loads all students on page load)
// ------------------------------------------------------------------

const fetchAllStudents = async () => {
    isStudentsLoading.value = true;
    studentsLoadError.value = null;
    
    const STUDENTS_ENDPOINT = '/students/dropdown'; 
    
    try {
        const response = await api.get(STUDENTS_ENDPOINT);
        allStudents.value = response.data; 

    } catch (error) {
        studentsLoadError.value = 'Failed to load student roster. Check API configuration.';
        console.error("Error fetching students:", error);
        
    } finally {
        isStudentsLoading.value = false;
    }
};

// Run the fetch function when the component is mounted to the DOM
onMounted(() => {
    fetchAllStudents();
});


// ------------------------------------------------------------------
// 🎯 FULL NAME SELECTION WATCHER (Populates all derived fields)
// ------------------------------------------------------------------
watch(() => form.studentId, (newId) => {
    if (newId) {
        const selectedStudent = allStudents.value.find(s => s.id === newId);
        
        if (selectedStudent) {
            // Populate fields using the fetched data. 
            // We assume the API returns properties like 'program' and 'year_level'
            
            form.fullName = selectedStudent.fullName || (selectedStudent.first_name + ' ' + selectedStudent.last_name);
            
            // Fetching program and yearLevel:
            form.program = selectedStudent.program || selectedStudent.program_code || ''; 
            form.yearLevel = selectedStudent.year_level || selectedStudent.yearLevel || ''; 
            
            form.section = selectedStudent.section || '';
            studentsLoadError.value = null;
        } else {
            // Fallback clear logic
            form.fullName = '';
            form.program = '';
            form.yearLevel = '';
            form.section = '';
            studentsLoadError.value = 'Selected student details are missing.';
        }
    } else {
        // Clear all dependent fields if the dropdown is reset
        form.fullName = '';
        form.program = '';
        form.yearLevel = '';
        form.section = '';
    }
});


// --- Watcher to Reset Specific Offense (Unchanged) ---
watch(() => form.offenseCategory, (newCategory, oldCategory) => {
    if (newCategory !== oldCategory) {
        form.specificOffense = ''; 
    }
});

// --- Notifier Functions (Unchanged) ---
const showNotifier = (message, type = 'success', duration = 3000) => {
    notifier.message = message;
    notifier.type = type;
    notifier.visible = true;

    setTimeout(() => {
        if (notifier.type === 'error') {
            notifier.visible = false;
        }
    }, duration);
};

const resetNotifier = () => {
    notifier.visible = false;
    resetForm(); 
};

// --- Reset Form Function (Unchanged) ---
const resetForm = () => {
    form.studentId = '';
    form.fullName = '';
    form.program = '';
    form.yearLevel = '';
    form.section = '';
    form.dateOfIncident = '';
    form.timeOfIncident = '';
    form.location = '';
    form.offenseCategory = '';
    form.specificOffense = '';
    studentsLoadError.value = null;
};

// --- Navigation (Unchanged) ---
const navigateToDetails = () => {
    if (newIncidentId.value) {
        router.push({ name: 'ReportDetails', params: { id: newIncidentId.value } }); 
    }
    resetNotifier();
};

// ------------------------------------------------------------------
// --- SUBMISSION METHOD (Unchanged) ---
// ------------------------------------------------------------------
const handleSubmit = async () => {
    submitError.value = null;
    validationErrors.value = {}; 

    if (isStudentsLoading.value) {
        submitError.value = 'Please wait for student roster to finish loading.';
        showNotifier(submitError.value, 'error', 3000);
        return;
    }
    
    // Client-side Required Field Check
    const requiredFields = [ 'studentId', 'fullName', 'program', 'yearLevel', 'dateOfIncident', 'timeOfIncident', 'location', 'offenseCategory', 'specificOffense', 'description'];
    let missingFields = requiredFields.filter(field => !form[field] || String(form[field]).trim() === '');
    
    if (missingFields.length > 0) {
        const friendlyNames = missingFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        submitError.value = `Please fill out all required fields: ${friendlyNames.join(', ')}`;
        return; 
    }
    
    isSubmitting.value = true;
    const payload = JSON.parse(JSON.stringify(form));
    
    try {
        const response = await api.post('/incidents', payload); 

        if (response.status === 201 || response.status === 200) {
            const data = response.data;
            
            recommendationText.value = data.recommendation || 'The case has been filed and is awaiting review.';
            newIncidentId.value = data.incident.id || 'N/A'; 

            showNotifier('✅ Incident Successfully Reported!', 'success', 60000); 
        }
    } catch (error) {
        let errorMessage = 'An unexpected error occurred.';
        if (error.response) {
            if (error.response.status === 422) {
                validationErrors.value = error.response.data.errors;
                errorMessage = 'Validation failed. Please correct the highlighted fields.';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = `Server Error (${error.response.status}).`;
            }
        } else {
            errorMessage = 'Network Error: Could not connect to the API server.';
        }
        submitError.value = errorMessage;
        showNotifier(errorMessage, 'error', 5000);

    } finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
/* --- STYLES FOR THE GREEN DESIGN --- */

.report-page {
    width: 100%;
    min-height: 100vh;
    background-color: #EAF9E7; 
    font-family: Arial, sans-serif;
    padding-top: 50px;
    box-sizing: border-box;
}

/* --- HEADER BAR STYLES --- */
.report-header-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 40px;
    height: 50px;
    background-color: #51A687; 
    color: white;
    font-weight: bold;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.report-title-left {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
}

.header-icon-svg {
    width: 24px;
    height: 24px;
    color: white;
    margin-right: 8px;
}
.header-icon-svg-profile {
    width: 28px;
    height: 28px;
    color: #51A687;
}

.profile-icon-right {
    background-color: white;
    border-radius: 50px;
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* --- MAIN FORM LAYOUT --- */
.form-container {
    max-width: 1000px;
    margin: 20px auto;
    padding: 30px;
    background-color: #51A687; 
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid #448f72; 
}

.main-title-text {
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    color: white; 
    margin-bottom: 40px;
    padding-bottom: 10px;
}

/* --- GRID LAYOUT --- */
.incident-form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr); 
    gap: 20px 30px; 
    align-items: start;
}

.full-span {
    grid-column: 1 / -1;
}

/* --- INPUT FIELD STYLES (Applies to all inputs/selects) --- */
.input-group label, .date-time-label {
    display: block;
    font-size: 0.9rem;
    color: #f0f0f0; 
    margin-bottom: 5px;
    font-weight: 600;
}

.input-group input,
.input-group textarea,
.date-time-container input,
.input-group select { 
    width: 100%;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
    background-color: #fff;
    font-size: 1rem;
    box-sizing: border-box;
    -webkit-appearance: none; 
    -moz-appearance: none;
    appearance: none;
}

.input-group select {
    background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 30px;
}

.description-group textarea {
    min-height: 200px;
}

/* Auto-filled field style */
.auto-filled-field {
    background-color: #f0fff0; /* Light green/off-white */
    color: #444;
}

/* Error feedback */
.error-message {
    color: #ffdddd; 
    font-size: 0.8rem;
    margin-top: 5px;
}

/* --- STYLES FOR LOOKUP/LOADING FEATURE --- */

.loading-input {
    background-color: #f0f0f0; 
    color: #555;
    font-style: italic;
    cursor: wait;
}

/* Status messages for ID Lookup */
.lookup-status {
    font-size: 0.8rem;
    margin-top: 5px;
    font-weight: 500;
}

.lookup-loading {
    color: #ffffff; 
}

.lookup-error {
    color: #ffdddd; 
}

/* Submission Status Styles */
.submission-status {
    padding: 10px;
    margin-bottom: 20px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
}

.submission-loading {
    background-color: #1a1e1b;
    color: white;
}

.submission-error {
    background-color: #e53e3e;
    color: white;
}


/* --- BUTTONS --- */
.form-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end; 
    gap: 15px;
    margin-top: 30px;
    padding-top: 10px;
}

.form-actions button {
    padding: 12px 30px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #323A36; 
    color: white;
}

.form-actions button.btn-cancel {
    background-color: #778899; 
}
.form-actions button.btn-cancel:hover:not(:disabled) {
    background-color: #5d6872;
}

.form-actions button.btn-save:hover:not(:disabled) {
    background-color: #1a1e1b;
}

.form-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* --- NOTIFIER (Success Modal) */
.notifier {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); 
    padding: 15px 30px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    width: 350px; 
}

.notifier-success {
    background-color: #4CAF50; 
    min-height: 180px; 
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.recommendation-content {
    color: white;
    margin-bottom: 10px;
}
.notification-title {
    font-size: 1.1rem;
    margin-bottom: 5px;
}
.recommendation-box {
    padding: 8px;
    background-color: #81C784; 
    border-radius: 4px;
    color: #1b5e20; 
    font-size: 1.1rem;
    word-wrap: break-word;
}
.notifier-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}
.btn-notifier-close, .btn-notifier-view {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}
.btn-notifier-close {
    background-color: #fff;
    color: #444;
}
.btn-notifier-view {
    background-color: #38a169;
    color: white;
}

.notifier-error {
    background-color: #e53e3e; 
    animation: fadeInOut 5s ease-in-out forwards;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    .incident-form-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    .form-container {
        padding: 20px;
    }
    .report-header-bar {
        padding: 15px 20px;
    }
    .form-actions {
        justify-content: space-around;
    }
}

/* Keyframes for error notifier */
@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); } 
    10% { opacity: 1; transform: translate(-50%, -50%); } 
    90% { opacity: 1; transform: translate(-50%, -50%); } 
    100% { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); } 
}
</style>