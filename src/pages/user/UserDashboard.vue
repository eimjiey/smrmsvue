<template>
    <div class="dashboard-page">

        <UserNavbar />

        <div class="dashboard-container">
        <h1>User Dashboard</h1>

        <div class="card">
            <p>Welcome to your dashboard!</p>

            <button class="report-btn" @click="goToReport">
            File Incident Report
            </button>
        </div>
        </div>

    </div>
</template>

<script>
import UserNavbar from '@/components/UserNavbar.vue'  

export default {
    name: "UserDashboard",

    components: {
        UserNavbar    
    },

    data() {
        return {};
    },

    methods: {
        goToReport() {
        this.$router.push('/file-incident-report'); 
    }
}
};
</script>

<style scoped>
.dashboard-page {
    width: 100%;
    min-height: 100vh;
    background: #f8f9fa;
}

.dashboard-container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
}

.card {
    background: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    text-align: center;
}

.report-btn {
    margin-top: 20px;
    padding: 12px 20px;
    background-color: #3490dc;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
}

.report-btn:hover {
    background-color: #2779bd;
}
</style>
