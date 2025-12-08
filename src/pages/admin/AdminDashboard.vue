<template>
  <AdminNavbar>
    <div :style="pageStyle">
      <!-- HEADER + TOP CARDS -->
      <section :style="headerRowStyle">
  <!-- HELLO, ADMIN! on the left -->
  <div :style="helloBoxStyle">
    <h1 :style="helloTitleStyle">HELLO, ADMIN!</h1>
    <p :style="helloTextStyle">
      A safer, fairer, and more transparent approach to handling student misconduct.
    </p>
  </div>

  <!-- TOTAL STUDENTS / REPORTS on the right -->
  <div :style="topStatRowStyle">
    <div :style="topStatCardStyle">
      <span :style="topStatLabelStyle">TOTAL STUDENTS</span>
      <span :style="topStatValueStyle">{{ stats.students }}</span>
    </div>

    <div :style="topStatCardStyle">
      <span :style="topStatLabelStyle">TOTAL REPORTS FILED</span>
      <span :style="topStatValueStyle">{{ stats.reports }}</span>
    </div>
  </div>
</section>

      <!-- STATUS PILLS -->
      <section :style="statusStripStyle">
        <div :style="statusCardStyle">
          <span :style="statusLabelStyle">PENDING</span>
          <span :style="statusValueBoxStyle">{{ stats.pending }}</span>
        </div>

        <div :style="statusCardStyle">
          <span :style="statusLabelStyle">INVESTIGATION</span>
          <span :style="statusValueBoxStyle">{{ stats.underReview }}</span>
        </div>

        <div :style="statusCardStyle">
          <span :style="statusLabelStyle">RESOLVED</span>
          <span :style="statusValueBoxStyle">{{ stats.resolved }}</span>
        </div>

        <div :style="statusCardStyle">
          <span :style="statusLabelStyle">CLOSED</span>
          <span :style="statusValueBoxStyle">{{ stats.closed }}</span>
        </div>
      </section>

      <!-- OVERVIEW TEXT STRIP -->
      <section :style="overviewStripStyle">
        <h2 :style="overviewTitleStyle">
          MANAGEMENT OVERVIEW &amp; REPORT ANALYTICS
        </h2>
        <p :style="overviewTextStyle">
          Quickly monitor report statuses and identify monthly incident trends.
        </p>
      </section>

      <!-- ROW 1: Monthly + Severity -->
      <section :style="rowStyle">
        <div :style="[chartOuterPanelStyle, { flex: '2' }]">
          <div :style="chartHeaderStyle">
            <h3 :style="chartTitleStyle">Monthly Misconduct Trends</h3>
            <p :style="chartSubtitleStyle">
              Incidents Reported Monthly in S.Y. 2025-2026
            </p>
          </div>

          <div
            v-if="
              !isChartLoading &&
              monthlyChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0
            "
            :style="chartInnerPanelStyle"
          >
            <MonthlyMisconductChart :chart-data="monthlyChartData" />
          </div>
          <div v-else-if="!isChartLoading" :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              No misconduct data available for the last 12 months.
            </div>
          </div>
          <div v-else :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              Loading chart data...
            </div>
          </div>
        </div>

        <div :style="[chartOuterPanelStyle, { flex: '1', minWidth: '300px' }]">
          <div :style="chartHeaderStyle">
            <h3 :style="chartTitleStyle">Offense Type Distribution</h3>
            <p :style="chartSubtitleStyle">
              Distribution of Misconduct by Severity Level
            </p>
          </div>

          <div
            v-if="
              !isDistributionLoading &&
              misconductDistributionChartData.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              ) > 0
            "
            :style="chartInnerPanelStyle"
          >
            <SeverityBarChart :chart-data="misconductDistributionChartData" />
          </div>
          <div v-else-if="!isDistributionLoading" :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              No offense distribution data available.
            </div>
          </div>
          <div v-else :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              Loading distribution data...
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 2: Specific + Program -->
      <section :style="rowStyle">
        <div :style="[chartOuterPanelStyle, { flex: '1' }]">
          <div :style="chartHeaderStyle">
            <h3 :style="chartTitleStyle">Specific Offense Breakdown</h3>
            <p :style="chartSubtitleStyle">
              Distribution of Specific Misconduct Types
            </p>
          </div>

          <div
            v-if="
              !isSpecificDistributionLoading &&
              specificMisconductDistributionChartData.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              ) > 0
            "
            :style="chartInnerPanelStyle"
          >
            <SpecificOffenseBarChart
              :chart-data="specificMisconductDistributionChartData"
            />
          </div>
          <div v-else-if="!isSpecificDistributionLoading" :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              No specific offense breakdown data available.
            </div>
          </div>
          <div v-else :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              Loading specific offense data...
            </div>
          </div>
        </div>

        <div :style="[chartOuterPanelStyle, { flex: '1' }]">
          <div :style="chartHeaderStyle">
            <h3 :style="chartTitleStyle">Misconduct Per Program</h3>
            <p :style="chartSubtitleStyle">
              Distribution of Misconduct Incidents by Program
            </p>
          </div>

          <div
            v-if="
              !isProgramLoading &&
              misconductPerProgramChartData.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              ) > 0
            "
            :style="chartInnerPanelStyle"
          >
            <ProgramBarChart :chart-data="misconductPerProgramChartData" />
          </div>
          <div v-else-if="!isProgramLoading" :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              No misconduct data available per program/course.
            </div>
          </div>
          <div v-else :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              Loading program/course data...
            </div>
          </div>
        </div>
      </section>

      <!-- ROW 3: Predictive -->
      <section :style="rowStyle">
        <div :style="[chartOuterPanelStyle, { flex: '1' }]">
          <div :style="chartHeaderStyle">
            <h3 :style="chartTitleStyle">
              Straight Line Predictive Forecast: January 2026 - May 2026
            </h3>
          </div>

          <div
            v-if="
              !isPredictiveLoading &&
              predictiveChartData.datasets[0].data.length > 0
            "
            :style="chartInnerPanelStyle"
          >
            <PredictiveForecastChart :chart-data="predictiveChartData" />
          </div>
          <div v-else-if="!isPredictiveLoading" :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              {{ predictiveData.message || 'Not enough data available to generate a forecast.' }}
            </div>
          </div>
          <div v-else :style="chartInnerPanelStyle">
            <div style="text-align: center; padding: 20px;">
              Loading predictive model...
            </div>
          </div>
        </div>
      </section>
    </div>
  </AdminNavbar>
</template>

<script>
/* eslint-disable */
import api from '@/services/api';
import AdminNavbar from '@/pages/navbar/AdminNavbar.vue';
import MonthlyMisconductChart from '@/components/MonthlyMisconductChart.vue';
import SeverityBarChart from '@/components/OffenseTypeChart.vue';
import SpecificOffenseBarChart from '@/components/SpecificOffenseBarChart.vue';
import ProgramBarChart from '@/components/ProgramBarChart.vue';
import PredictiveForecastChart from '@/components/StraightLineChart.vue';

export default {
  name: 'AdminDashboard',
  components: {
    AdminNavbar,
    MonthlyMisconductChart,
    SeverityBarChart,
    SpecificOffenseBarChart,
    ProgramBarChart,
    PredictiveForecastChart,
  },
  data() {
    return {
      userName: 'Admin',
      stats: {
        students: 0,
        reports: 0,
        pending: 0,
        underReview: 0,
        resolved: 0,
        closed: 0,
      },

      isStatsLoading: false,
      isChartLoading: false,
      isDistributionLoading: false,
      isSpecificDistributionLoading: false,
      isProgramLoading: false,
      isPredictiveLoading: false,

      monthlyMisconduct: [],
      misconductDistribution: {},
      specificMisconductDistribution: {},
      misconductPerProgram: {},
      predictiveData: {
        message: null,
        metadata: {
          calculated_growth_rate: null,
          baseline_period_1: null,
          baseline_period_1_count: 0,
          baseline_period_2: null,
          baseline_period_2_count: 0,
        },
        forecast_data: [],
      },
    };
  },
  created() {
    this.userName = this.getUserName();
  },
  mounted() {
    this.fetchAdminStats();
    this.fetchMonthlyMisconduct();
    this.fetchMisconductDistribution();
    this.fetchSpecificMisconductDistribution();
    this.fetchMisconductPerProgram();
    this.fetchPredictiveMisconduct();
  },
  methods: {
    getUserName() {
      try {
        const u = localStorage.getItem('user');
        if (u) {
          const parsed = JSON.parse(u);
          return parsed.name || parsed.first_name || parsed.last_name || 'Admin';
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
      return 'Admin';
    },

    async fetchAdminStats() {
      this.isStatsLoading = true;
      try {
        const { data } = await api.get('/admin/stats');
        this.stats = data || this.stats;
        localStorage.setItem('adminStats', JSON.stringify(this.stats));
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        this.isStatsLoading = false;
      }
    },

    async fetchMonthlyMisconduct() {
      this.isChartLoading = true;
      try {
        const { data } = await api.get('/stats/monthly-misconduct');
        this.monthlyMisconduct = Array.isArray(data) ? data : [];
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
        const { data } = await api.get('/stats/misconduct-distribution');
        this.misconductDistribution = data || {};
      } catch (error) {
        console.error('Failed to fetch offense type distribution:', error);
        this.misconductDistribution = {};
      } finally {
        this.isDistributionLoading = false;
      }
    },

    async fetchSpecificMisconductDistribution() {
      this.isSpecificDistributionLoading = true;
      try {
        const { data } = await api.get('/stats/specific-misconduct');
        this.specificMisconductDistribution = data || {};
      } catch (error) {
        console.error('Failed to fetch specific misconduct distribution:', error);
        this.specificMisconductDistribution = {};
      } finally {
        this.isSpecificDistributionLoading = false;
      }
    },

    async fetchMisconductPerProgram() {
      this.isProgramLoading = true;
      try {
        const { data } = await api.get('/stats/misconduct-per-program');
        this.misconductPerProgram = data || {};
      } catch (error) {
        console.error('Failed to fetch misconduct per program:', error);
        this.misconductPerProgram = {};
      } finally {
        this.isProgramLoading = false;
      }
    },

    async fetchPredictiveMisconduct() {
      this.isPredictiveLoading = true;
      try {
        const { data } = await api.get('/stats/predictive');
        this.predictiveData = data || this.predictiveData;
      } catch (error) {
        console.error('Failed to fetch predictive misconduct data:', error);
        this.predictiveData = {
          ...this.predictiveData,
          message: 'Error fetching predictive data from server.',
          forecast_data: [],
        };
      } finally {
        this.isPredictiveLoading = false;
      }
    },
  },
  computed: {
    
    /* PAGE */
headerRowStyle() {
  return {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',   // left: hello, right: cards
    gap: '20px',
    alignItems: 'stretch',
    marginBottom: '10px',
  };
},
helloBoxStyle() {
  return {
    color: '#0b3a23',
  };
},
helloTitleStyle() {
  return {
    margin: '0 0 4px',
    fontSize: '1.8rem',
    fontWeight: 900,
  };
},
helloTextStyle() {
  return {
    margin: 0,
    fontSize: '0.9rem',
    maxWidth: '430px',
  };
},
topStatRowStyle() {
  return {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
  };
},
topStatCardStyle() {
  return {
    flex: 1,
    backgroundColor: '#dbeed3',
    borderRadius: '14px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  };
},
topStatLabelStyle() {
  return {
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#0f3a20',
  };
},
topStatValueStyle() {
  return {
    marginTop: '4px',
    fontSize: '1.6rem',
    fontWeight: 900,
    color: '#0f3a20',
  };
},


    /* STATUS PILLS */
    statusStripStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '14px',
        marginTop: '18px',
      };
    },
    statusCardStyle() {
      return {
        display: 'grid',
        gridTemplateColumns: '1.6fr 0.9fr',
        backgroundColor: '#dbeed3',
        borderRadius: '14px',
        overflow: 'hidden',
        alignItems: 'stretch',
      };
    },
    statusLabelStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: '#0f3a20',
      };
    },
    statusValueBoxStyle() {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b3a23',
        color: '#ffffff',
        fontSize: '1.3rem',
        fontWeight: 900,
      };
    },

    /* OVERVIEW STRIP */
    overviewStripStyle() {
      return {
        textAlign: 'center',
        marginTop: '16px',
      };
    },
    overviewTitleStyle() {
      return {
        margin: 0,
        fontSize: '0.95rem',
        fontWeight: 900,
        letterSpacing: '0.06em',
        color: '#0b3a23',
      };
    },
    overviewTextStyle() {
      return {
        margin: '2px 0 0',
        fontSize: '0.8rem',
        color: '#08351d',
      };
    },

    /* ROW + CHART CARDS */
    rowStyle() {
      return {
        display: 'flex',
        gap: '20px',
        marginTop: '18px',
        flexWrap: 'wrap',
      };
    },
    chartOuterPanelStyle() {
      return {
        width: '420px',
        backgroundColor: '#6bb37a',
        borderRadius: '14px',
        padding: '6px 10px 12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
        boxSizing: 'border-box',
      };
    },
    chartHeaderStyle() {
      return {
        padding: '4px 4px 4px',
      };
    },
    chartTitleStyle() {
      return {
        margin: '0 0 4px',
        fontSize: '0.95rem',
        fontWeight: 800,
        color: '#0b3a23',
        textAlign: 'left',
      };
    },
    chartSubtitleStyle() {
      return {
        margin: 0,
        fontSize: '0.75rem',
        color: '#0b3a23',
        textAlign: 'left',
      };
    },
    chartInnerPanelStyle() {
      return {
        backgroundColor: '#e1f3d5',
        borderRadius: '10px',
        padding: '6px 10px',
        height: '190px', // all graphs same height
        width: '100%',
        boxSizing: 'border-box',
      };
    },

    /* TEXT STYLES ALREADY ABOVE FOR QUICK STATS ROW */
    quickStatsGridStyle() {
      return {
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      };
    },
    getStatMainStyle() {
      return {
        width: 'calc(50% - 10px)',
        height: '140px',
        background: 'transparent',
        color: '#0b3a23',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderRadius: '0',
        boxShadow: 'none',
        padding: '0',
      };
    },
    statValueStyle() {
      return { fontSize: '0px', fontWeight: '900', lineHeight: '1' }; // hidden, we use top cards
    },
    statLabelStyle() {
      return {
        display: 'none',
      };
    },
    statusRowStyle() {
      return {}; // unused, statusStripStyle is used instead
    },
    statValueSmStyle() {
      return {
        fontSize: '0.9rem',
        fontWeight: '900',
        lineHeight: '1',
        marginBottom: '5px',
        color: '#1d3e21',
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

    /* CHART DATA COMPUTED */
    monthlyChartData() {
      const labels = this.monthlyMisconduct.map((i) => i.month_label);
      const data = this.monthlyMisconduct.map((i) => i.count);

      return {
        labels,
        datasets: [
          {
            label: 'Incidents Reported',
            data,
          },
        ],
      };
    },
    misconductDistributionChartData() {
      const labels = Object.keys(this.misconductDistribution || {});
      const data = Object.values(this.misconductDistribution || {});
      return {
        labels,
        datasets: [
          {
            label: 'Category Count',
            data,
          },
        ],
      };
    },
    specificMisconductDistributionChartData() {
      const labels = Object.keys(this.specificMisconductDistribution || {});
      const data = Object.values(this.specificMisconductDistribution || {});
      return {
        labels,
        datasets: [
          {
            label: 'Specific Offense Count',
            data,
          },
        ],
      };
    },
    misconductPerProgramChartData() {
      const labels = Object.keys(this.misconductPerProgram || {});
      const data = Object.values(this.misconductPerProgram || {});
      return {
        labels,
        datasets: [
          {
            label: 'Incidents per Program',
            data,
          },
        ],
      };
    },
    predictiveChartData() {
      const forecast = this.predictiveData.forecast_data || [];
      const labels = forecast.map((i) => i.month_label);
      const historicalData = forecast.map((i) =>
        i.is_prediction ? null : i.count
      );
      const predictedData = forecast.map((i) =>
        i.is_prediction ? i.count : null
      );
      return {
        labels,
        datasets: [
          {
            label: 'Historical',
            data: historicalData,
          },
          {
            label: 'Predicted',
            data: predictedData,
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
/* all layout handled via inline/computed styles */
</style>
