<template>
  <div class="history-page">
    <div class="hero">
      <UserNavbar />
      <h1 class="hero-title">
        STUDENT MISCONDUCT REPORT MANAGEMENT
      </h1>
    </div>

    <div class="inner-wrapper">
      <div class="inner-panel">
        <header class="history-header-bar">
          <div class="history-title-left">
            <span class="header-icon">📝</span>
            MY FILED INCIDENT REPORTS
          </div>
          <div class="history-profile-icon">
            <span class="history-profile-inner">👤</span>
          </div>
        </header>

        <div class="list-wrapper">
          <h2 class="main-title">My Incident Report History</h2>

          <p v-if="isLoading" class="msg msg-loading">
            Loading your reports... Please wait.
          </p>
          <p v-else-if="errorMessage" class="msg msg-error">
            Error fetching your reports: {{ errorMessage }}
          </p>
          <p v-else-if="reports.length === 0" class="msg msg-empty">
            You haven't filed any incident reports yet.
          </p>

          <div v-else class="table-container">
            <table class="history-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Student Reported</th>
                  <th>Misconduct Type</th>
                  <th>Date of Incident</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="report in reports"
                  :key="report.id"
                >
                  <td>{{ report.id }}</td>
                  <td>{{ report.student_name }}</td>
                  <td>{{ report.misconduct_type }}</td>
                  <td>{{ formatDateTime(report.incident_date) }}</td>
                  <td>
                    <span :class="['status-pill', statusClass(report.status)]">
                      {{ report.status }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button
                      class="btn btn-view"
                      @click="viewReportDetails(report.id)"
                    >
                      Review
                    </button>
                    <button
                      class="btn btn-delete"
                      @click="confirmDeleteReport(report.id)"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <p v-if="deleteMessage" class="msg msg-error" style="margin-top: 10px">
              {{ deleteMessage }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import UserNavbar from '@/components/UserNavbar.vue';

export default {
  name: 'UserReportHistory',
  components: { UserNavbar },
  setup() {
    const router = useRouter();
    const reports = ref([]);
    const isLoading = ref(true);
    const errorMessage = ref(null);
    const deleteMessage = ref(null);

    const fetchReports = async () => {
      isLoading.value = true;
      errorMessage.value = null;
      deleteMessage.value = null;
      try {
        // Calls GET /incidents, which the backend filters by filer_id for non-admin users.
        const response = await api.get('/incidents');
        if (response.status === 200) {
          const raw = response.data?.data || [];
          reports.value = raw.map(incident => ({
            id: incident.id,
            // These fields are expected from the IncidentController::index mapping
            student_name: incident.full_name,
            misconduct_type: incident.specific_offense,
            
            incident_date: incident.date_of_incident,
            status: incident.status || 'Pending',
          }));
        }
      } catch (error) {
        console.error('Error fetching user reports:', error);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          errorMessage.value = 'Access Denied. Please log in again.';
        } else {
          errorMessage.value = error.response?.data?.message || error.message || 'Failed to load reports.';
        }
      } finally {
        isLoading.value = false;
      }
    };

    const viewReportDetails = reportId => {
      // NOTE: Replace 'ReportDetails' with your actual route name for viewing incident details
      router.push({ name: 'ReportDetails', params: { id: reportId } });
    };

    const formatDateTime = dateString => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US');
    };

    const confirmDeleteReport = reportId => {
      deleteMessage.value = null;
      if (
        window.confirm(
          `Move report #${reportId} to trash? Only you (or an admin) can restore or permanently delete it.`
        )
      ) {
        deleteReport(reportId);
      }
    };

    const deleteReport = async reportId => {
      try {
        // Calls DELETE /incidents/{id} -> IncidentController@destroy (soft delete)
        const response = await api.delete(`/incidents/${reportId}`);
        if (response.status === 200 || response.status === 204) {
          reports.value = reports.value.filter(report => report.id !== reportId);
          deleteMessage.value = null;
          alert(`Report #${reportId} successfully moved to trash.`);
        }
      } catch (error) {
        console.error(`Error soft-deleting report #${reportId}:`, error);
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          // Use backend message (e.g., "Unauthorized to delete this incident...")
          deleteMessage.value =
            error.response.data?.message ||
            'You are not allowed to delete this report.';
        } else {
          deleteMessage.value = `Failed to delete report #${reportId}. Please try again later.`;
        }
      }
    };

    const statusClass = status => {
      if (status === 'Resolved') return 'status-resolved';
      if (status === 'Investigation' || status === 'Under Review')
        return 'status-review';
      if (status === 'Closed') return 'status-closed';
      return 'status-pending';
    };

    onMounted(fetchReports);

    return {
      reports,
      isLoading,
      errorMessage,
      deleteMessage,
      viewReportDetails,
      confirmDeleteReport,
      formatDateTime,
      statusClass,
    };
  },
};
</script>

<style scoped>
/* styles unchanged from your version */
.history-page {
  min-height: 100vh;
  background-color: #cfe9c1;
}
.hero {
  background-color: #78ae63;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  padding-bottom: 24px;
}
.hero-title {
  margin: 0;
  padding-top: 18px;
  text-align: center;
  color: #0e5821;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}
.inner-wrapper {
  padding: 32px 32px 60px;
}
.inner-panel {
  max-width: 1100px;
  margin: 0 auto;
  background-color: #78ae63;
  border-radius: 40px;
  padding: 28px 28px 36px;
}
.history-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #549a6c;
  color: #ffffff;
  border-radius: 999px;
  margin-bottom: 20px;
}
.history-title-left {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
}
.header-icon {
  margin-right: 8px;
  font-size: 1.2rem;
}
.history-profile-icon {
  background-color: #ffffff;
  border-radius: 999px;
  width: 34px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.history-profile-inner {
  font-size: 1.1rem;
  color: #549a6c;
}
.list-wrapper {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px 24px 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
.main-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 700;
  color: #1d7a31;
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #549a6c;
}
.msg {
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 8px 0 0;
}
.msg-loading {
  background-color: #fffbe6;
  border: 1px solid #ffcc00;
  color: #a07e00;
}
.msg-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
.msg-empty {
  background-color: #e9ecef;
  border: 1px solid #ccc;
  color: #6c757d;
}
.table-container {
  margin-top: 10px;
  overflow-x: auto;
}
.history-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  text-align: left;
}
.history-table thead th {
  padding: 10px 12px;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: 700;
  background-color: #1d7a31;
  color: #ffffff;
}
.history-table tbody tr {
  background-color: #f8fff8;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}
.history-table tbody tr:hover {
  background-color: #d8f1d8;
}
.history-table td {
  padding: 12px 12px;
  font-size: 0.95rem;
  color: #333333;
}
.status-pill {
  display: inline-block;
  min-width: 100px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
}
.status-resolved {
  background-color: #d4edda;
  color: #155724;
}
.status-review {
  background-color: #fff3cd;
  color: #856404;
}
.status-pending {
  background-color: #d1ecf1;
  color: #0c5460;
}
.status-closed {
  background-color: #e2e6ea;
  color: #495057;
}
.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn {
  padding: 7px 14px;
  border-radius: 4px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  color: #ffffff;
  transition: filter 0.2s;
}
.btn-view {
  background-color: #549a6c;
}
.btn-delete {
  background-color: #dc3545;
}
.btn:hover {
  filter: brightness(1.05);
}
@media (max-width: 768px) {
  .inner-wrapper {
    padding: 20px 12px 40px;
  }
  .inner-panel {
    border-radius: 24px;
    padding: 20px 16px 28px;
  }
  .list-wrapper {
    padding: 18px 14px 22px;
  }
  .history-header-bar {
    padding: 8px 14px;
  }
}
</style>