<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

const router = useRouter();

// data
const trashIncidents = ref([]);
const isLoading = ref(false);
const error = ref(null);
const searchTerm = ref('');

const currentPage = ref(1);
const itemsPerPage = ref(10);

// modal state
const showConfirmModal = ref(false);
const confirmType = ref('restore'); // 'restore' | 'force'
const selectedIncident = ref(null);

// fetch trashed incidents (Laravel soft deletes)[web:8]
const fetchTrashIncidents = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await api.get('/incidents?trashed=true');
    let receivedData = response.data;
    if (receivedData && receivedData.data && Array.isArray(receivedData.data)) {
      receivedData = receivedData.data;
    }
    trashIncidents.value = Array.isArray(receivedData)
      ? receivedData.filter(i => i.deleted_at !== null)
      : [];
    currentPage.value = 1;
  } catch (err) {
    let errorMessage =
      'Could not load trash reports. Check server connectivity or Admin privileges.';
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
};

// open / close notifier
const openConfirm = (type, incident) => {
  confirmType.value = type;
  selectedIncident.value = incident;
  showConfirmModal.value = true;
};

const closeConfirm = () => {
  showConfirmModal.value = false;
  selectedIncident.value = null;
};

// YES handler (restore or force delete)[web:19]
const confirmAction = async () => {
  if (!selectedIncident.value) return;
  const incident = selectedIncident.value;

  try {
    if (confirmType.value === 'restore') {
      await api.post(`/incidents/${incident.id}/restore`);
      error.value = `✅ Incident ID ${incident.id} restored successfully.`;
    } else {
      await api.delete(`/incidents/${incident.id}/force-delete`);
      error.value = `✅ Incident ID ${incident.id} permanently deleted.`;
    }
    await fetchTrashIncidents();
  } catch (err) {
    error.value =
      confirmType.value === 'restore'
        ? `❌ Failed to restore incident ${incident.id}.`
        : `❌ Failed to permanently delete incident ${incident.id}.`;
  } finally {
    setTimeout(() => {
      error.value = null;
    }, 5000);
    closeConfirm();
  }
};

// filtering + pagination
const filteredIncidents = computed(() => {
  const list = trashIncidents.value || [];
  if (!searchTerm.value) return list;
  const lower = searchTerm.value.toLowerCase();
  return list.filter(
    incident =>
      String(incident.id).includes(lower) ||
      (incident.full_name &&
        incident.full_name.toLowerCase().includes(lower)) ||
      (incident.specific_offense &&
        incident.specific_offense.toLowerCase().includes(lower)),
  );
});

const paginatedIncidents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredIncidents.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(
  () => Math.ceil(filteredIncidents.value.length / itemsPerPage.value),
);

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const goToPage = page => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// PAGE‑LEVEL DESIGN (matches screenshot)
const pageStyle = {
  maxWidth: '100%',
  minHeight: '100vh',
  margin: '0',
  padding: '20px 32px 30px 32px',
  background: '#74a765;',
  boxSizing: 'border-box',
};
const headerTitleStyle = {
  fontSize: '1.6rem',
  fontWeight: '800',
  color: '#083318',
  marginBottom: '4px',
};
const headerSubtitleStyle = {
  fontSize: '0.9rem',
  color: '#0f4221',
  marginBottom: '18px',
  maxWidth: '900px',
};

// top control bar
const controlBarOuterStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#96d78b',
  borderRadius: '999px',
  padding: '6px 10px 6px 14px',
  marginBottom: '14px',
};
const searchWrapperStyle = {
  flex: 1,
  marginRight: '16px',
};
const searchInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '999px',
  border: 'none',
  outline: 'none',
  fontSize: '0.85rem',
  background: '#f5fff5',
};
const totalReportsPillStyle = {
  minWidth: '220px',
  textAlign: 'center',
  padding: '8px 14px',
  borderRadius: '999px',
  background: '#3d7b3b',
  color: '#e8ffe8',
  fontWeight: '700',
  fontSize: '0.8rem',
};

// big frame
const tableFrameOuterStyle = {
  marginTop: '10px',
  borderRadius: '24px',
  background: '#0c4924',
  padding: '10px',
};
const tableFrameInnerStyle = {
  borderRadius: '20px',
  background: '#d9f6d7',
  padding: '8px 10px 10px 10px',
  minHeight: '420px',
  boxSizing: 'border-box',
};

// header row
const headerRowBarStyle = {
  display: 'grid',
  gridTemplateColumns: '2fr 2fr 2fr 1.5fr',
  columnGap: '8px',
  padding: '8px 14px',
  borderRadius: '999px',
  background: '#c1e8b9',
  fontSize: '0.78rem',
  fontWeight: '700',
  color: '#164322',
};

// body container
const tableBodyContainerStyle = {
  marginTop: '6px',
  borderRadius: '18px',
  background: '#e5ffe4',
  padding: '8px 0',
  minHeight: '330px',
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.85rem',
};
const tableDataCellStyle = type => {
  let fontWeight = '400';
  if (type === 'name') fontWeight = '600';
  return {
    padding: '8px 14px',
    color: '#14301c',
    fontWeight,
    borderBottom: '1px solid #c7ebc0',
    whiteSpace: 'nowrap',
  };
};

// action buttons
const actionButtonStyle = danger => ({
  padding: '4px 10px',
  marginRight: '6px',
  borderRadius: '16px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: '600',
  background: danger ? '#fecaca' : '#a7e3a7',
  color: danger ? '#991b1b' : '#064e3b',
});

// misc
const loadingStyle = {
  textAlign: 'center',
  padding: '24px',
  color: '#064e3b',
  fontWeight: '600',
  fontSize: '1rem',
};
const errorBoxStyle = {
  marginTop: '10px',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid',
  background: '#fee2e2',
  fontSize: '0.85rem',
};
const noDataStyle = {
  textAlign: 'center',
  padding: '40px 20px',
};
const noDataTitleStyle = {
  fontWeight: '700',
  fontSize: '1.1rem',
  color: '#064e3b',
  marginBottom: '4px',
};
const noDataSubTitleStyle = {
  fontSize: '0.9rem',
  color: '#14532d',
};

// pagination
const paginationContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '12px',
  gap: '12px',
};
const paginationButtonStyle = disabled => ({
  padding: '6px 12px',
  borderRadius: '999px',
  border: 'none',
  color: '#ffffff',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  backgroundColor: '#14532d',
});
const paginationInfoStyle = {
  fontSize: '0.85rem',
  color: '#064e3b',
  fontWeight: '500',
};

// notifier modal
const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};
const modalBoxStyle = {
  background: '#0f5132',
  borderRadius: '18px',
  padding: '18px',
  minWidth: '320px',
  maxWidth: '420px',
};
const modalInnerStyle = {
  background: '#e6ffe6',
  borderRadius: '14px',
  padding: '24px 24px 18px 24px',
};
const modalTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: '800',
  textAlign: 'center',
  marginBottom: '4px',
};
const modalTextStyle = {
  fontSize: '0.95rem',
  fontWeight: '500',
  textAlign: 'center',
  marginBottom: '18px',
};
const modalButtonsRowStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '16px',
};
const modalBtnStyle = primary => ({
  minWidth: '110px',
  padding: '8px 16px',
  borderRadius: '999px',
  border: 'none',
  cursor: 'pointer',
  background: primary ? '#7fd37f' : '#a7e3a7',
  color: '#064e3b',
  fontWeight: '700',
  fontSize: '0.85rem',
});

onMounted(fetchTrashIncidents);
</script>

<template>
  <AdminNavbar>
    <div :style="pageStyle">
      <h1 :style="headerTitleStyle">
        RECOVER AND PERMANENTLY DELETE INCIDENT REPORTS
      </h1>
      <p :style="headerSubtitleStyle">
        Review and manage all reports that have been moved to the trash.
        Reports can be restored or permanently deleted from this section.
      </p>

      <div :style="controlBarOuterStyle">
        <div :style="searchWrapperStyle">
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Search"
            :style="searchInputStyle"
          />
        </div>
        <div :style="totalReportsPillStyle">
          RECORDS IN TRASH: {{ trashIncidents.length }}
        </div>
      </div>

      <div :style="tableFrameOuterStyle">
        <div :style="tableFrameInnerStyle">
          <div :style="headerRowBarStyle">
            <div>STUDENT NAME</div>
            <div>OFFENSE</div>
            <div>DELETE AT</div>
            <div>ACTIONS</div>
          </div>

          <div :style="tableBodyContainerStyle">
            <div v-if="isLoading" :style="loadingStyle">
              Loading deleted incident reports...
            </div>

            <div
              v-else-if="error"
              :style="{
                ...errorBoxStyle,
                color: '#991b1b',
                borderColor: '#991b1b',
              }"
            >
              {{ error }}
            </div>

            <div
              v-else-if="trashIncidents.length === 0"
              :style="noDataStyle"
            >
              <p :style="noDataTitleStyle">Trash is Empty</p>
              <p :style="noDataSubTitleStyle">
                No soft-deleted reports found.
              </p>
              <button
                @click="router.push({ name: 'AdminIncidents' })"
                :style="{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#14532d',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '15px',
                }"
              >
                Back to Active Reports
              </button>
            </div>

            <template v-else>
              <table :style="tableStyle">
                <tbody>
                  <tr v-for="incident in paginatedIncidents" :key="incident.id">
                    <td :style="tableDataCellStyle('name')">
                      {{ incident.full_name }}
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      {{ incident.specific_offense }}
                    </td>
                    <td :style="tableDataCellStyle('normal')">
                      {{ formatDate(incident.deleted_at) }}
                    </td>
                    <td :style="tableDataCellStyle('actions')">
                      <button
                        :style="actionButtonStyle(false)"
                        @click.stop="openConfirm('restore', incident)"
                      >
                        Restore
                      </button>
                      <button
                        :style="actionButtonStyle(true)"
                        @click.stop="openConfirm('force', incident)"
                      >
                        Permanently Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                v-if="totalPages > 1"
                :style="paginationContainerStyle"
              >
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1"
                  :style="paginationButtonStyle(currentPage === 1)"
                >
                  Previous
                </button>
                <span :style="paginationInfoStyle">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  :style="paginationButtonStyle(currentPage === totalPages)"
                >
                  Next
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- green notifier modal -->
    <div
      v-if="showConfirmModal"
      :style="modalOverlayStyle"
      @click.self="closeConfirm"
    >
      <div :style="modalBoxStyle">
        <div :style="modalInnerStyle">
          <template v-if="confirmType === 'force'">
            <p :style="modalTitleStyle">WARNING:</p>
            <p :style="modalTextStyle">
              Are you sure you want to PERMANENTLY DELETE?
            </p>
          </template>
          <template v-else>
            <p :style="modalTextStyle">
              Are you sure you want to RESTORE?
            </p>
          </template>

          <div :style="modalButtonsRowStyle">
            <button :style="modalBtnStyle(false)" @click="closeConfirm">
              CANCEL
            </button>
            <button :style="modalBtnStyle(true)" @click="confirmAction">
              YES
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>
