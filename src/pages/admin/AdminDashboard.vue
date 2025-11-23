<template>
    <div class="admin-dashboard">
        <header class="header">
            <h1>Admin Dashboard</h1>
            <div class="user-info">Welcome, <strong>{{ userName }}</strong></div>
        </header>

        <!-- Comprehensive Stats Section -->
        <section class="quick-stats-grid">
            
            <!-- Overall System Counts -->
            <div class="stat-main bg-blue-100 text-blue-800">
                <div class="stat-value text-blue-700">{{ stats.students }}</div>
                <div class="stat-label">Total Students</div>
            </div>
            
            <div class="stat-main bg-purple-100 text-purple-800">
                <div class="stat-value text-purple-700">{{ stats.reports }}</div>
                <div class="stat-label">Total Reports Filed</div>
            </div>

            <!-- Detailed Incident Statuses -->
            <div class="stat-status bg-red-50 text-red-700 border-red-300">
                <div class="stat-value-sm">{{ stats.pending }}</div>
                <div class="stat-label-sm">Pending</div>
            </div>
            
            <div class="stat-status bg-yellow-50 text-yellow-700 border-yellow-300">
                <div class="stat-value-sm">{{ stats.underReview }}</div>
                <div class="stat-label-sm">Under Review</div>
            </div>
            
            <div class="stat-status bg-green-50 text-green-700 border-green-300">
                <div class="stat-value-sm">{{ stats.resolved }}</div>
                <div class="stat-label-sm">Resolved</div>
            </div>

            <div class="stat-status bg-gray-50 text-gray-700 border-gray-300">
                <div class="stat-value-sm">{{ stats.closed }}</div>
                <div class="stat-label-sm">Closed</div>
            </div>

        </section>

        <section class="actions">
            <button @click="$router.push({ name: 'AdminStudents' })">Students List</button>
            <button @click="$router.push({ name: 'AdminIncidents' })">Incident Reports</button>
            <button @click="$router.push({ name: 'AddStudent' })">Add Student</button>
            <button class="danger" @click="logout">Logout</button>
        </section> 
        <footer class="footer">© {{ new Date().getFullYear() }} SMRMS</footer>
    </div>
</template>

<script>
import api from '@/services/api'; // Import your API service

export default {
    name: 'AdminDashboard',
    data() {
        return {
            userName: this.getUserName(),
            stats: {
                students: '—', 
                reports: '—',
                pending: '—',
                underReview: '—', // NEW
                resolved: '—',    // NEW
                closed: '—'       // NEW
            },
            isStatsLoading: false,
        }
    },
    methods: {
        getUserName() {
            try {
                const u = localStorage.getItem('user')
                if (u) {
                    const parsed = JSON.parse(u)
                    return parsed.name || parsed.first_name || parsed.last_name || 'Admin'
                }
            } catch (e) {
                // ignore parse errors
            }
            return 'Admin'
        },
        async fetchAdminStats() {
            this.isStatsLoading = true;
            try {
                // This call uses the '/admin/stats' route which your DashboardController handles
                const response = await api.get('/admin/stats'); 
                
                // Response data now includes all detailed status counts
                this.stats = response.data;

                localStorage.setItem('adminStats', JSON.stringify(this.stats));

            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
                this.stats = { 
                    students: 0, 
                    reports: 0, 
                    pending: 0, 
                    underReview: 0, 
                    resolved: 0, 
                    closed: 0 
                };
            } finally {
                this.isStatsLoading = false;
            }
        },
        logout() {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            this.$router.push('/login')
        }
    },
    mounted() {
        this.fetchAdminStats(); // Fetch real data when the component is mounted
    }
}
</script>

<style scoped>
.admin-dashboard { 
    max-width: 1000px; 
    margin: 32px auto; 
    padding: 20px; 
    font-family: 'Inter', Arial, Helvetica, sans-serif;
}
.header { 
    display:flex; 
    justify-content:space-between; 
    align-items:center; 
    margin-bottom:24px; 
    padding-bottom:10px; 
    border-bottom: 2px solid #e5e7eb; 
}
.header h1 { 
    margin:0; 
    color:#4338ca; 
    font-size: 2.2rem; 
}
.user-info { 
    color:#4b5563; 
    font-weight: 600; 
}

/* New Grid Layout for Stats */
.quick-stats-grid { 
    display: grid; 
    grid-template-columns: repeat(2, 1fr); 
    gap: 16px; 
    margin-bottom: 30px; 
}

/* Main Stats (Students, Total Reports) */
.stat-main {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    font-weight: 600;
}
.stat-value { 
    font-size: 3rem; 
    font-weight: 900; 
}
.stat-label { 
    margin-top: 5px; 
    font-size: 1rem; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
}

/* Status Breakdown Stats */
.stat-status {
    grid-column: span 1 / span 1; /* Default to full width on mobile, stack beneath main stats */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px 25px;
    border-radius: 10px;
    border: 1px solid;
    font-weight: 600;
}
.stat-value-sm {
    font-size: 2rem; 
    font-weight: 800;
}
.stat-label-sm {
    font-size: 0.85rem; 
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

/* Responsive adjustment */
@media (min-width: 768px) {
    /* On tablet/desktop, main stats take up 2 columns, status stats take up 1 column each */
    .quick-stats-grid { 
        grid-template-columns: repeat(4, 1fr); 
    }
    .stat-main {
        grid-column: span 2 / span 2;
    }
    .stat-status {
        grid-column: span 1 / span 1;
    }
}


.actions { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:18px }
.actions button { padding:10px 18px; border-radius:8px; border:none; font-weight: 600; cursor:pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }

.actions button:not(.danger) { 
    background:#4f46e5; 
    color:#fff; 
    border: 1px solid #4f46e5;
}
.actions button:not(.danger):hover { 
    background:#4338ca;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.actions button.danger { 
    background:#dc2626; 
    color:#fff; 
    border: 1px solid #dc2626;
}
.actions button.danger:hover { 
    background:#b91c1c; 
}
.footer { text-align:center; color:#9ca3af; margin-top:30px; font-size: 0.9rem; }
</style>