<template>
  
  <div :style="adminDashboardStyle">
    
    <AdminNavbar /> 
    
    <h1 :style="mainTitleStyle">STUDENT MISCONDUCT REPORT MANAGEMENT</h1>

    <section :style="quickStatsGridStyle">
      <div :style="getStatMainStyle(true)">
        <div :style="statValueStyle">{{ stats.students }}</div>
        <div :style="statLabelStyle">{{ getStatLabelText('TOTAL STUDENTS') }}</div>
      </div>
      
      <div :style="getStatMainStyle(false)">
        <div :style="statValueStyle">{{ stats.reports }}</div>
        <div :style="statLabelStyle">{{ getStatLabelText('TOTAL REPORTS FILED') }}</div>
      </div>

      <div :style="statusRowStyle">
        <div :style="getStatStatusStyle('#95d2b7')">
          <div :style="statValueSmStyle">{{ stats.pending }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('PENDING') }}</div>
        </div>
        
        <div :style="getStatStatusStyle('#95d2b7')">
          <div :style="statValueSmStyle">{{ stats.underReview }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('UNDER REVIEW') }}</div>
        </div>
        
        <div :style="getStatStatusStyle('#95d2b7')">
          <div :style="statValueSmStyle">{{ stats.resolved }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('RESOLVED') }}</div>
        </div>

        <div :style="getStatStatusStyle('#95d2b7')">
          <div :style="statValueSmStyle">{{ stats.closed }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('CLOSED') }}</div>
        </div>
      </div>
      
    </section>
    
    <footer :style="footerStyle">
      <button :style="logoutButtonStyle" @click="logout">Logout</button>
    </footer>
    
  </div>
</template>

<script>
import api from '@/services/api'; 
// CORRECTED IMPORT PATH: Use '../../' to go up to src/ and then down to navbar/
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';

export default {
    name: 'AdminDashboard',
    components: {
      AdminNavbar
    },
    data() {
        return {
            userName: this.getUserName(),
            stats: {
                students: '2',
                reports: '4',
                pending: '1',
                underReview: '1',
                resolved: '1',
                closed: '1'
            },
            isStatsLoading: false,
        }
    },
    methods: {
        getStatMainStyle(isStudents) {
            return {
                width: '100%',
                height: '130px',
                background: '#1d3e21',
                color: '#f8fff8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                padding: '20px',
                ...(isStudents ? { marginRight: '10px' } : { marginLeft: '10px' }),
            };
        },
        getStatStatusStyle(color) {
            return {
                width: 'calc(25% - 10px)',
                padding: '10px 5px',
                background: color,
                color: '#1d3e21',
                fontWeight: 'bold',
                borderRadius: '5px',
                textAlign: 'center',
                fontSize: '1.1rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            };
        },
        getStatLabelText(label) {
            return label;
        },
        
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
                const response = await api.get('/admin/stats'); 
                
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
        this.fetchAdminStats();
    },
    computed: {
        adminDashboardStyle() {
            return {
                padding: '0', 
                fontFamily: 'Arial, sans-serif',
                minHeight: '100vh',
                backgroundColor: '#e6f0e7',
            };
        },
        mainTitleStyle() {
            return {
                textAlign: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#1d3e21',
                margin: '40px 0 30px 0',
                textTransform: 'uppercase',
            };
        },
        quickStatsGridStyle() {
            return {
                maxWidth: '900px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            };
        },
        statValueStyle() {
            return {
                fontSize: '3.5rem',
                fontWeight: '900',
                lineHeight: '1',
            };
        },
        statLabelStyle() {
            return {
                marginTop: '10px',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            };
        },
        statusRowStyle() {
            return {
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '20px 0',
                marginTop: '10px',
                transform: 'translateY(-10px)',
            };
        },
        statValueSmStyle() {
            return {
                fontSize: '1.2rem',
                fontWeight: '900',
                lineHeight: '1',
                marginBottom: '5px',
                color: '#1d3e21'
            };
        },
        statLabelSmStyle() {
            return {
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#1d3e21',
            };
        },
        footerStyle() {
            return {
                textAlign: 'center',
                marginTop: '40px',
            };
        },
        logoutButtonStyle() {
            return {
                padding: '10px 20px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
            };
        },
    }
}
</script>

<style scoped>
/* Scoped CSS is empty as all styling is handled via computed properties */
</style>