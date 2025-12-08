<template>
  <Bar :data="barChartData" :options="chartOptions" />
</template>

<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'SpecificOffenseBarChart',
  components: { Bar },
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
        indexAxis: 'x',
        scales: {
          x: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Specific Offense',
            },
            grid: { display: false },
            ticks: { color: '#0b3a23', font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Incidents',
            },
            grid: { color: 'rgba(11, 58, 35, 0.15)' },
            ticks: { color: '#0b3a23', font: { size: 10 }, precision: 0 },
          },
        },
        plugins: {
          legend: { display: false },
          title: { display: false },
          tooltip: {
            backgroundColor: '#0b3a23',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            callbacks: {
              label(context) {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) label += context.parsed.y;
                return label;
              },
            },
          },
        },
      },
    };
  },
  computed: {
    barChartData() {
      if (!this.chartData || !this.chartData.datasets) return this.chartData;

      const colors = ['#74a765', '#8bc17a', '#a2cd8f', '#b9d8a4', '#d0e4b9'];

      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map((ds, dsIndex) => ({
          ...ds,
          backgroundColor: ds.data.map(
            (_, i) => colors[(i + dsIndex) % colors.length]
          ),
          borderColor: '#1d3e21',
          borderWidth: 1.2,
          borderRadius: 6,
          maxBarThickness: 28,
        })),
      };
    },
  },
};
</script>
