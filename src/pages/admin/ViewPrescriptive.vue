<template>
  <AdminNavbar>
    <div :style="wrapperStyle">
      <div :style="innerStyle">

        <div :style="headerStyle">INCIDENT DETAIL</div>

        <div :style="cardStyle">
          <h2 style="text-align:center; font-size:1.6rem; font-weight:800; color:#09321d;">
            Incident Report #{{ route.params.id }}
          </h2>

          <p style="text-align:center; color:#6b7280; margin-bottom:30px; font-size:0.95rem;">
            Review the complete details of this misconduct report.
          </p>

          <div v-if="isLoading" style="text-align:center; padding:50px; background:#f9fafb; border-radius:12px;">
            <svg class="animate-spin" width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.75V6.25" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M17.125 6.875L16.0625 7.9375" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M19.25 12H17.75" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M17.125 17.125L16.0625 16.0625" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M12 17.75V19.25" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M6.875 17.125L7.9375 16.0625" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M4.75 12H6.25" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M6.875 6.875L7.9375 7.9375" stroke="gray" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p style="margin-top:10px; color:#4b5563;">Loading incident details…</p>
          </div>

          <div v-else-if="error" :style="errorBoxStyle">{{ error }}</div>

          <template v-else>
            <div :style="sectionBoxStyle">
              <h3 :style="sectionTitleStyle">Summary</h3>
              <div :style="rowStyle">
                <span :style="labelStyle">Status:</span>
                <span><span :style="statusTagStyle(incident.status)">{{ incident.status }}</span></span>
              </div>
            </div>

            <div :style="sectionBoxStyle">
              <h3 :style="sectionTitleStyle">Student Information</h3>
              <div v-if="incident.full_name && incident.full_name !== 'N/A'">
                <div :style="rowStyle"><span :style="labelStyle">Full Name:</span>
                  <span :style="valueStyle">{{ incident.full_name }}</span></div>

                <div :style="rowStyle"><span :style="labelStyle">Student ID:</span>
                  <span :style="valueStyle">{{ incident.student_id }}</span></div>

                <div :style="rowStyle"><span :style="labelStyle">Program / Year:</span>
                  <span :style="valueStyle">{{ incident.program || 'N/A' }} (Year {{ incident.year_level || 'N/A' }})</span></div>
              </div>
              <p v-else style="color:#b91c1c; font-style:italic;">Student record not available or was deleted.</p>
            </div>

            <div :style="sectionBoxStyle">
              <h3 :style="sectionTitleStyle">Incident Details</h3>

              <div :style="rowStyle"><span :style="labelStyle">Date of Incident:</span>
                <span :style="valueStyle">{{ formatDate(incident.date_of_incident) }}</span></div>
              
              <div :style="rowStyle"><span :style="labelStyle">Time of Incident:</span>
                <span :style="valueStyle">{{ formatTime(incident.time_of_incident) }}</span></div>

              <div :style="rowStyle"><span :style="labelStyle">Location:</span>
                <span :style="valueStyle">{{ incident.location || 'N/A' }}</span></div>

              <div :style="rowStyle"><span :style="labelStyle">Offense Category:</span>
                <span :style="valueStyle">{{ incident.offenseCategory || 'N/A' }}</span></div>

              <div :style="rowStyle"><span :style="labelStyle">Specific Offense:</span>
                <span :style="valueStyle">{{ incident.specificOffense || 'N/A' }}</span></div>

              <div style="margin-top:20px; padding-top:10px; border-top:1px dashed #e5e7eb;">
                <span :style="labelStyle">Detailed Description:</span>
                <div :style="valueStyle" style="white-space: pre-wrap; margin-top:5px; padding:10px; border:1px solid #f3f4f6; background:#fafafa; border-radius:8px;">
                  {{ incident.description || 'No detailed description provided.' }}
                </div>
              </div>
            </div>

            <div :style="sectionBoxStyle">
              <h3 :style="sectionTitleStyle">Resolution</h3>

              <div :style="rowStyle">
                <span :style="labelStyle">Recommendation:</span>
                <span :style="valueStyle">{{ incident.recommendation || 'No recommendation submitted.' }}</span>
              </div>

              <div :style="rowStyle">
                <span :style="labelStyle">Action Taken:</span>
                <span :style="valueStyle">{{ incident.actionTaken || 'N/A' }}</span>
              </div>
            </div>

            <div style="text-align:right; margin-top:25px;">
              <button @click="router.go(-1)"
                style="padding:10px 20px; border-radius:8px; border:1px solid #ccc; background:white; cursor:pointer; margin-right:10px; font-weight:600; transition: background 0.2s;">
                ← Back
              </button>

              <button
                @click="router.push({ name: 'EditIncident', params: { id: incident.id } })"
                style="padding:10px 20px; border-radius:8px; background:#14532d; color:white; border:none; cursor:pointer; font-weight:600; transition: background 0.2s;">
                Edit Report
              </button>
            </div>

          </template>
        </div>
      </div>
    </div>
  </AdminNavbar>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import formBg from '@/assets/FORMBACKGROUND.jpg';

const route = useRoute();
const router = useRouter();

const incident = ref(null);
const isLoading = ref(true);
const error = ref(null);

/* --- FIXED + CLEANER STYLES (Ensured no illegal spaces in object definitions) --- */
const wrapperStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '20px'
};

const innerStyle = {
  padding: '40px',
  borderRadius: '25px',
  backgroundImage: `url(${formBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 4px 25px rgba(0,0,0,0.3)',
  position: 'relative'
};

const headerStyle = {
  position: 'absolute',
  top: '-18px',
  left: '20px',
  background: '#fff',
  padding: '10px 28px',
  borderRadius: '999px',
  fontWeight: '800',
  fontSize: '1rem',
  letterSpacing: '0.5px',
  color: '#09321d',
  boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
};

const cardStyle = {
  background: 'rgba(255,255,255,0.95)',
  borderRadius: '20px',
  padding: '40px',
  marginTop: '20px',
  boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
};

const sectionBoxStyle = {
  background: '#ffffff',
  padding: '25px',
  borderRadius: '16px',
  marginBottom: '20px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const sectionTitleStyle = {
  fontSize: '1.3rem',
  fontWeight: '800',
  marginBottom: '15px',
  color: '#0c4a2e',
  borderBottom: '2px solid #e5e7eb',
  paddingBottom: '8px'
};

const rowStyle = {
  display: 'flex',
  marginBottom: '10px',
  alignItems: 'baseline'
};

const labelStyle = {
  width: '35%',
  minWidth: '180px',
  fontWeight: '700',
  color: '#4b5563'
};

const valueStyle = {
  flex: 1,
  color: '#111827'
};

const errorBoxStyle = {
  background: '#fef2f2',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #fca5a5',
  color: '#b91c1c'
};

/* Status Tag */
const statusTagStyle = (status) => {
  let base = {
    padding: '6px 14px',
    borderRadius: '999px',
    fontSize: '0.9rem',
    fontWeight: '700',
    display: 'inline-block',
    border: '1px solid',
    textTransform: 'uppercase'
  };
  switch (status) {
    case 'Resolved':
    case 'Closed':
      return { ...base, background: '#d1fae5', color: '#065f46', borderColor: '#a7f3d0' };
    case 'Under Review':
    case 'Investigation':
      return { ...base, background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe' };
    case 'Pending':
    default:
      return { ...base, background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' };
  }
};

/* Fetch */
const fetchIncident = async () => {
  try {
    const res = await api.get(`/incidents/${route.params.id}`);
    incident.value = res.data.incident;
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load incident. Please check the ID or try again.';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    const includesTime = d.includes('T') || d.includes(':'); 
    
    const options = {
      year: 'numeric', month: 'short', day: 'numeric',
    };
    
    if (includesTime) {
         options.hour = '2-digit';
         options.minute = '2-digit';
         options.hour12 = true;
    }
    
    return date.toLocaleString('en-US', options);
  } catch { return 'N/A'; }
};

const formatTime = (t) => {
    if (!t) return 'N/A';
    try {
        const [hours, minutes] = t.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    } catch {
        return t;
    }
}

onMounted(fetchIncident);
</script>