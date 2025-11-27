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
            <h1 class="main-title-text">STUDMENT MISCONDUCT REPORT MANAGEMENT</h1>
            
            <div v-if="isSubmitting" class="submission-status submission-loading">
                Submitting report... Please wait.
            </div>

            <div v-else-if="submitError" class="submission-status submission-error">
                🚨 Submission Error: {{ submitError }}
            </div>

            <form @submit.prevent="handleSubmit" class="incident-form-grid">

                <div class="input-group">
                    <label for="studentId">Student ID</label>
                    <input type="text" id="studentId" v-model="form.studentId" required>
                    <p v-if="validationErrors.studentId" class="error-message">{{ validationErrors.studentId[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" v-model="form.fullName" required>
                    <p v-if="validationErrors.fullName" class="error-message">{{ validationErrors.fullName[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="program">Program</label>
                    <select id="program" v-model="form.program" required>
                        <option value="" disabled>Select Program</option>
                        <option v-for="program in programOptions" :key="program" :value="program">
                            {{ program }}
                        </option>
                    </select>
                    <p v-if="validationErrors.program" class="error-message">{{ validationErrors.program[0] }}</p>
                </div>

                <div class="input-group">
                    <label for="yearLevel">Year Level</label>
                    <select id="yearLevel" v-model="form.yearLevel" required>
                        <option value="" disabled>Select Year Level</option>
                        <option v-for="year in yearLevelOptions" :key="year" :value="year">
                            {{ year }}
                        </option>
                    </select>
                    <p v-if="validationErrors.yearLevel" class="error-message">{{ validationErrors.yearLevel[0] }}</p>
                </div>
                
                <div class="input-group">
                    <label for="section">Section</label>
                    <input type="text" id="section" v-model="form.section">
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
                    <button type="submit" class="btn-save" :disabled="isSubmitting">
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
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; // Import your Axios instance

const router = useRouter(); 

// --- Offense Data ---
const programOptions = ref(['BSIT', 'BSCS', 'BSED', 'BEED', 'BSBA', 'BSTM']);
const yearLevelOptions = ref(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate']);

const specificOffenseOptions = {
    'Minor Offense': [
        'Tardiness/Latecoming',
        'Improper Uniform/Dress Code Violation',
        'Littering in non-designated areas',
        'Minor Disruptive Behavior in Class',
    ],
    'Major Offense': [
        'Cheating or Plagiarism',
        'Vandalism or Damage to Property',
        'Physical Assault or Fighting',
        'Grave Misconduct or Immorality',
    ],
};

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

// --- API/Submission State ---
const isSubmitting = ref(false);
const submitError = ref(null);
const validationErrors = ref({}); // Holds backend 422 errors

// --- Optimization/Notifier State ---
const notifier = reactive({
    visible: false,
    message: '',
    type: 'success', // 'success' or 'error'
});
const recommendationText = ref('');
const newIncidentId = ref(null);

// --- Computed Property for Filtering ---
const filteredSpecificOffenses = computed(() => {
    const category = form.offenseCategory;
    return specificOffenseOptions[category] || [];
});

// --- Watcher to Reset Specific Offense ---
watch(() => form.offenseCategory, (newCategory, oldCategory) => {
    if (newCategory !== oldCategory) {
        form.specificOffense = ''; 
    }
});

// --- Notifier Functions ---
const showNotifier = (message, type = 'success', duration = 3000) => {
    notifier.message = message;
    notifier.type = type;
    notifier.visible = true;

    setTimeout(() => {
        if (notifier.type === 'error') {
             notifier.visible = false;
        }
        // Success notification remains visible until explicitly closed or navigated away
    }, duration);
};

const resetNotifier = () => {
    notifier.visible = false;
};

// --- Reset Form Function ---
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
    form.description = '';
};

// --- Navigation ---
const navigateToDetails = () => {
    if (newIncidentId.value) {
        router.push({ name: 'IncidentDetails', params: { id: newIncidentId.value } });
    }
    resetNotifier();
};

// ------------------------------------------------------------------
// --- VALIDATION AND SUBMISSION METHOD ---
// ------------------------------------------------------------------
const handleSubmit = async () => {
    submitError.value = null;
    validationErrors.value = {}; 

    // --- Client-side Required Field Check (Optional, backend handles strict) ---
    const requiredFields = [ 'studentId', 'fullName', 'program', 'yearLevel', 'dateOfIncident', 'timeOfIncident', 'location', 'offenseCategory', 'specificOffense', 'description'];
    let missingFields = requiredFields.filter(field => !form[field] || String(form[field]).trim() === '');
    
    if (missingFields.length > 0) {
        const friendlyNames = missingFields.map(f => f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
        submitError.value = `Please fill out all required fields: ${friendlyNames.join(', ')}`;
        return; 
    }
    // -------------------------------------------------------------------------
    
    isSubmitting.value = true;
    const payload = JSON.parse(JSON.stringify(form));
    
    try {
        const response = await api.post('/incidents', payload); 

        if (response.status === 201 || response.status === 200) {
            const data = response.data;
            
            // 🎯 OPTIMIZATION: Extract recommendation and ID
            recommendationText.value = data.recommendation;
            newIncidentId.value = data.incident.id;

            // Show success notification with special modal-like content
            showNotifier('✅ Incident Successfully Reported!', 'success', 60000); 
            resetForm();
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
/* --- STYLES FOR THE GREEN DESIGN (Based on provided structure) --- */

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
    background-color: #51A687; /* Header background color */
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

/* Placeholder icons updated to SVG for better styling */
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
    background-color: #51A687; /* Main container background color */
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
    grid-template-columns: repeat(2, 1fr); /* Two columns */
    gap: 20px 30px; 
    align-items: start;
}

.full-span {
    grid-column: 1 / -1;
}

/* --- INPUT FIELD STYLES --- */
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

/* Error feedback */
.error-message {
    color: #ffdddd; /* Light red/pink over green */
    font-size: 0.8rem;
    margin-top: 5px;
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
    background-color: #323A36; /* Dark Green/Gray button */
    color: white;
}

.form-actions button:hover:not(:disabled) {
    background-color: #1a1e1b;
}

.form-actions button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

/* --- NOTIFIER (MODIFIED to be success modal) --- */
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
    animation: none; /* Removed generic fade-in-out animation */
}

.notifier-success {
    background-color: #4CAF50; /* Green Success */
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
    background-color: #81C784; /* Lighter shade of success */
    border-radius: 4px;
    color: #1b5e20; /* Dark green text */
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
    background-color: #e53e3e; /* Red for Error */
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