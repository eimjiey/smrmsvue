<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

const router = useRouter();
const statusOptions = ['Pending', 'Investigation', 'Resolved', 'Closed'];

const incidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');
const sortBy = ref('date_of_incident');
const sortDirection = ref('desc');

const currentPage = ref(1);
const itemsPerPage = ref(10);

// success notifier
const statusMessage = ref('');
const showStatusBar = ref(false);

const showSuccessBar = (msg) => {
  statusMessage.value = msg;
  showStatusBar.value = true;
  setTimeout(() => {
    showStatusBar.value = false;
  }, 3000);
};

// API
const fetchIncidents = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/incidents');
    let receivedData = response.data;
    if (receivedData && receivedData.data && Array.isArray(receivedData.data)) {
      receivedData = receivedData.data;
    }
    incidents.value = Array.isArray(receivedData) ? receivedData : [];
    currentPage.value = 1;
  } catch (err) {
    let errorMessage =
      'Could not load incident reports. Check server connectivity or authentication.';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

const updateIncidentStatus = async (incident, newStatus) => {
  if (incident.status === newStatus) return;

  const originalStatus = incident.status;
  incident.status = newStatus;
  error.value = null;

  try {
    const response = await api.put(`/incidents/${incident.id}/status`, {
      status: newStatus,
    });
    if (!response.data?.incident || response.data.incident.status !== newStatus) {
      incident.status = originalStatus;
      throw new Error('Server did not confirm status change.');
    }
    // show green bar, keep error null
    showSuccessBar('Status updated successfully!');
  } catch (err) {
    incident.status = originalStatus;
    let msg = 'Failed to update status. Check backend logs.';
    if (err.response?.data?.message) {
      msg = err.response.data.message;
    }
    error.value = `Failed to update status for incident ${incident.id}. Message: ${msg}`;
  }
};

const handleEdit = (incident) => {
  router.push({ name: 'EditIncident', params: { id: incident.id } });
};

const handleView = (incident) => {
  router.push({ name: 'ViewPrescriptive', params: { id: incident.id } });
};

const handleViewTrash = () => {
  router.push({ name: 'IncidentTrash' });
};

// filter, sort, paginate
const filteredIncidents = computed(() => {
  const list = incidents.value || [];
  if (!searchTerm.value) return list;
  const q = searchTerm.value.toLowerCase();
  return list.filter(
    (incident) =>
      String(incident.id).includes(q) ||
      incident.full_name?.toLowerCase().includes(q) ||
      incident.location?.toLowerCase().includes(q) ||
      incident.specific_offense?.toLowerCase().includes(q) ||
      incident.status?.toLowerCase().includes(q)
  );
});

const sortedIncidents = computed(() => {
  const list = Array.isArray(filteredIncidents.value)
    ? [...filteredIncidents.value]
    : [];
  if (!sortBy.value || list.length === 0) return list;

  list.sort((a, b) => {
    const aValue = a[sortBy.value];
    const bValue = b[sortBy.value];
    const comparison = String(aValue || '').localeCompare(String(bValue || ''));
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
  return list;
});

const paginatedIncidents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedIncidents.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(sortedIncidents.value.length / itemsPerPage.value || 1)
);

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};
const nextPage = () => goToPage(currentPage.value + 1);
const prevPage = () => goToPage(currentPage.value - 1);

const toggleSort = (column) => {
  if (sortBy.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = column;
    sortDirection.value = 'desc';
  }
  currentPage.value = 1;
};

const getSortIcon = (column) => {
  if (sortBy.value !== column) return '';
  return sortDirection.value === 'asc' ? '▲' : '▼';
};

const getStatusClasses = (status) => {
  switch (status) {
    case 'Resolved':
      return {
        backgroundColor: '#d4edda',
        color: '#155724',
        borderColor: '#c3e6cb',
      };
    case 'Investigation':
      return {
        backgroundColor: '#cce5ff',
        color: '#004085',
        borderColor: '#b8daff',
      };
    case 'Closed':
    case 'Pending':
    default:
      return {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderColor: '#f5c6cb',
      };
  }
};

const formatDate = (dateString, timeString) => {
  if (!dateString) return 'N/A';
  try {
    const timePart = timeString ? timeString.slice(0, 5) : '00:00';
    const date = new Date(`${dateString}T${timePart}:00`);
    if (isNaN(date)) {
      const fallback = new Date(`${dateString} ${timePart}`);
      if (isNaN(fallback)) return 'N/A';
      return (
        fallback.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) +
        ' ' +
        fallback.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }
    return (
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) +
      ' ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  } catch {
    return 'N/A';
  }
};

onMounted(fetchIncidents);
</script>

<template>
  <AdminNavbar>
    <div class="incident-page">
      <!-- success notifier -->
      <transition name="status-bar">
        <div v-if="showStatusBar" class="status-bar">
          <div class="status-bar__inner">
            {{ statusMessage }}
          </div>
        </div>
      </transition>

      <!-- Top header bar -->
      <header class="incident-header">
        <div class="incident-header__left">
          <h1>INCIDENT REPORTS</h1>
          <p>Manage all filed student misconduct reports and track their status.</p>
        </div>
        <div class="incident-header__right">
          <div class="incident-header__stats">
            <span class="incident-header__stats-label">TOTAL REPORTS</span>
            <span class="incident-header__stats-value">{{ incidents.length }}</span>
          </div>
        </div>
      </header>

      <!-- Search + Trash row -->
      <section class="incident-controls">
        <div class="incident-controls__search">
          <span class="incident-controls__search-icon">
            <v-icon name="bi-search" scale="1" />
          </span>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by ID, Name, or Offense..."
          />
        </div>

        <button
          class="incident-controls__trash"
          @click="handleViewTrash"
        >
          <v-icon name="md-restorefromtrash-twotone" scale="1.1" />
          <span>TRASH VIEW</span>
        </button>
      </section>

      <!-- Body -->
      <section class="incident-body">
        <div v-if="isLoading" class="incident-loading">
          <span class="spinner"></span>
          Loading incident reports...
        </div>

        <div
          v-else-if="error"
          class="incident-error"
        >
          <p class="incident-error__title">Message:</p>
          <p>{{ error }}</p>
        </div>

        <div v-else-if="incidents.length === 0" class="incident-empty">
          <h3>No Incident Reports Found</h3>
          <p>The incident database is currently empty.</p>
        </div>

        <!-- Table card -->
        <div v-else class="incident-table-card">
          <div class="incident-table-card__inner">
            <table class="incident-table">
              <thead>
                <tr>
                  <th @click="toggleSort('full_name')">
                    STUDENT NAME {{ getSortIcon('full_name') }}
                  </th>
                  <th @click="toggleSort('specific_offense')">
                    OFFENSE {{ getSortIcon('specific_offense') }}
                  </th>
                  <th @click="toggleSort('date_of_incident')">
                    DATE AND TIME {{ getSortIcon('date_of_incident') }}
                  </th>
                  <th>STATUS</th>
                  <th class="actions-header">ACTIONS</th>
                </tr>
              </thead>
                <tbody>
                <tr
                    v-for="incident in paginatedIncidents"
                    :key="incident.id"
                >
            <td class="cell--strong">
            {{ incident.full_name }}
            </td>
            <td>
            <div class="offense-main">{{ incident.specific_offense }}</div>
            <div class="offense-sub">({{ incident.offense_category }})</div>
            </td>
            <td>
            {{ formatDate(incident.date_of_incident, incident.time_of_incident) }}
            </td>
            <td>
            <select
                :value="incident.status"
                @change="updateIncidentStatus(incident, $event.target.value)"
                :style="{
                ...getStatusClasses(incident.status),
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid',
                cursor: 'pointer',
                backgroundClip: 'padding-box'
                }"
            >
                <option
                v-for="status in statusOptions"
                :key="status"
                :value="status"
                >
                {{ status }}
                </option>
            </select>
            </td>
            <td>
            <div class="incident-actions">
                <button
                class="btn-action btn-action--view"
                @click="handleView(incident)"
                >
                View
                </button>
                <button
                class="btn-action btn-action--edit"
                @click="handleEdit(incident)"
                >
                Edit
                </button>
            </div>
            </td>
        </tr>

        <tr v-if="incidents.length > 0 && paginatedIncidents.length === 0">
            <td colspan="5" class="incident-no-results">
            No results found for "{{ searchTerm }}" on this page.
            </td>
        </tr>
        </tbody>
        </table>
        </div>

        <!-- pagination -->
        <div v-if="totalPages > 1" class="incident-pagination">
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

<style scoped>
.incident-page {
  min-height: 100vh;
  padding: 24px;
  background-color: #74a765;
  box-sizing: border-box;
}

/* Top header bar */
.incident-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #e1f3d5;
  border-radius: 16px;
  padding: 16px 24px;
  color: #0b3a23;
  margin-bottom: 16px;
}

.incident-header__left h1 {
  margin: 0 0 4px;
  font-size: 1.5rem;
  font-weight: 800;
}

.incident-header__left p {
  margin: 0;
  font-size: 0.85rem;
}

.incident-header__right {
  display: flex;
  align-items: center;
}

.incident-header__stats {
  background-color: #e5f2dd;
  border-radius: 16px;
  padding: 8px 18px;
  text-align: right;
}

.incident-header__stats-label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.incident-header__stats-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 800;
}

/* Search + trash row */
.incident-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.incident-controls__search {
  flex: 1;
  position: relative;
  background-color: #dfead6;
  border-radius: 999px;
  padding: 4px 14px;
}

.incident-controls__search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  opacity: 0.6;
}

.incident-controls__search input {
  width: 100%;
  border: none;
  outline: none;
  border-radius: 999px;
  padding: 8px 10px 8px 32px;
  font-size: 0.85rem;
  background: transparent;
}

.incident-controls__trash {
  border: none;
  border-radius: 999px;
  padding: 10px 22px;
  background-color: #ff6b6b;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* Body area */
.incident-body {
  margin-top: 4px;
}

/* States */
.incident-loading,
.incident-empty {
  text-align: center;
  padding: 32px;
  background-color: #f2f8ea;
  border-radius: 16px;
}

.spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 3px solid rgba(11, 58, 35, 0.2);
  border-top-color: #0b3a23;
  animation: spin 1s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}

.incident-error {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.incident-error__title {
  margin: 0 0 4px;
  font-weight: 700;
}

/* Table card */
.incident-table-card {
  background-color: #2d5c32;
  border-radius: 22px;
  padding: 12px;
}

.incident-table-card__inner {
  background-color: #dbeed3;
  border-radius: 18px;
  padding: 10px;
  overflow-x: auto;
}

/* Table & alignment */
.incident-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  min-width: 800px;
}

.incident-table thead {
  background-color: #0c3d24;
  color: #ffffff;
}

.incident-table th {
  padding: 10px 16px;
  font-size: 0.75rem;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
}

.actions-header {
  text-align: center;
}

/* ACTIONS column: same width, centered */
.incident-table th:last-child,
.incident-table td:last-child {
  width: 120px;
  text-align: center;
  padding-left: 0;
  padding-right: 0;
}

.incident-table tbody tr:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.3);
}
.incident-table tbody tr:nth-child(odd) {
  background-color: rgba(255, 255, 255, 0.15);
}

.incident-table td {
  padding: 10px 16px;
  font-size: 0.85rem;
  border-bottom: 1px solid rgba(12, 61, 36, 0.2);
}

.cell--strong {
  font-weight: 700;
  color: #0b3a23;
}

.offense-main {
  font-weight: 600;
  color: #1f2933;
}

.offense-sub {
  font-size: 0.7rem;
  color: #4b5563;
}

.incident-no-results {
  text-align: center;
  font-style: italic;
  padding: 16px;
}

/* Actions column: flex row centered */
.incident-actions {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.btn-action {
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  min-width: 52px;
  text-align: center;
  line-height: 1.2;
}

.btn-action--view {
  background-color: #93c5fd;
  color: #0b3a23;
}

.btn-action--edit {
  background-color: #facc15;
  color: #0b3a23;
}

/* Pagination */
.incident-pagination {
  margin-top: 10px;
  padding: 8px 14px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  background-color: #f2f8ea;
  border-radius: 10px;
}

.incident-pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background-color: #0b3a23;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 600;
}

.incident-pagination button:disabled {
  background-color: #cbd5e1;
  color: #64748b;
  cursor: not-allowed;
}

.incident-pagination span {
  font-size: 0.85rem;
  color: #0b3a23;
}

/* Status success bar */
.status-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.status-bar__inner {
  max-width: 900px;
  width: 100%;
  background-color: #003b23;
  border-radius: 28px;
  padding: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
}

/* inner light pill */
.status-bar__inner {
  box-sizing: border-box;
}

.status-bar__inner {
  background-color: #003b23;
}

.status-bar__inner > div,
.status-bar__inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-bar__inner {
  padding: 6px;
}

/* use a nested pill look just via padding + bg */
.status-bar__inner {
  background-color: #003b23;
}

.status-bar__inner::before {
  content: '';
}

/* actual visible area */
.status-bar__inner {
  background-color: #003b23;
}

.status-bar__inner {
  padding: 6px;
}

.status-bar__inner {
  background-color: #003b23;
}

/* final pill */
.status-bar__inner {
  background-color: #e9f8e4;
  color: #000;
  font-weight: 700;
  font-size: 1rem;
  border-radius: 20px;
  box-shadow: inset 0 0 0 4px #003b23;
}

/* transition for showing/hiding bar */
.status-bar-enter-active,
.status-bar-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.status-bar-enter-from,
.status-bar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
