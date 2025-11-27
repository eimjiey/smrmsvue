<template>
  <div :style="userPageContainerStyle">
    
    <header :style="headerBarStyle">
        <div :style="headerTitleStyle">
            <span :style="headerIconStyle">👨‍🎓</span> STUDENT DIRECTORY
        </div>
        <div :style="profileIconStyle">
            <span :style="profileIconInnerStyle">👤</span>
        </div>
    </header>

    <div :style="listWrapperStyle">
      <h1 :style="mainTitleStyle">Registered Students List</h1>

      <p v-if="isLoading" :style="loadingStyle">Loading student data...</p>
      <p v-else-if="errorMessage" :style="errorMessageStyle">Error fetching students: {{ errorMessage }}</p>
      <p v-else-if="students.length === 0" :style="noDataStyle">No student records found.</p>

      <div v-else :style="tableContainerStyle">
        <table :style="tableStyle">
          <thead :style="tableHeadStyle">
            <tr>
              <th :style="tableHeaderCellStyle">Student No.</th>
              <th :style="tableHeaderCellStyle">Full Name</th>
              <th :style="tableHeaderCellStyle">Program</th>
              <th :style="tableHeaderCellStyle">Year/Section</th>
              <th :style="tableHeaderCellStyle">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id" :style="tableRowStyle" @click="viewDetails(student.id)">
              <td :style="tableCellStyle">{{ student.student_number }}</td>
              <td :style="tableCellStyle">{{ student.first_name }} {{ student.last_name }}</td>
              <td :style="tableCellStyle">{{ student.program }}</td>
              <td :style="tableCellStyle">{{ student.year_level }} - {{ student.section || 'N/A' }}</td>
              <td :style="tableCellStyle">
                <button :style="viewButtonStyle">View Profile</button>
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
// NOTE: Ensure your API service path is correct
import api from '@/services/api'; 

export default {
    name: 'UserStudents',
    setup() {
        const router = useRouter();
        const students = ref([]);
        const isLoading = ref(true);
        const errorMessage = ref(null);

        const fetchStudents = async () => {
            isLoading.value = true;
            errorMessage.value = null;
            try {
                // Assumes API endpoint for all students is '/students'
                const response = await api.get('/students');
                if (response.status === 200) {
                    // Map or assign your actual API data structure here
                    students.value = response.data; 
                }
            } catch (error) {
                console.error("Error fetching students:", error);
                errorMessage.value = error.response?.data?.message || 'Failed to connect to the server.';
            } finally {
                isLoading.value = false;
            }
        };

        onMounted(fetchStudents);
        
        const viewDetails = (studentId) => {
            // Redirect to a specific user/student details page
            router.push({ name: 'StudentDetails', params: { id: studentId } });
        };
        
        // --- STYLES (Inline Styles for consistency) ---
        const themeColors = {
            darkGreen: '#1d3e21',
            mediumGreen: '#4CAF50',
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
            position: 'fixed', top: 0, left: 0, width: '100%',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 30px', backgroundColor: themeColors.darkGreen,
            color: themeColors.white, fontWeight: 'bold', zIndex: 10,
        }));

        const headerTitleStyle = computed(() => ({
            display: 'flex', alignItems: 'center', fontSize: '1.2rem', gap: '10px',
        }));

        const headerIconStyle = computed(() => ({ fontSize: '1.5rem' }));

        const profileIconStyle = computed(() => ({
            padding: '5px', background: themeColors.white, borderRadius: '50%',
        }));
        
        const profileIconInnerStyle = computed(() => ({
            fontSize: '1.2rem', color: themeColors.darkGreen, 
        }));

        const listWrapperStyle = computed(() => ({
            maxWidth: '900px', margin: '30px auto', padding: '30px',
            backgroundColor: themeColors.white, borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }));
        
        const mainTitleStyle = computed(() => ({
            textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold',
            color: themeColors.darkGreen, marginBottom: '30px',
            paddingBottom: '10px', borderBottom: `2px solid ${themeColors.mediumGreen}`,
        }));

        const tableContainerStyle = computed(() => ({ overflowX: 'auto' }));
        
        const tableStyle = computed(() => ({
            width: '100%', borderCollapse: 'separate', borderSpacing: '0 5px', textAlign: 'left',
        }));

        const tableHeadStyle = computed(() => ({
            backgroundColor: themeColors.mediumGreen, color: themeColors.white, borderRadius: '5px',
        }));
        
        const tableHeaderCellStyle = computed(() => ({
            padding: '12px 15px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 'bold',
        }));
        
        const tableRowStyle = computed(() => ({
            backgroundColor: '#f8fff8', border: '1px solid #eee', borderRadius: '5px',
            transition: 'background-color 0.2s', cursor: 'pointer',
            '&:hover': { backgroundColor: '#e6f0e7' }
        }));
        
        const tableCellStyle = computed(() => ({
            padding: '10px 15px', fontSize: '0.95rem', color: '#333',
        }));
        
        const loadingStyle = computed(() => ({
            padding: '15px', backgroundColor: '#fffbe6', border: '1px solid #ffcc00', 
            borderRadius: '5px', color: '#a07e00', fontWeight: 'bold', 
        }));

        const errorMessageStyle = computed(() => ({
            padding: '15px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', 
            borderRadius: '5px', color: '#721c24', fontWeight: 'bold', 
        }));
        
        const noDataStyle = computed(() => ({
            padding: '15px', backgroundColor: '#e9ecef', border: '1px solid #ccc', 
            borderRadius: '5px', color: '#6c757d', fontWeight: 'bold', 
        }));

        const viewButtonStyle = computed(() => ({
            padding: '5px 10px', backgroundColor: themeColors.darkGreen,
            color: themeColors.white, border: 'none', borderRadius: '3px',
            cursor: 'pointer', fontSize: '0.8rem', transition: 'background-color 0.2s',
        }));


        return {
            students, isLoading, errorMessage, viewDetails,
            userPageContainerStyle, headerBarStyle, headerTitleStyle, headerIconStyle,
            profileIconStyle, profileIconInnerStyle, listWrapperStyle, mainTitleStyle,
            tableContainerStyle, tableStyle, tableHeadStyle, tableHeaderCellStyle,
            tableRowStyle, tableCellStyle, loadingStyle, errorMessageStyle,
            noDataStyle, viewButtonStyle,
        };
    },
};
</script>

<style scoped>
/* Empty as all styling is handled via inline/computed styles */
</style>