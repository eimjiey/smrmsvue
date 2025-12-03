<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

// --- State Management ---
const students = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('student_number');
const sortDirection = ref('asc');

// --- Setup ---
const router = useRouter();

// --- API Fetching Logic ---
const fetchStudents = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/students');
    let receivedData = response.data;
    if (
      typeof receivedData === 'object' &&
      receivedData !== null &&
      Array.isArray(receivedData.data)
    ) {
      receivedData = receivedData.data;
    }
    students.value = Array.isArray(receivedData) ? receivedData : [];
  } catch (err) {
    let errorMessage = 'Could not load student data.';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    } else if (
      err.message === 'Network error: Unable to connect to the server.'
    ) {
      errorMessage =
        'Network connection failed. Ensure the Laravel server is running.';
    }
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

// --- Helpers & Computeds ---
const getFullName = (student) => {
  const parts = [student.last_name, student.first_name];
  if (student.middle_name) {
    parts.push(student.middle_name);
  }
  return parts.filter(Boolean).join(' ');
};

const filteredStudents = computed(() => {
  const studentList = students.value || [];
  if (!searchTerm.value) return studentList;
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return studentList.filter(
    (student) =>
      (student.student_number &&
        student.student_number.toLowerCase().includes(lowerCaseSearch)) ||
      getFullName(student).toLowerCase().includes(lowerCaseSearch) ||
      (student.program &&
        student.program.toLowerCase().includes(lowerCaseSearch)) ||
      (student.year_level &&
        student.year_level.toLowerCase().includes(lowerCaseSearch)),
  );
});

const sortedStudents = computed(() => {
  const list = Array.isArray(filteredStudents.value)
    ? [...filteredStudents.value]
    : [];
  if (!sortBy.value || list.length === 0) return list;
  list.sort((a, b) => {
    let aValue;
    let bValue;
    if (sortBy.value === 'full_name') {
      aValue = a.last_name;
      bValue = b.last_name;
    } else if (sortBy.value === 'student_number') {
      aValue = a.student_number;
      bValue = b.student_number;
    } else {
      aValue = a[sortBy.value];
      bValue = b[sortBy.value];
    }
    const comparison = String(aValue || '').localeCompare(String(bValue || ''));
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
  return list;
});

const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
};

const getSortIcon = (column) => {
  if (sortBy.value !== column) return '—';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

onMounted(fetchStudents);

// --- Layout styles mirroring Incident Reports design ---

const adminDashboardContainerStyle = {
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#e6f0e7',
  padding: '0',
};

const mainTitleStyle = {
  textAlign: 'center',
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#198040',
  margin: '25px 0 10px 0',
  letterSpacing: '1px',
};

const formWrapperOuterStyle = {
  maxWidth: '1100px',
  margin: '20px auto 40px auto',
  padding: '0 20px',
};

const formWrapperInnerStyle = {
  padding: '30px',
  borderRadius: '30px',
  backgroundImage: `url(${formBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
  position: 'relative',
};

const sectionHeaderStyle = {
  position: 'absolute',
  top: '10px',
  left: '40px',
  padding: '8px 25px',
  background: '#ffffff',
  borderRadius: '999px',
  fontWeight: 'bold',
  fontSize: '1rem',
  zIndex: 2,
};

const contentCardStyle = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '25px',
  padding: '45px 35px 35px 35px',
  display: 'flex',
  flexDirection: 'column',
};

const cardHeadingStyle = {
  fontSize: '1.4rem',
  fontWeight: '800',
  color: '#1d3e21',
  margin: '0 0 6px 0',
  textAlign: 'center',
};

const subHeadingStyle = {
  color: '#4b5563',
  marginBottom: '18px',
  fontSize: '0.9rem',
  textAlign: 'center',
};

// Control bar (search + total + button)
const controlBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#ffffff',
  padding: '10px 18px',
  borderRadius: '999px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '18px',
};

const searchWrapperStyle = {
  width: '50%',
  position: 'relative',
};

const searchInputStyle = {
  width: '100%',
  padding: '8px 10px 8px 36px',
  border: 'none',
  borderRadius: '999px',
  outline: 'none',
  fontSize: '0.85rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
};

const searchIconStyle = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: '18px',
  height: '18px',
  color: '#9ca3af',
};

const totalStudentsStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#1d3e21',
};

const navButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 15px',
  background: '#064b2a',
  color: '#fff',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
};

// Messages
const loadingStyle = {
  textAlign: 'center',
  padding: '24px',
  color: '#1d3e21',
  fontWeight: '600',
  fontSize: '1rem',
};

const spinnerStyle = {
  display: 'inline-block',
  width: '20px',
  height: '20px',
  marginRight: '8px',
  verticalAlign: 'middle',
};

const errorBoxStyle = computed(() => {
  const base = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontWeight: '600',
    border: '1px solid',
    fontSize: '0.85rem',
  };
  if (error.value && error.value.startsWith('✅')) {
    return {
      ...base,
      backgroundColor: '#d4edda',
      color: '#155724',
      borderColor: '#c3e6cb',
    };
  }
  return {
    ...base,
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderColor: '#f5c6cb',
  };
});

const errorTitleStyle = {
  fontWeight: '700',
};

const noDataStyle = {
  textAlign: 'center',
  padding: '32px',
  background: '#ffffff',
  borderRadius: '18px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  border: '1px solid #e5e7eb',
};

const noDataTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: '700',
  color: '#6b7280',
};

const noDataSubTitleStyle = {
  color: '#9ca3af',
  marginTop: '6px',
};

// Table panel (same style idea as incident table)
const tableOuterPanelStyle = {
  marginTop: '4px',
  borderRadius: '22px',
  padding: '10px',
  background:
    'linear-gradient(145deg, rgba(0,128,96,0.35), rgba(0,80,180,0.45))',
};

const tableWrapperStyle = {
  overflowX: 'auto',
  borderRadius: '18px',
  background: 'rgba(0,0,0,0.15)',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
};

const tableHeaderStyle = {
  background: '#064b2a',
  color: '#ffffff',
};

const tableHeaderCellStyle = (position) => {
  let radius = {};
  if (position === 'tl') radius = { borderTopLeftRadius: '16px' };
  if (position === 'tr') radius = { borderTopRightRadius: '16px' };
  return {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    ...radius,
  };
};

const tableBodyStyle = {
  background: 'transparent',
};

const tableRowStyle = {
  transition: 'background-color 0.15s',
};

const tableDataCellStyle = (type) => {
  let color = '#e5fdf4';
  let fontWeight = '400';
  let textAlign = 'left';
  if (type === 'id' || type === 'name') {
    color = '#ffffff';
    fontWeight = '600';
  }
  return {
    padding: '10px 16px',
    fontSize: '0.85rem',
    color,
    fontWeight,
    textAlign,
    borderBottom: '1px solid rgba(255,255,255,0.25)',
    whiteSpace: 'nowrap',
  };
};

const noSearchResultsStyle = {
  textAlign: 'center',
  padding: '20px',
  color: '#f9fafb',
  fontStyle: 'italic',
  fontSize: '0.9rem',
};
</script>

<template>
  <div :style="adminDashboardContainerStyle">
    <AdminNavbar />

    <h1 :style="mainTitleStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

    <div :style="formWrapperOuterStyle">
      <div :style="formWrapperInnerStyle">
        <div :style="sectionHeaderStyle">STUDENT DIRECTORY</div>

        <div :style="contentCardStyle">
          <h2 :style="cardHeadingStyle">Student Directory</h2>
          <p :style="subHeadingStyle">
            Manage all registered students in the system.
          </p>

          <div :style="controlBarStyle">
            <div :style="searchWrapperStyle">
              <input
                type="text"
                v-model="searchTerm"
                placeholder="Search by ID, Name, or Program..."
                :style="searchInputStyle"
              />
              <svg
                :style="searchIconStyle"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div style="display: flex; gap: 12px; align-items: center;">
              <div :style="totalStudentsStyle">
                TOTAL STUDENTS: {{ students.length }}
              </div>
              <button
                :style="navButtonStyle"
                @click="router.push({ name: 'CertificateGenerator' })"
              >
                🎓 Generate Certificate
              </button>
            </div>
          </div>

          <div v-if="isLoading" :style="loadingStyle">
            <svg
              class="animate-spin"
              :style="spinnerStyle"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              ircle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
                   5.291A7.962 7.962 0 014 12H0c0 3.042 1.135
                   5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading student list...
          </div>

          <div v-else-if="error" :style="errorBoxStyle">
            <p :style="errorTitleStyle">Error:</p>
            <p>{{ error }}</p>
          </div>

          <div
            v-else-if="students.length === 0 && !isLoading && !error"
            :style="noDataStyle"
          >
            <p :style="noDataTitleStyle">No Students Found</p>
            <p :style="noDataSubTitleStyle">
              The student database is currently empty.
            </p>
          </div>

          <div v-else :style="tableOuterPanelStyle">
            <div :style="tableWrapperStyle">
              <table :style="tableStyle">
                <thead :style="tableHeaderStyle">
                  <tr>
                    <th
                      :style="tableHeaderCellStyle('tl')"
                      @click="toggleSort('student_number')"
                    >
                      ID {{ getSortIcon('student_number') }}
                    </th>
                    <th
                      :style="tableHeaderCellStyle('')"
                      @click="toggleSort('full_name')"
                    >
                      STUDENT NAME {{ getSortIcon('full_name') }}
                    </th>
                    <th
                      :style="tableHeaderCellStyle('')"
                      @click="toggleSort('program')"
                    >
                      PROGRAM {{ getSortIcon('program') }}
                    </th>
                    <th
                      :style="tableHeaderCellStyle('tr')"
                      @click="toggleSort('year_level')"
                    >
                      YEAR LEVEL {{ getSortIcon('year_level') }}
                    </th>
                  </tr>
                </thead>
                <tbody :style="tableBodyStyle">
                  <tr
                    v-for="student in sortedStudents"
                    :key="student.student_number"
                    :style="tableRowStyle"
                  >
                    <td :style="tableDataCellStyle('id')">
                      {{ student.student_number }}
                    </td>
                    <td :style="tableDataCellStyle('name')">
                      {{ getFullName(student) }}
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      {{ student.program }}
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      {{ student.year_level }}
                    </td>
                  </tr>

                  <tr
                    v-if="students.length > 0 && filteredStudents.length === 0"
                  >
                    <td colspan="4" :style="noSearchResultsStyle">
                      No results found for "{{ searchTerm }}"
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
