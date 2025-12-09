<template>
  <div class="details-page">
    <!-- Top green header like dashboard -->
    <div class="hero">
      <UserNavbar />
        <h1 class="hero-title">MISCONTRACK</h1>
        <p class="hero-subtitle">
          Providing a Smarter Approach and Secure Reporting You Can Rely On.
        </p>
    </div>

    <!-- Large rounded green panel -->
    <div class="details-wrapper">
      <div class="details-panel">
        <!-- Header bar with title + back button -->
        <header class="details-header-bar">
          <h1 class="details-header-title">Incident Report Details</h1>
          <button class="btn btn-back" @click="goBack">
            ← Back to History
          </button>
        </header>

        <!-- White inner card with content -->
        <div class="details-card">
          <p v-if="isLoading" class="msg msg-loading">
            Loading details for Incident ID: {{ reportId }}...
          </p>

          <p v-else-if="errorMessage" class="msg msg-error">
            Error: {{ errorMessage }}
          </p>

          <div v-else-if="reportDetails">
            <h2 class="details-subtitle">
              Report #{{ reportId }} – {{ reportDetails.misconduct_type }}
            </h2>
            <hr class="divider" />

            <!-- Student info -->
            <h3 class="section-title">Student Information</h3>
            <hr class="divider" />

            <div class="detail-row">
              <span class="label">Student ID:</span>
              <span class="value">{{ reportDetails.student_id }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Student Name:</span>
              <span class="value">{{ reportDetails.student_name }}</span>
            </div>

            <div class="detail-row">
              <span class="label">Program / Year Level:</span>
              <span class="value">
                {{ reportDetails.program }} -
                {{ reportDetails.year_level }}
                ({{ reportDetails.section }})
              </span>
            </div>

            <!-- Incident info -->
            <h3 class="section-title section-title-spaced">
              Incident Details
            </h3>
            <hr class="divider" />

            <div class="detail-row">
              <span class="label">Date &amp; Time:</span>
              <span class="value">
                {{ formatDateTime(reportDetails.incident_date) }}
                @ {{ reportDetails.time_of_incident }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">
                {{ reportDetails.location || 'N/A' }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">Offense Category:</span>
              <span class="value">
                {{ reportDetails.offense_category }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">Detailed Description:</span>
              <p class="description">
                {{ reportDetails.description || 'No detailed description provided.' }}
              </p>
            </div>

            <!-- Findings / resolution -->
            <h3 class="section-title section-title-spaced">
              Findings &amp; Resolution
            </h3>
            <hr class="divider" />

            <div class="detail-row">
              <span class="label">Current Status:</span>
              <span :class="['status-pill', statusClass(reportDetails.status)]">
                {{ reportDetails.status }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">System Recommendation:</span>
              <span class="value">
                {{ reportDetails.recommendation || 'N/A' }}
              </span>
            </div>

            <div class="detail-row">
              <span class="label">Final Action Taken:</span>
              <span class="value">
                {{ reportDetails.action_taken || 'Awaiting administrator resolution' }}
              </span>
            </div>

            <div class="footer-note">
              Filed by User ID: {{ reportDetails.filer_id }}
            </div>
          </div>

          <p v-else class="msg msg-empty">
            Incident report details not found.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import UserNavbar from '@/components/UserNavbar.vue';

const route = useRoute();
const router = useRouter();
const reportId = route.params.id;

const reportDetails = ref(null);
const isLoading = ref(true);
const errorMessage = ref(null);

const fetchReportDetails = async () => {
  if (!reportId) {
    errorMessage.value = 'Invalid report ID.';
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    const response = await api.get(`/incidents/${reportId}`);
    if (response.status === 200 && response.data?.incident) {
      const r = response.data.incident; // controller returns { incident: {...} }[web:144]
      reportDetails.value = {
        id: r.id,
        filer_id: r.filer_id,
        student_id: r.student_id,
        student_name: `${r.student?.first_name ?? ''} ${r.student?.last_name ?? ''}`.trim() || 'N/A',
        program: r.student?.program?.code || 'N/A',
        year_level: r.student?.year_level || 'N/A',
        section: r.student?.section || 'N/A',
        incident_date: r.date_of_incident,
        time_of_incident: r.time_of_incident,
        location: r.location,
        offense_category: r.category?.name || 'N/A',
        misconduct_type: r.offense?.name || 'N/A',
        description: r.description,
        status: r.status || 'Pending',
        recommendation: r.disciplinary_action || null, // stored in disciplinary_action
        action_taken: r.disciplinary_action || null,   // same column for now
      };
    } else {
      errorMessage.value = 'Report not found or failed to load.';
    }
  } catch (error) {
    console.error('Error fetching report details:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      errorMessage.value = 'Access denied. Please log in again.';
    } else {
      errorMessage.value = 'Failed to load report. Check network connection.';
    }
  } finally {
    isLoading.value = false;
  }
};

const formatDateTime = dateString => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }); // simple readable date[web:155]
};

const goBack = () => {
  router.go(-1);
};

const statusClass = status => {
  if (status === 'Resolved') return 'status-resolved';
  if (status === 'Investigation' || status === 'Under Review')
    return 'status-review';
  if (status === 'Closed') return 'status-closed';
  return 'status-pending';
};

onMounted(fetchReportDetails);
</script>


<style scoped>
/* Overall background like other pages */
.details-page {
  min-height: 100vh;
  background-color: #cfe9c1;
}

/* Top green strip */
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

/* Large rounded green panel */
.details-wrapper {
  padding: 32px 32px 60px;
}

.details-panel {
  max-width: 900px;
  margin: 0 auto;
  background-color: #78ae63;
  border-radius: 40px;
  padding: 28px 28px 36px;
}

/* header bar inside panel */
.details-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #549a6c;
  color: #ffffff;
  border-radius: 999px;
  margin-bottom: 20px;
}

.details-header-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

/* back button */
.btn {
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 8px 14px;
  border-radius: 4px;
  color: #ffffff;
  transition: filter 0.2s;
}

.btn-back {
  background-color: #1d7a31;
}

.btn:hover {
  filter: brightness(1.05);
}

/* white inner card */
.details-card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px 24px 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* messages */
.msg {
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
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

/* headings and sections */
.details-subtitle {
  font-size: 1.4rem;
  color: #1d7a31;
  margin: 0 0 14px;
}

.section-title {
  font-size: 1.1rem;
  color: #1d7a31;
  margin: 10px 0;
}

.section-title-spaced {
  margin-top: 26px;
}

.divider {
  border: 0.5px solid #eaf9e7;
  margin-bottom: 14px;
}

/* rows */
.detail-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eeeeee;
}

.label {
  font-weight: 700;
  color: #4caf50;
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.value {
  font-size: 1rem;
  color: #333333;
}

/* description block */
.description {
  font-size: 1rem;
  color: #555555;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
  white-space: pre-wrap;
  margin: 0;
}

/* status pill */
.status-pill {
  display: inline-block;
  min-width: 120px;
  padding: 5px 12px;
  border-radius: 18px;
  font-size: 0.85rem;
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

/* footer note */
.footer-note {
  margin-top: 24px;
  font-size: 0.85rem;
  color: #555555;
  text-align: right;
}

/* responsive */
@media (max-width: 768px) {
  .details-wrapper {
    padding: 20px 12px 40px;
  }

  .details-panel {
    border-radius: 24px;
    padding: 20px 16px 28px;
  }

  .details-header-bar {
    padding: 8px 12px;
  }

  .details-card {
    padding: 18px 14px 22px;
  }

  .hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 0;
  text-align: center;
}

.hero-hello {
  margin-top: 20px;
  font-size: 2rem;
  letter-spacing: 2px;
  color: #0e5821;
}

.hero-title {
  color: #0e5821;
  font-size: 2.4rem;
  letter-spacing: 3px;
  margin: 10px 0 10px;
  font-weight: 800;
}

.hero-subtitle {
  color: #f7fff4;
  font-size: 0.95rem;
}
}
</style>
