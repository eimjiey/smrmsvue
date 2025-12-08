<template>
  <div class="page">
    <!-- TOP GREEN AREA WITH NAVBAR + TITLE -->
    <div class="hero">
      <UserNavbar />

      <div class="hero-inner">
        <h1 class="hero-title">
          STUDENT MISCONDUCT REPORT MANAGEMENT
        </h1>

        <div class="hero-buttons">
          <button class="btn btn-primary" @click="goToReport">
            REPORT INCIDENT
          </button>
          <button class="btn btn-secondary" @click="goToMyReports">
            VIEW REPORTS
          </button>
        </div>
      </div>
    </div>

    <!-- TOTAL REPORTS CARD -->
    <section class="totals-section">
      <div class="total-card">
        <div class="total-value">{{ totalReports }}</div>
        <div class="total-label">TOTAL MISCONDUCT REPORTS FILED</div>
      </div>
    </section>

    <!-- CHART GRID: MONTHLY (BAR) + PROGRAM -->
    <section class="charts-section">
      <div class="charts-row">
        <!-- Monthly Misconduct Trends (BAR) -->
        <section class="chart-card flex-2">
          <h2 class="chart-title">Monthly Misconduct Trends</h2>
          <p class="chart-subtitle">
            Incidents reported monthly in S.Y. 2025–2026
          </p>

          <div
            v-if="
              !isMonthlyLoading &&
              monthlyChartData.datasets[0].data.reduce((a, b) => a + b, 0) > 0
            "
            class="chart-inner"
          >
            <MonthlyMisconductChart :chart-data="monthlyChartData" />
          </div>
          <div v-else-if="!isMonthlyLoading" class="chart-empty">
            No monthly misconduct data available.
          </div>
          <div v-else class="chart-empty">
            Loading monthly data...
          </div>
        </section>

        <!-- Misconduct Per Program -->
        <section class="chart-card flex-1">
          <h2 class="chart-title">Misconduct Per Program</h2>
          <p class="chart-subtitle">
            Distribution of misconduct incidents by program.
          </p>

          <div
            v-if="!isProgramLoading && hasProgramData"
            class="chart-inner"
          >
            <ProgramBarChart :chart-data="misconductPerProgramChartData" />
          </div>
          <div v-else-if="!isProgramLoading" class="chart-empty">
            No misconduct data available per program.
          </div>
          <div v-else class="chart-empty">
            Loading program/course data...
          </div>
        </section>
      </div>
    </section>

    <!-- LOWER LIGHT AREA INFO -->
    <main class="content">
      <section class="info-card">
        <div class="info-left"></div>
        <div class="info-right">
          <h2 class="info-title">INFO</h2>
          <p class="info-text">
            The Student Misconduct Report Management System helps schools
            record, track, and manage misconduct cases efficiently. Our goal
            is to promote fairness, accountability, and a safe learning
            environment.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import UserNavbar from '@/components/UserNavbar.vue';
import ProgramBarChart from '@/components/ProgramBarChart.vue';
import MonthlyMisconductChart from '@/components/MonthlyMisconductChart.vue';
import api from '@/services/api';

export default {
  name: 'UserDashboard',
  components: { UserNavbar, ProgramBarChart, MonthlyMisconductChart },
  data() {
    return {
      stats: {
        reports: 0,
      },
      isStatsLoading: false,
      isMonthlyLoading: false,
      isProgramLoading: false,
      monthlyMisconduct: [],
      misconductPerProgram: {},
    };
  },
  computed: {
    totalReports() {
      return Number(this.stats.reports || 0);
    },
    hasProgramData() {
      return Object.values(this.misconductPerProgram || {}).some(
        (v) => Number(v) > 0,
      );
    },
    // BAR GRAPH CONFIG FOR MONTHLY MISCONDUCT
    monthlyChartData() {
      const labels = this.monthlyMisconduct.map((i) => i.month_label);
      const data = this.monthlyMisconduct.map((i) => i.count);

      return {
        labels,
        datasets: [
          {
            label: 'Number of Incidents',
            data,
            backgroundColor: 'rgba(77, 124, 82, 0.8)',
            borderColor: '#1d3e21',
            borderWidth: 1,
          },
        ],
      };
    },
    misconductPerProgramChartData() {
      const labels = Object.keys(this.misconductPerProgram || {});
      const data = Object.values(this.misconductPerProgram || {});
      const chartColors = [
        'rgba(46, 134, 193, 0.8)',
        'rgba(241, 196, 15, 0.8)',
        'rgba(39, 174, 96, 0.8)',
        'rgba(231, 76, 60, 0.8)',
        'rgba(155, 89, 182, 0.8)',
        'rgba(52, 73, 94, 0.8)',
      ];

      return {
        labels,
        datasets: [
          {
            label: 'Number of Misconduct Incidents',
            data,
            backgroundColor: data.map(
              (_, i) => chartColors[i % chartColors.length],
            ),
            borderColor: '#1d3e21',
            borderWidth: 1,
          },
        ],
      };
    },
  },
  mounted() {
    this.fetchStats();
    this.fetchMonthlyMisconduct();
    this.fetchMisconductPerProgram();
  },
  methods: {
    goToReport() {
      this.$router.push('/file-incident-report');
    },
    goToMyReports() {
      this.$router.push({ name: 'UserReportHistory' });
    },
    async fetchStats() {
      this.isStatsLoading = true;
      try {
        const { data } = await api.get('/admin/stats');
        this.stats = data || this.stats;
      } catch (error) {
        console.error('Failed to fetch stats for user dashboard:', error);
      } finally {
        this.isStatsLoading = false;
      }
    },
    async fetchMonthlyMisconduct() {
      this.isMonthlyLoading = true;
      try {
        const { data } = await api.get('/stats/monthly-misconduct');
        this.monthlyMisconduct = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch monthly misconduct:', error);
        this.monthlyMisconduct = [];
      } finally {
        this.isMonthlyLoading = false;
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
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #eaf9e7;
  display: flex;
  flex-direction: column;
}

/* Hero section */
.hero {
  background-color: #78ae63;
  border-bottom-left-radius: 48px;
  border-bottom-right-radius: 48px;
  padding-bottom: 100px;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 0;
  text-align: center;
}

.hero-title {
  color: #0e5821;
  font-size: 2.2rem;
  letter-spacing: 2px;
  margin: 40px 0 70px;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.btn {
  padding: 18px 70px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.25);
}

.btn-primary,
.btn-secondary {
  background-color: #063d1e;
  color: #ffffff;
}

/* Total reports card */
.totals-section {
  max-width: 1100px;
  margin: -40px auto 0 auto;
  padding: 0 24px 10px;
}

.total-card {
  background: #1d3e21;
  color: #f8fff8;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.total-value {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
}

.total-label {
  margin-top: 8px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Charts layout */
.charts-section {
  max-width: 1100px;
  margin: 0 auto 0 auto;
  padding: 0 24px 20px;
}

.charts-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.chart-card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flex-2 {
  flex: 4;
}

.flex-1 {
  flex: 3.5;
}

.chart-title {
  color: #1d3e21;
  margin: 0 0 6px;
  font-weight: 700;
  text-align: center;
}

.chart-subtitle {
  margin: 0 0 14px;
  font-size: 0.9rem;
  color: #4caf50;
  text-align: center;
}

.chart-inner {
  height: 280px;
  width: 100%;
}

.chart-empty {
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
}

/* Lower info section */
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20px 20px 90px;
}

.info-card {
  width: 100%;
  max-width: 720px;
  background-color: #549a6c;
  border-radius: 12px;
  display: flex;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.info-left {
  background-color: rgba(255, 255, 255, 0.2);
  flex-basis: 35%;
  border-radius: 8px;
  margin-right: 24px;
}

.info-right {
  flex-basis: 65%;
  text-align: left;
}

.info-title {
  color: #ffffff;
  font-size: 1.8rem;
  margin: 0 0 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.info-text {
  color: #f0f0f0;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* Mobile tweaks */
@media (max-width: 768px) {
  .hero-inner {
    padding: 24px 16px 0;
  }

  .hero-title {
    font-size: 1.7rem;
    margin: 30px 0 40px;
  }

  .hero-buttons {
    flex-direction: column;
    gap: 16px;
  }

  .btn {
    width: 100%;
  }

  .totals-section {
    margin-top: -30px;
    padding: 0 16px 10px;
  }

  .charts-section {
    padding: 0 16px 16px;
  }

  .charts-row {
    flex-direction: column;
  }

  .content {
    padding: 30px 16px 70px;
  }

  .info-card {
    flex-direction: column;
  }

  .info-left {
    margin-right: 0;
    margin-bottom: 16px;
    min-height: 120px;
  }
}
</style>
