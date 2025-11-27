<template>
    <div class="report-page">
        <header class="report-header-bar">
            <div class="report-title-left">
                <span class="header-icon"></span>
                REPORT AN INCIDENT
            </div>
            <div class="profile-icon-right">
                <span class="header-icon"></span>
            </div>
        </header>

        <div class="form-container">
            <h1 class="main-title-text">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

            <form @submit.prevent="handleSubmit" class="incident-form-grid">

                <div class="input-group">
                    <label for="studentId">Student ID</label>
                    <input type="text" id="studentId" v-model="form.studentId">
                </div>

                <div class="input-group">
                    <label for="fullName">Full Name</label>
                    <input type="text" id="fullName" v-model="form.fullName">
                </div>

                <div class="input-group">
                    <label for="program">Program</label>
                    <select id="program" v-model="form.program">
                        <option value="" disabled>Select Program</option>
                        <option v-for="program in programOptions" :key="program" :value="program">
                            {{ program }}
                        </option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="yearLevel">Year Level</label>
                    <select id="yearLevel" v-model="form.yearLevel">
                        <option value="" disabled>Select Year Level</option>
                        <option v-for="year in yearLevelOptions" :key="year" :value="year">
                            {{ year }}
                        </option>
                    </select>
                </div>
                
                <div class="input-group">
                    <label for="section">Section</label>
                    <input type="text" id="section" v-model="form.section">
                </div>

                <div class="input-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" v-model="form.location">
                </div>
                
                <div class="date-time-container">
                    <label for="dateOfIncident" class="date-time-label">Date of Incident</label>
                    <input type="date" id="dateOfIncident" v-model="form.dateOfIncident"> 
                </div>
                <div class="date-time-container">
                    <label for="timeOfIncident" class="date-time-label">Time of Incident</label>
                    <input type="time" id="timeOfIncident" v-model="form.timeOfIncident"> 
                </div>

                <div class="input-group">
                    <label for="offenseCategory">Offense Category</label>
                    <select id="offenseCategory" v-model="form.offenseCategory">
                        <option value="" disabled>Select Category</option>
                        <option value="Minor Offense">Minor Offense</option>
                        <option value="Major Offense">Major Offense</option>
                    </select>
                </div>

                <div class="input-group">
                    <label for="specificOffense">Specific Offense</label>
                    <select 
                        id="specificOffense" 
                        v-model="form.specificOffense" 
                        :disabled="!form.offenseCategory"
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
                </div>
                
                <div class="input-group description-group full-span">
                    <label for="description">Description</label>
                    <textarea id="description" v-model="form.description"></textarea>
                </div>

                <div class="form-actions full-span">
                    <button type="button" class="btn-cancel" @click="router.back()">
                        Cancel
                    </button>
                    <button type="submit" class="btn-save">
                        Save Incident
                    </button>
                </div>
            </form>
        </div>
        
        <div 
            v-if="notifier.visible" 
            class="notifier"
            :class="{'notifier-success': notifier.type === 'success', 'notifier-error': notifier.type === 'error'}"
        >
            {{ notifier.message }}
        </div>
        </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router'; 

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

// --- NOTIFIER STATE ---
const notifier = reactive({
    visible: false,
    message: '',
    type: 'success', // 'success' or 'error'
});

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

// --- Notifier Function ---
const showNotifier = (message, type = 'success', duration = 3000) => {
    notifier.message = message;
    notifier.type = type;
    notifier.visible = true;

    setTimeout(() => {
        notifier.visible = false;
    }, duration);
};

// ------------------------------------------------------------------
// --- VALIDATION AND SUBMISSION METHOD ---
// ------------------------------------------------------------------
const handleSubmit = () => {
    // Define all required fields (excluding section)
    const requiredFields = [
        'studentId', 'fullName', 'program', 'yearLevel', 
        'dateOfIncident', 'timeOfIncident', 'location', 
        'offenseCategory', 'specificOffense', 'description'
    ];

    let missingFields = [];
    
    // Check for missing input
    for (const field of requiredFields) {
        if (!form[field] || String(form[field]).trim() === '') {
            // Provide a user-friendly name for the missing field
            const friendlyName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            missingFields.push(friendlyName);
        }
    }

    // If there are missing fields, stop submission and notify user
    if (missingFields.length > 0) {
        showNotifier(`Please fill out the following required fields: ${missingFields.join(', ')}`, 'error', 5000);
        console.error('Submission blocked: Missing required fields.', missingFields);
        return; // HALTS the submission process
    }

    // If validation passes:
    const payload = {
        studentId: form.studentId,
        fullName: form.fullName,
        program: form.program,
        yearLevel: form.yearLevel,
        section: form.section,
        dateOfIncident: form.dateOfIncident,
        timeOfIncident: form.timeOfIncident,
        location: form.location,
        offenseCategory: form.offenseCategory,
        specificOffense: form.specificOffense,
        description: form.description,
    };
    
    console.log('Submitting Incident:', payload);

    // Simulate API submission and show success notification
    setTimeout(() => {
        showNotifier('✅ Incident Successfully Reported!', 'success');
    }, 1500);
};
</script>

<style scoped>
/* --- EXISTING STYLES (UNCHANGED) --- */

.report-page {
    width: 100%;
    min-height: 100vh;
    background-color: #EAF9E7; /* Pale Green Background */
    font-family: Arial, sans-serif;
    padding-top: 50px;
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
}

.report-title-left {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
}

.header-icon {
    width: 18px;
    height: 18px;
    background-color: white;
    margin-right: 8px;
    border-radius: 2px;
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
    grid-template-columns: 1fr 1fr;
    gap: 20px 30px; 
    align-items: start;
}

.full-span {
    grid-column: 1 / -1;
}

/* --- INPUT FIELD STYLES (Includes select styling) --- */
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

/* Style for disabled select/input to clearly indicate it's inactive */
.input-group select:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
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

.form-actions button:hover {
    background-color: #1a1e1b;
}

/* --- Responsive Adjustments --- */
@media (max-width: 768px) {
    .incident-form-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .form-actions {
        justify-content: space-around;
    }
}

/* ============================== */
/* === UPDATED NOTIFIER STYLES (Center) === */
/* ============================== */

.notifier {
    position: fixed;
    top: 50%; /* Position vertically in the center */
    left: 50%;
    /* Use translate to account for the element's size, ensuring true centering */
    transform: translate(-50%, -50%); 
    padding: 15px 30px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    opacity: 0;
    animation: fadeInOut 3s ease-in-out forwards; 
}

.notifier-success {
    background-color: #38a169; /* Darker Green for Success */
}

.notifier-error {
    background-color: #e53e3e; /* Red for Error */
}

/* CSS Animation adjusted for center positioning */
@keyframes fadeInOut {
    0% {
        opacity: 0;
        /* Start slightly above the center */
        transform: translate(-50%, calc(-50% + 20px)); 
    } 
    10% {
        opacity: 1;
        /* Move to true center */
        transform: translate(-50%, -50%); 
    } 
    90% {
        opacity: 1;
        /* Hold visibility at true center */
        transform: translate(-50%, -50%); 
    } 
    100% {
        opacity: 0;
        /* Fade out and move slightly below the center */
        transform: translate(-50%, calc(-50% - 20px)); 
    } 
}
</style>