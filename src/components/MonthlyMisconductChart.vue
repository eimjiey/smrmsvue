<template>
  <Line :data="lineChartData" :options="chartOptions" />
</template>

<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

export default {
  name: 'MonthlyMisconductChart',
  components: { Line },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            backgroundColor: '#0b3a23',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Incidents' },
            grid: { color: 'rgba(11, 58, 35, 0.15)' },
            ticks: { precision: 0, color: '#0b3a23', font: { size: 10 } },
          },
          x: {
            title: { display: true, text: 'Month' },
            grid: { display: false },
            ticks: { color: '#0b3a23', font: { size: 10 } },
          },
        },
        elements: {
          line: {
            tension: 0.25,
            borderWidth: 2,
            fill: false,
          },
        },
      },
    };
  },
  computed: {
    lineChartData() {
      if (!this.chartData || !this.chartData.datasets) {
        return this.chartData;
      }

      const lineColor = '#1d3e21';
      const pointColor = '#74a765';

      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map((dataset) => ({
          ...dataset,
          label: 'Number of Incidents',
          borderColor: lineColor,
          backgroundColor: 'transparent',
          pointBackgroundColor: pointColor,
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: lineColor,
          data: dataset.data.map(Number),
        })),
      };
    },
  },
};
</script>
