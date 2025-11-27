<template>
  <div :style="reportDetailsContainerStyle">
    <header :style="headerStyle">
      <h1 :style="titleStyle">Incident Report Details</h1>
      <button :style="backButtonStyle" @click="goBack">← Back to History</button>
    </header>

    <div :style="contentAreaStyle">
      <p v-if="isLoading" :style="loadingStyle">Loading details for Incident ID: {{ reportId }}...</p>
      <p v-else-if="errorMessage" :style="errorMessageStyle">Error: {{ errorMessage }}</p>

      <div v-else-if="reportDetails" :style="detailsCardStyle">
        
        <h2 :style="subtitleStyle">Report #{{ reportId }} - **{{ reportDetails.misconduct_type }}**</h2>
        <hr :style="dividerStyle">

        <h3 :style="{'font-size': '1.2rem', 'color': themeColors.darkGreen, 'margin-top': '0px'}">Student Information</h3>
        <hr :style="dividerStyle">
        
        <div :style="detailRowStyle">
          <span :style="labelStyle">Student ID:</span> 
          <span :style="valueStyle">{{ reportDetails.student_id }}</span>
        </div>

        <div :style="detailRowStyle">
          <span :style="labelStyle">Student Name:</span> 
          <span :style="valueStyle">{{ reportDetails.student_name }}</span>
        </div>

        <div :style="detailRowStyle">
          <span :style="labelStyle">Program / Year Level:</span> 
          <span :style="valueStyle">{{ reportDetails.program }} - {{ reportDetails.year_level }} ({{ reportDetails.section }})</span>
        </div>
        
        <h3 :style="{'font-size': '1.2rem', 'color': themeColors.darkGreen, 'margin-top': '30px'}">Incident Details</h3>
        <hr :style="dividerStyle">

        <div :style="detailRowStyle">
          <span :style="labelStyle">Date & Time:</span> 
          <span :style="valueStyle">{{ formatDateTime(reportDetails.incident_date) }} @ {{ reportDetails.time_of_incident }}</span>
        </div>
        
        <div :style="detailRowStyle">
          <span :style="labelStyle">Location:</span> 
          <span :style="valueStyle">{{ reportDetails.location || 'N/A' }}</span>
        </div>

        <div :style="detailRowStyle">
          <span :style="labelStyle">Offense Category:</span> 
          <span :style="valueStyle">{{ reportDetails.offense_category }}</span>
        </div>
        
        <div :style="detailRowStyle">
          <span :style="labelStyle">Detailed Description:</span> 
          <p :style="descriptionStyle">{{ reportDetails.description || 'No detailed description provided.' }}</p>
        </div>
        
        <h3 :style="{'font-size': '1.2rem', 'color': themeColors.darkGreen, 'margin-top': '30px'}">Findings & Resolution</h3>
        <hr :style="dividerStyle">

        <div :style="detailRowStyle">
          <span :style="labelStyle">Current Status:</span> 
          <span :style="statusDetailStyle(reportDetails.status)">{{ reportDetails.status }}</span>
        </div>
        
        <div :style="detailRowStyle">
          <span :style="labelStyle">System Recommendation:</span> 
          <span :style="valueStyle">{{ reportDetails.recommendation || 'N/A' }}</span>
        </div>
        
        <div :style="detailRowStyle">
          <span :style="labelStyle">Final Action Taken:</span> 
          <span :style="valueStyle">{{ reportDetails.action_taken || 'Awaiting administrator resolution' }}</span>
        </div>
        
        <div :style="{'margin-top': '30px', 'font-size': '0.9rem', 'color': themeColors.grayText, 'text-align': 'right'}">
          Filed by User ID: **{{ reportDetails.filer_id }}**
        </div>
        
      </div>
      
      <p v-else :style="noDataStyle">Incident report details not found.</p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api'; 

// --- Initialization ---
const route = useRoute();
const router = useRouter();
const reportId = route.params.id; 

const reportDetails = ref(null);
const isLoading = ref(true);
const errorMessage = ref(null);

// --- Functions ---

/**
 * Fetches the specific incident report details from the API.
 */
const fetchReportDetails = async () => {
    if (!reportId) {
        errorMessage.value = "Invalid report ID.";
        isLoading.value = false;
        return;
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
        const response = await api.get(`/incidents/${reportId}`); 
        
        if (response.status === 200 && response.data) {
            // Mapping ALL expected fields from the Laravel model
            reportDetails.value = {
                id: response.data.id,
                filer_id: response.data.filer_id,
                student_id: response.data.student_id,
                student_name: response.data.full_name, // Your model uses full_name for student name
                program: response.data.program,
                year_level: response.data.year_level,
                section: response.data.section,
                
                // Incident Details
                incident_date: response.data.date_of_incident,
                time_of_incident: response.data.time_of_incident,
                location: response.data.location,
                offense_category: response.data.offense_category,
                misconduct_type: response.data.specific_offense, // Used in the H2 title
                description: response.data.description, // Mapped to 'description'
                
                // Resolution Details
                status: response.data.status || 'Pending',
                recommendation: response.data.recommendation,
                action_taken: response.data.action_taken,
            };
        } else {
            errorMessage.value = "Report not found or failed to load.";
        }
    } catch (error) {
        console.error("Error fetching report details:", error);
        errorMessage.value = "Failed to load report. Check network connection."; 
    } finally {
        isLoading.value = false;
    }
};

/**
 * Formats the date string for display.
 */
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    // Format only the date part
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

/**
 * Navigates the user back to the report history page.
 */
const goBack = () => {
    router.go(-1); 
}

// --- Lifecycle Hook ---
onMounted(fetchReportDetails);


// --- STYLES (Inline Styles for demonstration) ---

const themeColors = {
    darkGreen: '#1d3e21',
    mediumGreen: '#4CAF50',
    paleBackground: '#EAF9E7',
    white: '#fff',
    grayText: '#555',
};

const reportDetailsContainerStyle = computed(() => ({
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: themeColors.paleBackground,
    padding: '20px',
}));

const headerStyle = computed(() => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '15px 30px',
    backgroundColor: themeColors.darkGreen,
    color: themeColors.white,
    borderRadius: '10px',
}));

const titleStyle = computed(() => ({
    fontSize: '2rem',
    margin: 0,
    fontWeight: 'normal',
}));

const backButtonStyle = computed(() => ({
    padding: '10px 15px',
    backgroundColor: themeColors.mediumGreen,
    color: themeColors.white,
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
}));

const contentAreaStyle = computed(() => ({
    maxWidth: '900px',
    margin: '0 auto',
}));

const detailsCardStyle = computed(() => ({
    backgroundColor: themeColors.white,
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
}));

const subtitleStyle = computed(() => ({
    fontSize: '1.8rem',
    color: themeColors.darkGreen,
    marginBottom: '20px',
}));

const dividerStyle = computed(() => ({
    border: `0.5px solid ${themeColors.paleBackground}`,
    marginBottom: '20px',
}));

const detailRowStyle = computed(() => ({
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: `1px dashed #eee`,
}));

const labelStyle = computed(() => ({
    fontWeight: 'bold',
    color: themeColors.mediumGreen,
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    marginBottom: '5px',
}));

const valueStyle = computed(() => ({
    fontSize: '1.1rem',
    color: '#333',
}));

const descriptionStyle = computed(() => ({
    fontSize: '1.1rem',
    color: themeColors.grayText,
    padding: '10px',
    backgroundColor: '#f9f9f9',
    borderRadius: '5px',
    whiteSpace: 'pre-wrap',
}));

const statusDetailStyle = (status) => {
    let color = '#333';
    let backgroundColor = '#f0f0f0';
    if (status === 'Resolved') {
        backgroundColor = '#d4edda'; color = '#155724';
    } else if (status === 'Under Review') {
        backgroundColor = '#fff3cd'; color = '#856404';
    } else if (status === 'Pending') {
        backgroundColor = '#d1ecf1'; color = '#0c5460';
    } else if (status === 'Closed') {
        backgroundColor = '#e2e6ea'; color = '#495057';
    }
    return {
        padding: '5px 10px',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '1rem',
        color: color,
        backgroundColor: backgroundColor,
        alignSelf: 'flex-start',
    };
};

const loadingStyle = computed(() => ({ padding: '15px', backgroundColor: '#fffbe6', border: '1px solid #ffcc00', borderRadius: '5px', color: '#a07e00', fontWeight: 'bold' }));
const errorMessageStyle = computed(() => ({ padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', color: '#721c24', fontWeight: 'bold' }));
const noDataStyle = computed(() => ({ padding: '15px', backgroundColor: '#e9ecef', border: '1px solid #ccc', borderRadius: '5px', color: '#6c757d', fontWeight: 'bold' }));
</script>

<style scoped>
/* No additional scoped CSS needed as styles are inline */
</style>