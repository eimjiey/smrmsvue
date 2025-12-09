<template>
  <AdminLayout>
    <div class="login-history-page">
      <div class="header-design">
        <div class="header-content-wrapper">
          
          <div class="header-title-group">
            <h1 class="header-title">LOGIN HISTORY</h1>
            <p class="header-description-inline">
              Tracks login attempts, including the time, status, and device information.
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
          Loading login history...
        </div>

        <div v-else-if="errorMessage" class="error-state">
          <p>⚠️ Error loading history: <strong>{{ errorMessage }}</strong></p>
        </div>

        <div v-else-if="logs.length === 0" class="empty-state">
          <p>No login records found.</p>
        </div>

        <div v-else class="logs-container">
          <table>
            <thead>
              <tr>
                <th>Attempted Email</th>
                <th>Login Time</th>
                <th>Status</th>
                <th>Device/Agent</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="log in logs" :key="log.id">
                <td>{{ log.email_attempted }}</td>
                <td>{{ formatDate(log.created_at) }}</td>
                <td>
                  <span :class="['status-tag', `status-tag--${log.status.toLowerCase()}`]">
                    {{ log.status }}
                  </span>
                </td>
                <td>
                  <code class="device-info">
                    {{ truncateString(log.device || log.user_agent) }}
                  </code>
                </td>
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

const fetchLoginHistory = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const response = await api.get('/admin/login-history');
    logs.value = response.data.data || response.data;
  } catch (error) {
    console.error("Failed to fetch login history:", error);
    errorMessage.value = error.response?.data?.message || 'A network error occurred. (Check network and server logs.)';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString(); 
};

const truncateString = (str, length = 60) => {
    if (!str) return 'N/A';
    return str.length > length ? str.substring(0, length) + '...' : str;
};


onMounted(fetchLoginHistory);
</script>

<style scoped>
/* Color Palette: Dark Green: #05301a, Mid Green: #145e3c, Light Green: #e7ffe7, Table Header: #c8f0c4 */

/* --- Container applying the Image Design --- */
.login-history-page {
  /* This container applies the overall design from the image */
  background-color: #e7ffe7; /* Very light green background */
  border: 4px solid #05301a; /* Dark green border */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0;
}

/* --- Header Section Design (Base styling) --- */
.header-design {
  background-color: #145e3c; /* Mid Green for the header background */
  padding: 15px 25px;
  color: white;
  border-bottom: 2px solid #05301a;
}

/* Flex container to align title/description left and button right */
.header-content-wrapper {
    display: flex;
    justify-content: space-between; /* Pushes content to opposite ends (LEFT and RIGHT) */
    align-items: center; /* Vertically center items */
}

/* Header Text Group (Left Side) - Block display ensures stacking */
.header-title-group {
    /* No flex properties needed here; block elements will stack naturally */
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  padding: 0;
  letter-spacing: 0.05em;
  margin-bottom: 3px; 
}

.header-description-inline {
  margin: 0;
  color: #c8f0c4;
  font-size: 0.9rem;
  font-weight: 500;
}

/* BACK BUTTON STYLES (Right Side) */
.back-button {
    background-color: #05301a; /* Darker green background */
    color: white;
    border: 1px solid #c8f0c4;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: background-color 0.2s;
    letter-spacing: 0.05em;
    flex-shrink: 0; /* Ensures the button maintains its size */
}

.back-button:hover {
    background-color: #004b32; /* Slightly darker green on hover */
}

/* --- Content Box --- */
.logs-content-box {
  padding: 15px 20px;
}


/* --- Table Styles --- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  table-layout: fixed;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px 10px;
  text-align: left;
  font-size: 0.85rem;
  word-wrap: break-word;
}

/* Column Widths */
th:nth-child(1), td:nth-child(1) { /* Attempted Email */
  width: 20%;
}
th:nth-child(2), td:nth-child(2) { /* Login Time */
  width: 15%;
}
th:nth-child(3), td:nth-child(3) { /* Status */
  width: 10%;
}
th:nth-child(4), td:nth-child(4) { /* Device/Agent */
  width: 40%;
}

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

/* Code for Device Info */
.device-info {
    background-color: #f0f0f0;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: normal; 
    display: inline-block;
}

/* Status Tags */
.status-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
}
.status-tag--success {
    background-color: #d1e7dd;
    color: #0a3622;
}
.status-tag--failed {
    background-color: #f8d7da;
    color: #842029;
}

/* Loading and Error States */
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
</style>