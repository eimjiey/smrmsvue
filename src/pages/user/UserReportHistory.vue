<template>
  <div :style="userPageContainerStyle">
    
    <header :style="headerBarStyle">
        <div :style="headerTitleStyle">
            <span :style="headerIconStyle">📝</span> MY FILED INCIDENT REPORTS
        </div>
        <div :style="profileIconStyle">
            <span :style="profileIconInnerStyle">👤</span>
        </div>
    </header>

    <div :style="listWrapperStyle">
      <h1 :style="mainTitleStyle">My Incident Report History</h1>

      <p v-if="isLoading" :style="loadingStyle">Loading your reports... Please wait.</p>
      <p v-else-if="errorMessage" :style="errorMessageStyle">Error fetching your reports: {{ errorMessage }}</p>
      <p v-else-if="reports.length === 0" :style="noDataStyle">You haven't filed any incident reports yet.</p>

      <div v-else :style="tableContainerStyle">
        <table :style="tableStyle">
          <thead :style="tableHeadStyle">
            <tr>
              <th :style="tableHeaderCellStyle">Report ID</th>
              <th :style="tableHeaderCellStyle">Student Reported</th>
              <th :style="tableHeaderCellStyle">Misconduct Type</th>
              <th :style="tableHeaderCellStyle">Date of Incident</th>
              <th :style="tableHeaderCellStyle">Status</th>
              <th :style="tableHeaderCellStyle">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id" :style="tableRowStyle">
                <td :style="tableCellStyle">{{ report.id }}</td> 
              <td :style="tableCellStyle">{{ report.student_name }}</td>
              <td :style="tableCellStyle">{{ report.misconduct_type }}</td>
              <td :style="tableCellStyle">{{ formatDateTime(report.incident_date) }}</td>
              <td :style="statusStyle(report.status)">
                {{ report.status }}
              </td>
              <td :style="actionCellStyle">
                <button :style="viewButtonStyle" @click="viewReportDetails(report.id)">Review</button>
                
                <button 
                    :style="deleteButtonStyle" 
                    @click="confirmDeleteReport(report.id)">
                    Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api'; 
// NOTE: You will likely need to import your store (e.g., Pinia/Vuex) 
// to get the logged-in user's information. For this example, I'll use 
// a simple function call that you must replace with your actual state management logic.

// REPLACE THIS WITH YOUR ACTUAL LOGIC to get the user data
const getAuthUser = async () => {
    try {
        // Assuming you have a /me or /user endpoint to fetch current user data
        const response = await api.get('/me'); 
        return response.data; // Should contain { id: 1, role: 'user', ... }
    } catch (e) {
        console.error("Failed to fetch authenticated user:", e);
        return null;
    }
}

export default {
    name: 'UserReportHistory',
    setup() {
        const router = useRouter();
        const reports = ref([]);
        const isLoading = ref(true);
        const errorMessage = ref(null);
        
        // --- Core Functions ---

        const fetchReports = async () => {
            isLoading.value = true;
            errorMessage.value = null;
            try {
                const user = await getAuthUser();
                
                if (!user) {
                    errorMessage.value = "User not authenticated or profile not loaded.";
                    return;
                }

                // Assuming this endpoint only returns reports that are NOT soft-deleted
                const response = await api.get('/incidents'); 
                
                if (response.status === 200) {
                    const dataArray = Array.isArray(response.data) ? response.data : [];

                    reports.value = dataArray.map(report => ({
                        id: report.id,
                        student_name: report.full_name, 
                        misconduct_type: report.specific_offense, 
                        incident_date: report.date_of_incident, 
                        status: report.status || 'Pending',
                    }));
                }
            } catch (error) {
                console.error("Error fetching user reports:", error);
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    errorMessage.value = "Access Denied. Please log in again.";
                } else {
                    errorMessage.value = error.message; 
                }
            } finally {
                isLoading.value = false;
            }
        };

        const viewReportDetails = (reportId) => {
            router.push({ name: 'ReportDetails', params: { id: reportId } });
        };
        
        const formatDateTime = (dateString) => {
            if (!dateString) return 'N/A';
            return new Date(dateString).toLocaleDateString('en-US');
        }

        // -----------------------------------------------------------
        // 🎯 DELETE FUNCTIONALITY
        // -----------------------------------------------------------

        const confirmDeleteReport = (reportId) => {
            // Basic confirmation for soft-delete
            if (window.confirm(`Are you sure you want to delete report #${reportId}? You may not be able to recover it.`)) {
                deleteReport(reportId);
            }
        };

        const deleteReport = async (reportId) => {
            try {
                // Laravel Soft Delete: Sends a DELETE request to the resource endpoint.
                // The API should handle this by setting the 'deleted_at' timestamp.
                const response = await api.delete(`/incidents/${reportId}`);

                if (response.status === 200 || response.status === 204) {
                    // Remove the report locally from the array without a full page reload
                    reports.value = reports.value.filter(report => report.id !== reportId);
                    
                    // Optional: Show a success message (e.g., using a separate toast component)
                    alert(`Report #${reportId} successfully deleted.`); 
                }
            } catch (error) {
                console.error(`Error soft-deleting report #${reportId}:`, error);
                errorMessage.value = `Failed to delete report #${reportId}. Ensure you have permission.`;
            }
        };

        // -----------------------------------------------------------
        
        onMounted(fetchReports);
        
        // --- STYLES (Inline Styles) ---
        const themeColors = {
            darkGreen: '#1d3e21',
            mediumGreen: '#4CAF50',
            lightGreen: '#e6f0e7',
            paleBackground: '#EAF9E7',
            white: '#fff',
        };

        const userPageContainerStyle = computed(() => ({
            fontFamily: 'Arial, sans-serif',
            minHeight: '100vh',
            backgroundColor: themeColors.paleBackground, 
            paddingTop: '60px', 
        }));
        
        const headerBarStyle = computed(() => ({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 30px',
            backgroundColor: themeColors.darkGreen,
            color: themeColors.white,
            fontWeight: 'bold',
            zIndex: 10,
        }));

        const headerTitleStyle = computed(() => ({
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
            gap: '10px',
        }));

        const headerIconStyle = computed(() => ({
            fontSize: '1.5rem',
        }));

        const profileIconStyle = computed(() => ({
            padding: '5px',
            background: themeColors.white, 
            borderRadius: '50%',
        }));
        
        const profileIconInnerStyle = computed(() => ({
            fontSize: '1.2rem',
            color: themeColors.darkGreen, 
        }));

        const listWrapperStyle = computed(() => ({
            maxWidth: '1100px',
            margin: '30px auto',
            padding: '30px',
            backgroundColor: themeColors.white,
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }));
        
        const mainTitleStyle = computed(() => ({
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: themeColors.darkGreen, 
            marginBottom: '30px',
            paddingBottom: '10px',
            borderBottom: `2px solid ${themeColors.mediumGreen}`,
        }));

        const tableContainerStyle = computed(() => ({
            overflowX: 'auto',
        }));
        
        const tableStyle = computed(() => ({
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 5px',
            textAlign: 'left',
        }));

        const tableHeadStyle = computed(() => ({
            backgroundColor: themeColors.darkGreen,
            color: themeColors.white,
            borderRadius: '5px',
        }));
        
        const tableHeaderCellStyle = computed(() => ({
            padding: '12px 15px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            fontWeight: 'bold',
        }));
        
        const tableRowStyle = computed(() => ({
            backgroundColor: '#f8fff8',
            border: '1px solid #eee',
            borderRadius: '5px',
            transition: 'background-color 0.2s',
            // Removed cursor: 'pointer' to indicate the row click handler is gone
        }));
        
        const tableCellStyle = computed(() => ({
            padding: '10px 15px',
            fontSize: '0.95rem',
            color: '#333',
        }));

        const actionCellStyle = computed(() => ({
            ...tableCellStyle.value,
            display: 'flex',
            gap: '10px', // Space between buttons
            alignItems: 'center',
        }));


        const statusStyle = (status) => {
            let color = '#333';
            let backgroundColor = '#f0f0f0';

            if (status === 'Resolved') {
                backgroundColor = '#d4edda';
                color = '#155724';
            } else if (status === 'Under Review') {
                backgroundColor = '#fff3cd';
                color = '#856404';
            } else if (status === 'Pending') {
                backgroundColor = '#d1ecf1';
                color = '#0c5460';
            } else if (status === 'Closed') {
                 backgroundColor = '#e2e6ea';
                 color = '#495057';
            }

            return {
                padding: '5px 10px',
                borderRadius: '5px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                color: color,
                backgroundColor: backgroundColor,
                display: 'inline-block', 
                minWidth: '100px',
            };
        };
        
        const viewButtonStyle = computed(() => ({
            padding: '5px 10px',
            backgroundColor: themeColors.mediumGreen,
            color: themeColors.white,
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'background-color 0.2s',
        }));
        
        // 🎯 NEW DELETE BUTTON STYLE
        const deleteButtonStyle = computed(() => ({
            padding: '5px 10px',
            backgroundColor: '#dc3545', // Red color for delete
            color: themeColors.white,
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            transition: 'background-color 0.2s',
        }));

        const loadingStyle = computed(() => ({ padding: '15px', backgroundColor: '#fffbe6', border: '1px solid #ffcc00', borderRadius: '5px', color: '#a07e00', fontWeight: 'bold', }));
        const errorMessageStyle = computed(() => ({ padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '5px', color: '#721c24', fontWeight: 'bold', }));
        const noDataStyle = computed(() => ({ padding: '15px', backgroundColor: '#e9ecef', border: '1px solid #ccc', borderRadius: '5px', color: '#6c757d', fontWeight: 'bold', }));


        return {
            reports,
            isLoading,
            errorMessage,
            viewReportDetails,
            confirmDeleteReport, // 🎯 Export new function
            formatDateTime,
            statusStyle,
            
            // Styles
            userPageContainerStyle,
            headerBarStyle,
            headerTitleStyle,
            headerIconStyle,
            profileIconStyle,
            profileIconInnerStyle,
            listWrapperStyle,
            mainTitleStyle,
            tableContainerStyle,
            tableStyle,
            tableHeadStyle,
            tableHeaderCellStyle,
            tableRowStyle,
            tableCellStyle,
            actionCellStyle, // 🎯 New action cell style
            loadingStyle,
            errorMessageStyle,
            noDataStyle,
            viewButtonStyle,
            deleteButtonStyle, // 🎯 Export new style
        };
    },
};
</script>

<style scoped>
/* Scoped styles are handled by the inline style bindings in this case. */
/* You might want to add a hover state for rows/buttons here if possible */
</style>