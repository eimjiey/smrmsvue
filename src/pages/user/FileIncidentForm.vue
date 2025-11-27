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
                    <label for="selectStudent">Select Student</label>
                    <input type="text" id="selectStudent" v-model="form.fullName">
                </div>
                <div class="input-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" v-model="form.location">
                </div>

                <div class="input-group">
                    <label for="typeOfMisconduct">Type of Misconduct</label>
                    <input type="text" id="typeOfMisconduct" v-model="form.specificOffense">
                </div>
                <div class="date-time-container">
                    <label class="date-time-label">Date and Time</label>
                    <input type="text" id="dateTime" v-model="form.dateTimePlaceholder"> 
                </div>

                <div class="input-group">
                    <label for="actionTaken">Action Taken</label>
                    <input type="text" id="actionTaken" v-model="form.actionTaken">
                </div>
                <div class="input-group">
                    <label for="status">Status</label>
                    <input type="text" id="status" v-model="form.status">
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
    </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter(); 

// Simplified form state to match the required input fields in the image
const form = reactive({
    fullName: '',
    location: '',
    specificOffense: '',
    dateTimePlaceholder: '',
    actionTaken: '',
    status: '',
    description: '',
});

const handleSubmit = () => {
    // Simulate API submission
    setTimeout(() => {
        alert('Incident submission simulation complete.');
    }, 1500);
};
</script>

<style scoped>
/* --- COLOR CHANGES --- */
/* Form Background: #51A687 (New Sage Green) */
/* Page Background: Keeping #EAF9E7 (Pale Green) for contrast */
/* Header Bar: Updated to match the new form color for cohesion */

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
    /* Updated header color to match new form color */
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
    /* NEW: Form Fill Color */
    background-color: #51A687; 
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    /* Adjusted border color */
    border: 1px solid #448f72; 
}

.main-title-text {
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    /* Title text color changed to white for visibility on dark background */
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

/* --- INPUT FIELD STYLES --- */
.input-group label, .date-time-label {
    display: block;
    font-size: 0.9rem;
    /* Label text changed to white/off-white for contrast */
    color: #f0f0f0; 
    margin-bottom: 5px;
    font-weight: 600;
}

.input-group input,
.input-group textarea,
.date-time-container input {
    width: 100%;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
    /* Input background remains white/light */
    background-color: #fff;
    font-size: 1rem;
    box-sizing: border-box;
}

.description-group textarea {
    min-height: 200px;
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
    /* Buttons kept dark for contrast against the medium green form background */
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
</style>