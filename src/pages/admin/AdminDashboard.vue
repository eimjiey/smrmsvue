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
                
                <div :style="getStatStatusStyle('#fffbe6')">
                    <div :style="statValueSmStyle">{{ stats.underReview }}</div>
                    <div :style="statLabelSmStyle">{{ getStatLabelText('UNDER REVIEW') }}</div>
                </div>
                
                <div :style="getStatStatusStyle('#e6ffe6')">
                    <div :style="statValueSmStyle">{{ stats.resolved }}</div>
                    <div :style="statLabelSmStyle">{{ getStatLabelText('RESOLVED') }}</div>
                </div>

                <div :style="getStatStatusStyle('#d1e7dd')">
                    <div :style="statValueSmStyle">{{ stats.closed }}</div>
                    <div :style="statLabelSmStyle">{{ getStatLabelText('CLOSED') }}</div>
                </div>
            </div>
            
        </section>
        
        <div style="display: flex; width: 100%; gap: 20px; margin-top: 20px;">
            
            <section :style="[chartContainerStyle, { flex: '2' }]">
                <h2 style="color: #1d3e21; margin-bottom: 10px;">Monthly Misconduct Trends</h2>
                
                <div v-if="monthlyChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :style="chartInnerStyle">
                    <MonthlyMisconductChart :chart-data="monthlyChartData" />
                </div>
                <div v-else-if="!isChartLoading" style="text-align: center; padding: 20px;">
                    No misconduct data available for the last 12 months.
                </div>
                <div v-else style="text-align: center; padding: 20px;">
                    Loading chart data...
                </div>
            </section>

            <section :style="[chartContainerStyle, { flex: '1', minWidth: '300px' }]">
                <h2 style="color: #1d3e21; margin-bottom: 10px;">Offense Type Distribution</h2>
                
                <div v-if="misconductDistributionChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :style="chartInnerStyle">
                    <SeverityBarChart :chart-data="misconductDistributionChartData" />
                </div>
                <div v-else-if="!isDistributionLoading" style="text-align: center; padding: 20px;">
                    No offense distribution data available.
                </div>
                <div v-else style="text-align: center; padding: 20px;">
                    Loading distribution data...
                </div>
            </section>
        </div>

        <div style="display: flex; width: 100%; gap: 20px; margin-top: 20px;">
            <section :style="[chartContainerStyle, { flex: '1' }]">
                <h2 style="color: #1d3e21; margin-bottom: 10px;">Specific Offense Breakdown</h2>
                
                <div v-if="specificMisconductDistributionChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :style="chartInnerStyle">
                    <SpecificOffenseBarChart :chart-data="specificMisconductDistributionChartData" />
                </div>
                <div v-else-if="!isSpecificDistributionLoading" style="text-align: center; padding: 20px;">
                    No specific offense breakdown data available.
                </div>
                <div v-else style="text-align: center; padding: 20px;">
                    Loading specific offense data...
                </div>
            </section>

            <section :style="[chartContainerStyle, { flex: '1' }]">
                <h2 style="color: #1d3e21; margin-bottom: 10px;">Misconduct Per Program/Course</h2>
                
                <div v-if="misconductPerProgramChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0" :style="chartInnerStyle">
                    <ProgramBarChart :chart-data="misconductPerProgramChartData" />
                </div>
                <div v-else-if="!isProgramLoading" style="text-align: center; padding: 20px;">
                    No misconduct data available per program/course.
                </div>
                <div v-else style="text-align: center; padding: 20px;">
                    Loading program/course data...
                </div>
            </section>
        </div>
    </AdminNavbar>
</template>

<script>
import api from '@/services/api'; 
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import MonthlyMisconductChart from '../../components/MonthlyMisconductChart.vue'; 
import SeverityBarChart from '../../components/OffenseTypeChart.vue'; 
import SpecificOffenseBarChart from '../../components/SpecificOffenseBarChart.vue'; 
import ProgramBarChart from '../../components/ProgramBarChart.vue'; // <-- NEW IMPORT

export default {
    name: 'AdminDashboard',
    components: {
        AdminNavbar,
        MonthlyMisconductChart,
        SeverityBarChart,
        SpecificOffenseBarChart,
        ProgramBarChart // <-- NEW COMPONENT REGISTRATION
    },
    data() {
        return {
            userName: 'Admin', 
            stats: {
                students: '0',
                reports: '0',
                pending: '0',
                underReview: '0',
                resolved: '0',
                closed: '0'
            },
            isStatsLoading: false,
            isChartLoading: false,
            monthlyMisconduct: [], 
            isDistributionLoading: false,
            misconductDistribution: {},
            
            // EXISTING NEW DATA PROPERTIES
            isSpecificDistributionLoading: false,
            specificMisconductDistribution: {}, 

            // NEW DATA PROPERTY FOR PROGRAM/COURSE MISCONDUCT
            isProgramLoading: false,
            misconductPerProgram: {},
        }
    },
    created() {
        this.userName = this.getUserName();
    },
    methods: {
        // ... (Existing styling methods: getStatMainStyle, getStatStatusStyle, getStatLabelText, getUserName)
        getStatMainStyle() { 
            return {
                width: 'calc(50% - 10px)', 
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
                console.error("Error parsing user from localStorage:", e);
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
        
        async fetchMonthlyMisconduct() {
            this.isChartLoading = true;
            try {
                const response = await api.get('/admin/stats/monthly-misconduct'); 
                this.monthlyMisconduct = response.data; 
            } catch (error) {
                console.error('Failed to fetch monthly misconduct data:', error);
                this.monthlyMisconduct = []; 
            } finally {
                this.isChartLoading = false;
            }
        },
        
        async fetchMisconductDistribution() {
            this.isDistributionLoading = true;
            try {
                const response = await api.get('/admin/stats/misconduct-distribution'); 
                this.misconductDistribution = response.data;
            } catch (error) {
                console.error('Failed to fetch misconduct distribution:', error);
                this.misconductDistribution = {}; 
            } finally {
                this.isDistributionLoading = false;
            }
        },
        
        async fetchSpecificMisconductDistribution() {
            this.isSpecificDistributionLoading = true;
            try {
                const response = await api.get('/admin/stats/specific-misconduct-distribution'); 
                this.specificMisconductDistribution = response.data;
            } catch (error) {
                console.error('Failed to fetch specific misconduct distribution:', error);
                this.specificMisconductDistribution = {}; 
            } finally {
                this.isSpecificDistributionLoading = false;
            }
        },

        // NEW METHOD: Fetch misconduct counts grouped by Program/Course
        async fetchMisconductPerProgram() {
            this.isProgramLoading = true;
            try {
                const response = await api.get('/admin/stats/misconduct-per-program'); 
                this.misconductPerProgram = response.data;
            } catch (error) {
                console.error('Failed to fetch misconduct per program:', error);
                this.misconductPerProgram = {}; 
            } finally {
                this.isProgramLoading = false;
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
        this.fetchMonthlyMisconduct();
        this.fetchMisconductDistribution();
        this.fetchSpecificMisconductDistribution(); 
        this.fetchMisconductPerProgram(); // <-- NEW CALL
    },
    computed: {
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
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px', 
                padding: '0', 
                marginTop: '10px',
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
        chartContainerStyle() {
            return {
                maxWidth: '100%',
                padding: '20px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            };
        },
        chartInnerStyle() {
            return {
                height: '300px', 
                width: '100%',
            };
        },
        monthlyChartData() {
            const labels = this.monthlyMisconduct.map(item => item.month_label);
            const data = this.monthlyMisconduct.map(item => item.count);
            
            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Incidents Reported',
                        data: data,
                        backgroundColor: 'rgba(77, 124, 82, 0.8)', 
                        borderColor: '#1d3e21',
                        borderWidth: 1,
                    }
                ]
            };
        },
        misconductDistributionChartData() {
            const labels = Object.keys(this.misconductDistribution); 
            const data = Object.values(this.misconductDistribution);
            
            const severityColors = {
                'minor': 'rgba(121, 196, 70, 0.9)', 
                'moderate': 'rgba(255, 193, 7, 0.9)', 
                'severe': 'rgba(253, 126, 20, 0.9)', 
                'critical': 'rgba(220, 53, 69, 0.9)',
                'major': 'rgba(220, 53, 69, 0.9)',
                'default': 'rgba(77, 124, 82, 0.9)'
            };

            const barColors = labels.map(label => {
                const lowerLabel = label.toLowerCase();
                if (lowerLabel.includes('minor')) return severityColors.minor;
                if (lowerLabel.includes('moderate')) return severityColors.moderate;
                if (lowerLabel.includes('severe')) return severityColors.severe;
                if (lowerLabel.includes('critical')) return severityColors.critical;
                if (lowerLabel.includes('major')) return severityColors.major;
                return severityColors.default;
            });

            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Category Count',
                        data: data,
                        backgroundColor: barColors, 
                        borderColor: '#1d3e21',
                        borderWidth: 1,
                    }
                ]
            };
        },
        
        // EXISTING COMPUTED PROPERTY FOR SPECIFIC OFFENSE CHART
        specificMisconductDistributionChartData() {
            const labels = Object.keys(this.specificMisconductDistribution); 
            const data = Object.values(this.specificMisconductDistribution);
            
            const chartColors = [
                '#4dc0b5', // Teal
                '#6cb2eb', // Blue
                '#ffed4a', // Yellow
                '#f6993f', // Orange
                '#eb6b95', // Pink
                '#b8c2cc'  // Default Gray
            ];

            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Specific Offense Count',
                        data: data,
                        backgroundColor: data.map((_, index) => chartColors[index % chartColors.length]), 
                        borderColor: '#1d3e21',
                        borderWidth: 1,
                    }
                ]
            };
        },

        // NEW COMPUTED PROPERTY: Misconduct per Program/Course
        misconductPerProgramChartData() {
            const labels = Object.keys(this.misconductPerProgram); 
            const data = Object.values(this.misconductPerProgram);
            
            // Define a dedicated color scheme for this chart
            const chartColors = [
                'rgba(46, 134, 193, 0.8)', // Blue
                'rgba(241, 196, 15, 0.8)', // Yellow
                'rgba(39, 174, 96, 0.8)',  // Green
                'rgba(231, 76, 60, 0.8)',  // Red
                'rgba(155, 89, 182, 0.8)', // Purple
                'rgba(52, 73, 94, 0.8)',   // Dark Blue
            ];

            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Incidents per Program/Course',
                        data: data,
                        backgroundColor: data.map((_, index) => chartColors[index % chartColors.length]), 
                        borderColor: '#1d3e21',
                        borderWidth: 1,
                    }
                ]
            };
        }
    }
}
</script>

<style scoped>
/* Scoped CSS remains empty as all styling is handled via computed properties/inline styles */
</style>