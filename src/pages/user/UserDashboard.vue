<template>
    <div class="misconduct-home-page">
        <header class="top-bar">
            <div class="nav-links-wrapper">
                
                <router-link to="/user/dashboard" class="nav-link dashboard-text">
                    <span class="material-icons"></span> DASHBOARD
                </router-link>

                <router-link :to="{ name: 'UserReportHistory' }" class="nav-link">
                    MY REPORTS
                </router-link>

            </div>
            
            <div class="profile-icon">
                <span class="material-icons"></span>
            </div>
        </header>

        <div class="home-container">
            
            <h1 class="main-title">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

            <div class="button-group">
                <button class="report-btn primary-btn" @click="goToReport">
                    REPORT AN INCIDENT
                </button>

                <button class="report-btn secondary-btn" @click="goToMyReports">
                    VIEW MY REPORTS
                </button>
            </div>
            
            <div class="info-card-wrapper">
                <div class="info-card">
                    <div class="left-box"></div>
                    <div class="right-content">
                        <h2 class="info-header">INFO</h2>
                        <p class="info-text">
                            The Student Misconduct Report Management System helps schools record, track,
                            and manage misconduct cases efficiently. Our goal is to promote fairness,
                            accountability, and a safe learning environment.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: "MisconductHomePage",

    data() {
        return {};
    },

    methods: {
        goToReport() {
            // Navigates to the report filing form
            this.$router.push('/file-incident-report'); 
        },
        // ADDED/CONFIRMED: The navigation method for My Reports
        goToMyReports() {
            // Navigates to the UserReportHistory.vue component using its route name
            this.$router.push({ name: 'UserReportHistory' });
        }
    }
};
</script>

<style scoped>
/* --- Page and Background --- */
.misconduct-home-page {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #EAF9E7; 
}

.home-container {
    max-width: 900px;
    width: 90%;
    margin: 0 auto;
    padding: 50px 0;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* --- Top Bar Styling --- */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 40px;
    background-color: #549A6C; 
    color: white;
    font-weight: bold;
}

.nav-links-wrapper {
    display: flex;
    align-items: center;
    gap: 30px; 
}

.nav-link {
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    letter-spacing: 1px;
    padding: 5px 0;
    transition: color 0.2s;
}

.nav-link:hover {
    color: #f0f0f0; 
}

.dashboard-text {
    display: flex;
    align-items: center;
}

.profile-icon {
    background-color: white; 
    border-radius: 50px;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 0 5px rgba(220, 255, 220, 0.1); 
}

/* --- Main Title --- */
.main-title {
    color: #1D7A31; 
    margin: 150px 0 50px; 
    font-size: 2.5rem;
    letter-spacing: 2px;
    text-shadow: none; 
}

/* --- Button Group Container --- */
.button-group {
    display: flex;
    gap: 20px; 
    margin-bottom: 80px; 
}

/* --- Button Styling (Report/MyReports) --- */
.report-btn {
    padding: 15px 40px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: background-color 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.5); 
    width: auto; 
    min-width: 200px; 
}

/* Primary (Report Incident) styling */
.primary-btn {
    border: none;
    background-color: #323A36; 
    color: white;
}

.primary-btn:hover {
    background-color: #1a1e1b;
}

/* Secondary (My Reports) styling */
.secondary-btn {
    border: 2px solid #323A36;
    background-color: transparent;
    color: #323A36;
    box-shadow: none; 
}

.secondary-btn:hover {
    background-color: #d8e2d8; 
    color: #1a1e1b;
}

/* --- Info Card --- */

.info-card-wrapper {
    width: 100%;
    max-width: 700px; 
    margin-top: auto; 
}

.info-card {
    background-color: #549A6C; 
    border-radius: 8px;
    display: flex;
    overflow: hidden;
    padding: 25px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); 
}

.left-box {
    background-color: rgba(255, 255, 255, 0.2); 
    flex-basis: 35%;
    margin-right: 25px;
    border-radius: 6px;
}

.right-content {
    flex-basis: 65%;
    text-align: left;
}

.info-header {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 10px;
    font-weight: bold;
    text-transform: uppercase;
}

.info-text {
    color: #f0f0f0; 
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0;
}
</style>