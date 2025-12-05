<template>
  <AdminNavbar>
    
    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">PERSONAL INFORMATION</div>

        <p v-if="successMessage" :style="successMessageStyle">{{ successMessage }}</p>
        <p v-if="errorMessage" :style="errorMessageStyle">{{ errorMessage }}</p>

        <form @submit.prevent="addStudent" :style="studentFormStyle">
          <div :style="formGroupStyle('full')">
            <label for="student_number" :style="labelStyle">Student ID</label>
            <input
              type="text"
              id="student_number"
              v-model="student.student_number"
              :style="inputStyle()"
              required
            >
            <span :style="errorTextStyle" v-if="validationErrors.student_number">
              {{ validationErrors.student_number[0] }}
            </span>
          </div>

          <div :style="formRowStyle">
            <div :style="formGroupStyle('quarter')">
              <label :style="labelStyle">Gender</label>

              <div :style="genderGroupStyle">
                <button
                  type="button"
                  :style="genderButtonStyle(student.gender === 'Male')"
                  @click="student.gender = 'Male'"
                >
                  MALE
                </button>
                <button
                  type="button"
                  :style="genderButtonStyle(student.gender === 'Female')"
                  @click="student.gender = 'Female'"
                >
                  FEMALE
                </button>
              </div>

              <span :style="errorTextStyle" v-if="validationErrors.gender">
                {{ validationErrors.gender[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('third')">
              <label for="first_name" :style="labelStyle">First Name</label>
              <input
                type="text"
                id="first_name"
                v-model="student.first_name"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.first_name">
                {{ validationErrors.first_name[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('third')">
              <label for="middle_name" :style="labelStyle">Middle Name</label>
              <input
                type="text"
                id="middle_name"
                v-model="student.middle_name"
                :style="inputStyle()"
              >
              <span :style="errorTextStyle" v-if="validationErrors.middle_name">
                {{ validationErrors.middle_name[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('third')">
              <label for="last_name" :style="labelStyle">Last Name</label>
              <input
                type="text"
                id="last_name"
                v-model="student.last_name"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.last_name">
                {{ validationErrors.last_name[0] }}
              </span>
            </div>
          </div>

          <div :style="formRowStyle">
            <div :style="formGroupStyle('quarter')">
              <label for="year_level" :style="labelStyle">Year Level</label>
              <select
                id="year_level"
                v-model="student.year_level"
                :style="selectStyle()"
                required
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              <span :style="errorTextStyle" v-if="validationErrors.year_level">
                {{ validationErrors.year_level[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('quarter')">
              <label for="program" :style="labelStyle">Program</label>
              <input
                type="text"
                id="program"
                v-model="student.program"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.program">
                {{ validationErrors.program[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('quarter')">
              <label for="section" :style="labelStyle">Section</label>
              <input
                type="text"
                id="section"
                v-model="student.section"
                :style="inputStyle()"
              >
              <span :style="errorTextStyle" v-if="validationErrors.section">
                {{ validationErrors.section[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('quarter')">
              <label for="date_of_birth" :style="labelStyle">Date Of Birth</label>
              <input
                type="date"
                id="date_of_birth"
                v-model="student.date_of_birth"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.date_of_birth">
                {{ validationErrors.date_of_birth[0] }}
              </span>
            </div>
          </div>

          <div :style="formRowStyle">
            <div :style="formGroupStyle('half')">
              <label for="contact_number" :style="labelStyle">Contact Number</label>
              <input
                type="text"
                id="contact_number"
                v-model="student.contact_number"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.contact_number">
                {{ validationErrors.contact_number[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('half')">
              <label for="email" :style="labelStyle">Email</label>
              <input
                type="email"
                id="email"
                v-model="student.email"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.email">
                {{ validationErrors.email[0] }}
              </span>
            </div>
          </div>

          <div :style="formGroupStyle('full')">
            <label for="address" :style="labelStyle">Address</label>
            <input
              id="address"
              v-model="student.address"
              :style="inputStyle()"
              required
            >
            <span :style="errorTextStyle" v-if="validationErrors.address">
              {{ validationErrors.address[0] }}
            </span>
          </div>

          <div :style="formRowStyle">
            <div :style="formGroupStyle('third')">
              <label for="guardian_name" :style="labelStyle">Guardian Name</label>
              <input
                type="text"
                id="guardian_name"
                v-model="student.guardian_name"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.guardian_name">
                {{ validationErrors.guardian_name[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('third')">
              <label for="guardian_contact" :style="labelStyle">Guardian Contact</label>
              <input
                type="text"
                id="guardian_contact"
                v-model="student.guardian_contact"
                :style="inputStyle()"
                required
              >
              <span :style="errorTextStyle" v-if="validationErrors.guardian_contact">
                {{ validationErrors.guardian_contact[0] }}
              </span>
            </div>

            <div :style="formGroupStyle('third')">
              <button
                type="submit"
                :disabled="isLoading"
                :style="submitButtonStyle"
              >
                {{ isLoading ? 'Adding...' : 'Add Student' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

  </AdminNavbar>
</template>

<script>
import { ref } from 'vue';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

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
  name: 'AddStudent',
  components: { AdminNavbar },
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
      const marginBottom = '12px'; // smaller vertical spacing
      if (type === 'half') width = 'calc(50% - 5px)';
      else if (type === 'third') width = 'calc(33.333% - 7px)';
      else if (type === 'quarter') width = 'calc(25% - 8px)';
      return {
        flex: type === 'full' ? '1 1 100%' : `1 1 ${width}`,
        marginBottom,
      };
    },
    inputStyle() {
      return {
        padding: '8px 14px',
        height: '38px',
        border: 'none',
        borderRadius: '999px',
        background: '#ffffff',
        color: '#1d3e21',
        fontSize: '0.85rem',
        boxSizing: 'border-box',
        width: '100%',
        fontFamily: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        outline: 'none',
        transition: 'box-shadow 0.15s',
      };
    },
    selectStyle() {
      return {
        padding: '8px 14px',
        height: '38px',
        border: 'none',
        borderRadius: '999px',
        background: '#ffffff',
        color: '#1d3e21',
        fontSize: '0.85rem',
        boxSizing: 'border-box',
        width: '100%',
        appearance: 'none',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        outline: 'none',
        transition: 'box-shadow 0.15s',
      };
    },
    genderButtonStyle(active) {
      return {
        padding: '6px 12px',
        borderRadius: '999px',
        border: 'none',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginRight: '6px',
        background: active ? '#1d3e21' : '#f0f5f0',
        color: active ? '#ffffff' : '#1d3e21',
        boxShadow: active ? '0 1px 3px rgba(0,0,0,0.25)' : 'none',
      };
    },
  },
  computed: {
    // REMOVED: adminDashboardContainerStyle (Handled by AdminNavbar root layout)
    // REMOVED: mainTitleStyle (Handled by AdminNavbar top bar)

    formWrapperOuterStyle() {
      return {
        maxWidth: '850px', // narrower card
        margin: '20px auto 40px auto', // Centered in the AdminNavbar content area
        padding: '0 10px',
      };
    },
    formWrapperInnerStyle() {
      return {
        padding: '20px',
        borderRadius: '24px',
        backgroundImage: `url(${formBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
        position: 'relative',
      };
    },
    sectionHeaderStyle() {
      return {
        position: 'absolute',
        top: '6px',
        left: '28px',
        padding: '6px 18px',
        background: '#ffffff',
        borderRadius: '999px',
        fontWeight: 'bold',
        fontSize: '0.9rem',
        zIndex: 2,
      };
    },
    studentFormStyle() {
      return {
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '20px',
        padding: '30px 25px 25px 25px',
        display: 'flex',
        flexDirection: 'column',
      };
    },
    labelStyle() {
      return {
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        marginBottom: '3px',
        color: '#1d3e21',
      };
    },
    formRowStyle() {
      return {
        display: 'flex',
        gap: '10px',
        marginBottom: '0',
        flexWrap: 'wrap',
      };
    },
    genderGroupStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        background: '#e5f2e6',
        borderRadius: '24px',
        padding: '4px 6px',
      };
    },
    submitButtonStyle() {
      return {
        marginTop: '1.2rem',
        padding: '10px 30px',
        background: '#064b2a',
        color: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 3px 6px rgba(0,0,0,0.25)',
        alignSelf: 'flex-end',
        width: 'auto',
        textTransform: 'uppercase',
      };
    },
    successMessageStyle() {
      return {
        padding: '8px',
        marginBottom: '10px',
        borderRadius: '4px',
        fontWeight: 'bold',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        fontSize: '0.85rem',
      };
    },
    errorMessageStyle() {
      return {
        padding: '8px',
        marginBottom: '10px',
        borderRadius: '4px',
        fontWeight: 'bold',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        fontSize: '0.85rem',
      };
    },
    errorTextStyle() {
      return {
        color: '#d9534f',
        fontSize: '0.75em',
        marginTop: '4px',
        display: 'block',
      };
    },
  },
};
</script>

<style scoped>
input:focus,
select:focus {
  box-shadow: 0 0 0 2px #0e7bff;
}
/* Custom select arrow styling for non-appearance: none */
select {
    /* To ensure the default appearance is suppressed for styling compatibility */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%231d3e21"><path d="M7 7l3 3 3-3m0 6l-3-3-3 3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    background-repeat: no-repeat;
    background-position: right 14px center; /* Positioned inside the input padding */
    background-size: 1.2em;
    padding-right: 30px !important; /* Ensure space for the arrow */
}
</style>