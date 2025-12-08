<template>
  <AdminNavbar>
    <div class="student-list-page">
      <!-- Top banner -->
      <header class="student-list-header">
        <div>
          <h1>STUDENT LIST AND RECORDS</h1>
          <p>A comprehensive overview of all currently enrolled students.</p>
        </div>

        <button
          class="generate-btn"
          @click="router.push({ name: 'CertificateGenerator' })"
        >
          GENERATE<br />
          CERTIFICATE
        </button>
      </header>

      <!-- Notifier -->
      <transition name="status-bar">
        <div v-if="showStatusBar" class="status-bar">
          <div class="status-bar__inner">
            {{ statusMessage }}
          </div>
        </div>
      </transition>

      <!-- Controls hamburger strip -->
      <section class="student-controls">
        <div class="student-controls__search">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by ID, Name, or Program..."
          />
        </div>

        <select
          v-model="selectedProgram"
          class="student-controls__filter"
        >
          <option value="">Filter by Program (All)</option>
          <option
            v-for="program in uniquePrograms"
            :key="program"
            :value="program"
          >
            {{ program }}
          </option>
        </select>

        <div class="student-controls__total">
          TOTAL STUDENTS: {{ totalStudentsCount }}
        </div>
      </section>

      <!-- Table card -->
      <section class="student-table-card">
        <div class="student-table-card__inner">
          <div v-if="isLoading" class="student-loading">
            <span class="spinner"></span>
            Loading student list...
          </div>

          <div v-else-if="error" class="student-error">
            <p class="student-error__title">Error:</p>
            <p>{{ error }}</p>
          </div>

          <div v-else-if="students.length === 0" class="student-empty">
            <p class="student-empty__title">No Students Found</p>
            <p class="student-empty__subtitle">
              The student database is empty or no results match the filters.
            </p>
          </div>

          <div v-else class="student-table-wrapper">
            <table class="student-table">
              <thead>
                <tr>
                  <th @click="toggleSort('student_number')">
                    STUDENT ID {{ getSortIcon('student_number') }}
                  </th>
                  <th @click="toggleSort('full_name')">
                    STUDENT NAME {{ getSortIcon('full_name') }}
                  </th>
                  <th @click="toggleSort('program')">
                    PROGRAM {{ getSortIcon('program') }}
                  </th>
                  <th @click="toggleSort('year_level')">
                    YEAR LEVEL {{ getSortIcon('year_level') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="student in students"
                  :key="student.student_number"
                >
                  <td>{{ student.student_number }}</td>
                  <td>{{ getFullName(student) }}</td>
                  <td>{{ student.program }}</td>
                  <td>{{ student.year_level }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- pagination -->
          <div
            v-if="totalPages > 1"
            class="student-pagination"
          >
            <button
              :disabled="currentPage === 1"
              @click="prevPage"
            >
              Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

// --- State ---
const students = ref([]);
const isLoading = ref(false);
const error = ref(null);

const searchTerm = ref('');
const selectedProgram = ref('');
const sortBy = ref('last_name');
const sortDirection = ref('asc');

const currentPage = ref(1);
const totalPages = ref(1);
const totalStudentsCount = ref(0);
const itemsPerPage = ref(10);

const router = useRouter();

// Notifier
const showStatusBar = ref(false);
const statusMessage = ref('');

const triggerStatusBar = (msg) => {
  statusMessage.value = msg;
  showStatusBar.value = true;
  setTimeout(() => {
      showStatusBar.value = false;
  }, 3000);
};

// --- Fetch students ---
const fetchStudents = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/students', {
      params: {
        page: currentPage.value,
        search: searchTerm.value,
        program: selectedProgram.value,
        per_page: itemsPerPage.value,
        sort_by: sortBy.value,
        sort_dir: sortDirection.value,
      },
    });
    const data = response.data;
    students.value = data.data || [];
    currentPage.value = data.current_page || 1;
    totalPages.value = data.last_page || 1;
    totalStudentsCount.value = data.total || 0;
    triggerStatusBar('Student list updated');
  } catch (err) {
    error.value =
      err?.response?.data?.message || 'Could not load student data.';
  } finally {
    isLoading.value = false;
  }
};

// --- Computed helpers ---
const getFullName = (student) =>
  [student.last_name, student.first_name, student.middle_name]
    .filter(Boolean)
    .join(' ');

const uniquePrograms = computed(() => {
  const programs = students.value.map((s) => s.program).filter(Boolean);
  return [...new Set(programs)].sort();
});

// --- Watchers ---
watch([searchTerm, selectedProgram], () => {
  currentPage.value = 1;
  fetchStudents();
});

// --- Pagination ---
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchStudents();
  }
};

const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);

// --- Sorting UI ---
const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
  fetchStudents();
};

const getSortIcon = (column) =>
  sortBy.value !== column ? '—' : sortDirection.value === 'asc' ? '▲' : '▼';

onMounted(fetchStudents);
</script>
<style scoped>
.student-list-page {
  min-height: 100vh;
  padding: 24px;
  background-color: #74a765;
  box-sizing: border-box;
}

/* Header */
.student-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e1f3d5;
  border-radius: 16px;
  padding: 16px 24px;
  color: #0b3a23;
  margin-bottom: 14px;
}

.student-list-header h1 {
  margin: 0 0 4px;
  font-size: 1.6rem;
  font-weight: 800;
}

.student-list-header p {
  margin: 0;
  font-size: 0.85rem;
}

.generate-btn {
  border: none;
  border-radius: 16px;
  padding: 10px 26px;
  background-color: #74a765;
  color: #e1f3d5;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
}

/* Notifier */
.status-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.status-bar__inner {
  max-width: 1000px;
  width: 100%;
  background-color: #e9f8e4;
  color: #000;
  font-weight: 700;
  font-size: 0.95rem;
  border-radius: 20px;
  box-shadow: inset 0 0 0 4px #003b23, 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
  text-align: center;
}

.status-bar-enter-active,
.status-bar-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.status-bar-enter-from,
.status-bar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Controls strip */
.student-controls {
  display: grid;
  grid-template-columns: 1.8fr 1.1fr 0.9fr;
  gap: 12px;
  background-color: #dfead6;
  border-radius: 999px;
  padding: 8px 14px;
  margin-bottom: 14px;
}

.student-controls__search input {
  width: 100%;
  border-radius: 999px;
  border: none;
  padding: 8px 12px;
  font-size: 0.85rem;
  outline: none;
  background-color: #ffffff;
}

.student-controls__filter {
  border-radius: 999px;
  border: none;
  padding: 8px 12px;
  font-size: 0.8rem;
  background-color: #ffffff;
  outline: none;
}

.student-controls__total {
  border-radius: 999px;
  background-color: #5c864f;
  color: #f9fffa;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Table card */
.student-table-card {
  background-color: #0b3a23;
  border-radius: 20px;
  padding: 10px;
}

.student-table-card__inner {
  background-color: #f1fbe5;
  border-radius: 16px;
  padding: 10px;
}

/* states */
.student-loading,
.student-empty {
  text-align: center;
  padding: 28px;
}

.student-empty__title {
  font-weight: 700;
  font-size: 1rem;
  color: #6b7280;
}

.student-empty__subtitle {
  color: #9ca3af;
  font-size: 0.85rem;
}

.student-error {
  padding: 10px 14px;
  border-radius: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.student-error__title {
  font-weight: 700;
  margin: 0 0 4px;
}

/* spinner */
.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(11, 58, 35, 0.25);
  border-top-color: #0b3a23;
  animation: spin 1s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

/* table */
.student-table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  background-color: #e1f3d5;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.student-table thead {
  background-color: #064b2a;
  color: #ffffff;
}

.student-table th {
  padding: 10px 16px;
  font-size: 0.75rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
}

.student-table tbody tr:nth-child(even) {
  background-color: #e1f3d5;
}
.student-table tbody tr:nth-child(odd) {
  background-color: #e1f3d5;
}

.student-table td {
  padding: 10px 16px;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(12, 61, 36, 0.25);
}

/* pagination */
.student-pagination {
  margin-top: 10px;
  padding: 8px 10px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.student-pagination button {
  padding: 6px 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background-color: #0b3a23;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
}

.student-pagination button:disabled {
  background-color: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.student-pagination span {
  font-size: 0.85rem;
  color: #0b3a23;
}

/* spin keyframes */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
