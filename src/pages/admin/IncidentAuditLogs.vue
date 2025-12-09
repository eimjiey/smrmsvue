<template>
  <AdminLayout>
    <div class="incident-audit-logs-page">
      <div class="header-design">
        <div class="header-content-wrapper">
          
          <div class="header-title-group">
            <h1 class="header-title">INCIDENT AUDIT LOGS</h1>
            <p class="header-description-inline">
              This log tracks all significant changes
            </p>
          </div>
          
          <button @click="$router.push({ name: 'AdminProfile' })" class="back-button">
            ← BACK TO PROFILE
          </button>
        </div>
      </div>
      
      <div class="logs-content-box">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          Loading audit logs...
        </div>

        <div v-else-if="errorMessage" class="error-state">
          <p>⚠️ Error loading logs: <strong>{{ errorMessage }}</strong></p>
        </div>

        <div v-else-if="logs.length === 0" class="empty-state">
          <p>No audit log entries found.</p>
        </div>

        <div v-else class="logs-container">
          <table>
            <thead>
              <tr>
                <th>INCIDENT #</th>
                <th>ACTION TYPE</th>
                <th>FIELD</th>
                <th>OLD VALUE</th>
                <th>NEW VALUE</th>
                <th>CHANGED AT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td>
                  <router-link :to="`/reports/${log.incident_id}`" class="incident-link">
                    #{{ log.incident_id }}
                  </router-link>
                </td>
                <td>
                  <span :class="['action-tag', `action-tag--${log.action_type.toLowerCase()}`]">
                    {{ log.action_type }}
                  </span>
                </td>
                <td>{{ log.field_changed }}</td>
                <td><pre class="log-value">{{ log.old_value || 'NULL' }}</pre></td>
                <td><pre class="log-value">{{ log.new_value || 'NULL' }}</pre></td>
                <td>{{ formatDate(log.changed_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api'; 
import AdminLayout from '@/pages/navbar/AdminNavbar.vue'; // Adjust path if needed

const logs = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);

const fetchLogs = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const response = await api.get('/admin/audit-logs'); 
    logs.value = response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    errorMessage.value = error.response?.data?.message || 'A network error occurred.';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

onMounted(fetchLogs);
</script>

<style scoped>
/* --- Structure and Design --- */

.incident-audit-logs-page {
  background-color: #e7ffe7;
  border: 4px solid #05301a;
  border-radius: 8px;
  overflow: hidden; 
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0;
}

.header-design {
  background-color: #145e3c;
  padding: 15px 25px;
  color: white; 
  border-bottom: 2px solid #05301a; 
}

/* Align Title Group (stacked) and Button (to the right) */
.header-content-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center; 
}

/* Group Title and Description: Block elements stack vertically */
.header-title-group {
    /* No flex properties needed; elements naturally stack */
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0; 
  padding: 0;
  letter-spacing: 0.05em;
  margin-bottom: 3px; /* Space below the title */
}

/* Description Style: Sits directly below the title */
.header-description-inline {
  margin: 0;
  color: #c8f0c4; 
  font-size: 0.9rem;
  font-weight: 500;
}

/* Back Button Style */
.back-button {
    background-color: #05301a; 
    color: white;
    border: 1px solid #c8f0c4;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: background-color 0.2s;
    letter-spacing: 0.05em;
}

.back-button:hover {
    background-color: #004b32; 
}

.logs-content-box {
  padding: 15px 20px; 
}

/* --- State Styles --- */

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  border: 1px solid #c8f0c4;
  border-radius: 8px;
  background-color: #ffffff;
  margin-top: 10px;
}
.error-state {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* --- Table & Column Styles --- */

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  table-layout: fixed; 
}

th, td {
  border: 1px solid #ddd;
  padding: 8px 10px; 
  text-align: left;
  font-size: 0.85rem;
}

/* Column Width Optimization */
th:nth-child(1), td:nth-child(1) { /* INCIDENT # */
  width: 9%;
}
th:nth-child(2), td:nth-child(2) { /* ACTION TYPE */
  width: 9%;
}
th:nth-child(3), td:nth-child(3) { /* FIELD */
  width: 10%;
}
th:nth-child(4), td:nth-child(4) { /* OLD VALUE */
  width: 12%;
}
th:nth-child(5), td:nth-child(5) { /* NEW VALUE */
  width: 30%;
}
th:nth-child(6), td:nth-child(6) { /* CHANGED AT */
  width: 30%; 
}

/* Header Row Styling and Single-line enforcement */
th {
  background-color: #c8f0c4;
  color: #05301a;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
}


tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.incident-link {
  color: #05301a; 
  font-weight: bold;
  text-decoration: none;
}
.incident-link:hover {
  text-decoration: underline;
}

/* Log Value Scrolling (for OLD VALUE / NEW VALUE) */
.log-value {
  margin: 0;
  padding: 4px;
  font-size: 0.75rem;
  background: #fdfde0;
  border: 1px solid #eee;
  
  max-height: 80px; 
  overflow: auto; 
  
  white-space: pre-wrap; 
  word-break: break-all;
}

/* Action Tag Styling */
.action-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.7rem;
  text-transform: uppercase;
}
.action-tag--update {
  background-color: #fff3cd;
  color: #664d03;
}
.action-tag--create {
  background-color: #d1e7dd;
  color: #0a3622;
}
.action-tag--delete {
  background-color: #f8d7da;
  color: #842029;
}
</style>