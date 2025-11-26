<template>
  <div :style="adminDashboardContainerStyle">

    <div :style="navContainerStyle">
      <div :style="navLeftStyle">
        <button :style="navButtonStyle" @click="$router.push({ name: 'AdminDashboard' })">
          <span :style="iconStyle">📊</span> DASHBOARD
        </button>
        <div :style="navLinksStyle">
          <span @click="$router.push({ name: 'AdminStudents' })" :style="navLinkStyle">STUDENTS LIST</span>
          <span @click="$router.push({ name: 'AdminIncidents' })" :style="navLinkStyle">INCIDENT REPORT</span>
          <button :style="activeNavButtonStyle" @click="$router.push({ name: 'AddStudent' })">ADD STUDENT</button>
        </div>
      </div>
      <div :style="userProfileStyle">
        <span :style="profileIconStyle">👤</span>
      </div>
    </div>

    <h1 :style="mainTitleStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

    <div :style="formWrapperStyle">
      <p v-if="successMessage" :style="successMessageStyle">{{ successMessage }}</p>
      <p v-if="errorMessage" :style="errorMessageStyle">{{ errorMessage }}</p>

      <form @submit.prevent="addStudent" :style="studentFormStyle">

        <div :style="formGroupStyle('full')">
          <label for="student_number" :style="labelStyle">Student Number</label>
          <input type="text" id="student_number" v-model="student.student_number" :style="inputStyle()" required>
          <span :style="errorTextStyle" v-if="validationErrors.student_number">{{ validationErrors.student_number[0] }}</span>
        </div>

        <div :style="formRowStyle">
          <div :style="formGroupStyle('quarter')">
            <label for="gender" :style="labelStyle">Gender</label>
            <div :style="selectWrapperStyle">
              <select id="gender" v-model="student.gender" :style="selectStyle()" required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <span :style="selectIconStyle">v</span>
            </div>
            <span :style="errorTextStyle" v-if="validationErrors.gender">{{ validationErrors.gender[0] }}</span>
          </div>
          <div :style="formGroupStyle('third')">
            <label for="first_name" :style="labelStyle">First Name</label>
            <input type="text" id="first_name" v-model="student.first_name" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.first_name">{{ validationErrors.first_name[0] }}</span>
          </div>
          <div :style="formGroupStyle('third')">
            <label for="middle_name" :style="labelStyle">Middle Name</label>
            <input type="text" id="middle_name" v-model="student.middle_name" :style="inputStyle()">
            <span :style="errorTextStyle" v-if="validationErrors.middle_name">{{ validationErrors.middle_name[0] }}</span>
          </div>
          <div :style="formGroupStyle('third')">
            <label for="last_name" :style="labelStyle">Last Name</label>
            <input type="text" id="last_name" v-model="student.last_name" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.last_name">{{ validationErrors.last_name[0] }}</span>
          </div>
        </div>

        <div :style="formRowStyle">
          <div :style="formGroupStyle('quarter')">
            <label for="year_level" :style="labelStyle">Year Level</label>
            <div :style="selectWrapperStyle">
              <select id="year_level" v-model="student.year_level" :style="selectStyle()" required>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <span :style="selectIconStyle">v</span>
            </div>
            <span :style="errorTextStyle" v-if="validationErrors.year_level">{{ validationErrors.year_level[0] }}</span>
          </div>
          <div :style="formGroupStyle('quarter')">
            <label for="program" :style="labelStyle">Program</label>
            <div :style="selectWrapperStyle">
              <input type="text" id="program" v-model="student.program" :style="inputStyle()" required>
              <span :style="selectIconStyle">v</span>
            </div>
            <span :style="errorTextStyle" v-if="validationErrors.program">{{ validationErrors.program[0] }}</span>
          </div>
          <div :style="formGroupStyle('quarter')">
            <label for="section" :style="labelStyle">Section</label>
            <input type="text" id="section" v-model="student.section" :style="inputStyle()">
            <span :style="errorTextStyle" v-if="validationErrors.section">{{ validationErrors.section[0] }}</span>
          </div>

          <div :style="formGroupStyle('quarter')">
            <label for="date_of_birth" :style="labelStyle">Date of Birth</label>
            <input type="date" id="date_of_birth" v-model="student.date_of_birth" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.date_of_birth">{{ validationErrors.date_of_birth[0] }}</span>
          </div>
        </div>

        <div :style="formRowStyle">
          <div :style="formGroupStyle('half')">
            <label for="contact_number" :style="labelStyle">Contact Number</label>
            <input type="text" id="contact_number" v-model="student.contact_number" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.contact_number">{{ validationErrors.contact_number[0] }}</span>
          </div>
          <div :style="formGroupStyle('half')">
            <label for="email" :style="labelStyle">Email</label>
            <input type="email" id="email" v-model="student.email" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.email">{{ validationErrors.email[0] }}</span>
          </div>
        </div>

        <div :style="formGroupStyle('full')">
          <label for="address" :style="labelStyle">Address</label>
          <input id="address" v-model="student.address" :style="inputStyle()" required>
          <span :style="errorTextStyle" v-if="validationErrors.address">{{ validationErrors.address[0] }}</span>
        </div>

        <div :style="formRowStyle">
          <div :style="formGroupStyle('third')">
            <label for="guardian_name" :style="labelStyle">Guardian Name</label>
            <input type="text" id="guardian_name" v-model="student.guardian_name" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.guardian_name">{{ validationErrors.guardian_name[0] }}</span>
          </div>
          <div :style="formGroupStyle('third')">
            <label for="guardian_contact" :style="labelStyle">Guardian Contact</label>
            <input type="text" id="guardian_contact" v-model="student.guardian_contact" :style="inputStyle()" required>
            <span :style="errorTextStyle" v-if="validationErrors.guardian_contact">{{ validationErrors.guardian_contact[0] }}</span>
          </div>
          <div :style="formGroupStyle('third')">
            <button type="submit" :disabled="isLoading" :style="submitButtonStyle">
              {{ isLoading ? 'Adding...' : 'Add Student' }}
            </button>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import api from '@/services/api'; 

const initialStudentState = {
  student_number: '',
  first_name: '',
  middle_name: null, 
  last_name: '',
  gender: 'Male', 
  date_of_birth: '',
  program: '',
  year_level: '1st Year', 
  section: null, 
  contact_number: '',
  email: '',
  address: '',
  guardian_name: '',
  guardian_contact: '',
};

export default {
    setup() {
      const student = ref({ ...initialStudentState });
      const validationErrors = ref({});
      const successMessage = ref('');
      const errorMessage = ref('');
      const isLoading = ref(false);

      const resetForm = () => {
          student.value = { ...initialStudentState };
          validationErrors.value = {};
          errorMessage.value = '';
      };

      const addStudent = async () => {
          validationErrors.value = {};
          errorMessage.value = '';
          successMessage.value = '';
          isLoading.value = true;

          try {
              const response = await api.post('/students', student.value);
              
              if (response.status === 201 || response.status === 200) {
                  successMessage.value = '✅ Student added successfully! Clearing form...';
                  setTimeout(resetForm, 2000); 
              }

          } catch (error) {
              if (error.response) {
                  const status = error.response.status;

                  if (status === 422 && error.response.data.errors) {
                      errorMessage.value = 'Validation failed. Please check the fields below.';
                      validationErrors.value = error.response.data.errors;
                  } else {
                      errorMessage.value = `An error occurred: ${error.response.data.message || error.message}`;
                  }
              } else {
                  errorMessage.value = 'Network error or server is unreachable.';
              }
              
              successMessage.value = '';

          } finally {
              isLoading.value = false;
          }
      };

      return {
          student,
          validationErrors,
          successMessage,
          errorMessage,
          isLoading,
          addStudent,
      };
    },
    methods: {
      formGroupStyle(type) {
          let width = '100%';
          // Standard vertical spacing for all fields in a row
          const marginBottom = '20px'; 

          if (type === 'half') width = 'calc(50% - 7.5px)';
          else if (type === 'third') width = 'calc(33.333% - 10px)';
          else if (type === 'quarter') width = 'calc(25% - 11.25px)';
          
          return {
              flex: type === 'full' ? '1 1 100%' : `1 1 ${width}`,
              marginBottom: marginBottom, 
          };
      },
      inputStyle() {
            return {
              // Uniform padding and height
              padding: '10px 12px',
              height: '42px',
              // ---
              border: 'none',
              borderRadius: '5px',
              background: '#e6f0e7',
              color: '#1d3e21',
              fontSize: '1rem',
              boxSizing: 'border-box',
              width: '100%',
              fontFamily: 'inherit',
            };
      },
      selectStyle() {
            return {
              // Uniform padding and height
              padding: '10px 12px',
              height: '42px',
              // ---
              border: 'none',
              borderRadius: '5px',
              background: '#e6f0e7',
              color: '#1d3e21',
              fontSize: '1rem',
              boxSizing: 'border-box',
              width: '100%',
              appearance: 'none',
              cursor: 'pointer',
            };
      }
    },
    computed: {
      // --- General Styles ---
      adminDashboardContainerStyle() {
          return {
              padding: '0', 
              fontFamily: 'Arial, sans-serif',
              minHeight: '100vh',
              backgroundColor: '#e6f0e7',
          };
      },
      // --- Navigation Styles (Replicating Dashboard Header) ---
      navContainerStyle() {
          return {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 20px',
              background: '#1d3e21',
              color: '#fff',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
          };
      },
      navLeftStyle() {
          return {
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
          };
      },
      navButtonStyle() {
          return {
              display: 'flex',
              alignItems: 'center',
              padding: '8px 15px',
              background: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          };
      },
      activeNavButtonStyle() {
            return {
              display: 'flex',
              alignItems: 'center',
              padding: '8px 15px',
              background: '#f8fff8',
              color: '#1d3e21',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              textTransform: 'uppercase',
            };
      },
      iconStyle() {
          return {
              marginRight: '8px',
          };
      },
      navLinksStyle() {
          return {
              display: 'flex',
              gap: '20px',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              color: '#ddd',
          };
      },
      navLinkStyle() {
          return {
              cursor: 'pointer',
              transition: 'color 0.2s',
              padding: '8px 0',
              color: '#fff',
          };
      },
      userProfileStyle() {
          return {
              padding: '8px 10px',
              background: '#f8fff8', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '35px',
              height: '35px',
              color: '#1d3e21', 
          };
      },
      profileIconStyle() {
          return {
              fontSize: '1.2rem',
          };
      },
      // --- Main Title ---
      mainTitleStyle() {
          return {
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: '#1d3e21', 
              margin: '40px 0 30px 0',
              textTransform: 'uppercase',
          };
      },
      // --- Form Wrapper Styles ---
      formWrapperStyle() {
          return {
              maxWidth: '1000px',
              margin: '0 auto',
              padding: '30px',
              background: '#38763a',
              borderRadius: '10px',
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
              position: 'relative',
          };
      },
      studentFormStyle() {
          return {
              display: 'flex',
              flexDirection: 'column',
          };
      },
      // --- Form Element Styles ---
      labelStyle() {
          return {
              display: 'block',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              marginBottom: '4px',
              color: '#f8fff8',
              opacity: 0.8,
          };
      },
      formRowStyle() {
          return {
              display: 'flex',
              gap: '15px',
              marginBottom: '0', 
          };
      },
      selectWrapperStyle() {
          return {
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
          };
      },
      selectIconStyle() {
          return {
              position: 'absolute',
              right: '10px',
              fontSize: '0.8rem',
              color: '#1d3e21',
              pointerEvents: 'none',
              top: '50%',
              transform: 'translateY(-50%)',
          };
      },
      // --- Submit Button Style (Reverted to original dark theme) ---
      submitButtonStyle() {
          return {
              marginTop: '1.6rem',
              padding: '12px 25px',
              background: '#1d3e21',
              color: '#f8fff8',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
              width: '100%',
              textTransform: 'uppercase',
          };
      },
      // --- Message/Error Styles ---
      successMessageStyle() {
          return {
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              fontWeight: 'bold',
              backgroundColor: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb',
          };
      },
      errorMessageStyle() {
          return {
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              fontWeight: 'bold',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              border: '1px solid #f5c6cb',
          };
      },
      errorTextStyle() {
          return {
              color: '#ffdddd',
              fontSize: '0.85em',
              marginTop: '5px',
              display: 'block',
          };
      },
    }
};
</script>

<style scoped>
/* Scoped CSS is empty as all styling is handled via computed properties */
</style>