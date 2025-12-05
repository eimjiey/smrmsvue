<template>
  <AdminNavbar> 
    
    <section :style="quickStatsGridStyle">
      
      <div style="display: flex; width: 100%; gap: 20px; margin-bottom: 20px;">
        
        <div :style="getStatMainStyle()">
          <div :style="statValueStyle">{{ stats.students }}</div>
          <div :style="statLabelStyle">{{ getStatLabelText('TOTAL STUDENTS') }}</div>
        </div>
        
        <div :style="getStatMainStyle()">
          <div :style="statValueStyle">{{ stats.reports }}</div>
          <div :style="statLabelStyle">{{ getStatLabelText('TOTAL REPORTS FILED') }}</div>
        </div>
      </div>

      <div :style="statusRowStyle">
        
        <div :style="getStatStatusStyle('#f5ffec')">
          <div :style="statValueSmStyle">{{ stats.pending }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('PENDING') }}</div>
        </div>
        
        <div :style="getStatStatusStyle('#f5ffec')">
          <div :style="statValueSmStyle">{{ stats.underReview }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('UNDER REVIEW') }}</div>
        </div>
        
        <div :style="getStatStatusStyle('#f5ffec')">
          <div :style="statValueSmStyle">{{ stats.resolved }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('RESOLVED') }}</div>
        </div>

        <div :style="getStatStatusStyle('#f5ffec')">
          <div :style="statValueSmStyle">{{ stats.closed }}</div>
          <div :style="statLabelSmStyle">{{ getStatLabelText('CLOSED') }}</div>
        </div>
      </div>
      
    </section>
    
  </AdminNavbar>
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
        // FIX: Removed the unused 'isStudents' parameter to resolve the ESLint error, 
        // while preserving the original styling for the two main stat boxes.
        getStatMainStyle() { 
            return {
                // Design preserved: Dark green background, white text, large border-radius, shadow
                width: 'calc(50% - 10px)', 
                height: '130px',
                background: '#1d3e21', // Original dark green
                color: '#f8fff8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                padding: '20px',
            };
        },
        getStatStatusStyle(color) {
            return {
                // Design preserved: Lighter background, dark text, small border-radius, shadow
                width: 'calc(25% - 10px)',
                padding: '10px 5px',
                background: color, // Passed color (set to #f5ffec in template)
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
        // Styles are retained to ensure your intended design is kept.
        quickStatsGridStyle() {
            return {
                maxWidth: '100%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
            };
        },
        statValueStyle() {
            // Design preserved: Very large font size for main stats
            return {
                fontSize: '3.5rem',
                fontWeight: '900',
                lineHeight: '1',
            };
        },
        statLabelStyle() {
            // Design preserved: Small, uppercase label
            return {
                marginTop: '10px',
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
            };
        },
        statusRowStyle() {
            // Design preserved: Spacing and layout for the four smaller stats
            return {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px', 
                padding: '0', 
                marginTop: '10px',
            };
        },
        statValueSmStyle() {
            // Design preserved: Font size for status numbers
            return {
                fontSize: '1.2rem',
                fontWeight: '900',
                lineHeight: '1',
                marginBottom: '5px',
                color: '#1d3e21'
            };
        },
        statLabelSmStyle() {
            // Design preserved: Font size for status labels
            return {
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#1d3e21',
            };
        },
    }
}
</script>

<style scoped>
/* Scoped CSS is empty as all styling is handled via computed properties */
</style>