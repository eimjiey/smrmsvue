<template>
  <Line
    :data="lineChartData"
    :options="chartOptions"
    :id="chartId"
    :dataset-id-key="datasetIdKey"
    :width="width"
    :height="height"
    :css-classes="cssClasses"
    :styles="styles"
    :plugins="plugins"
  />
</template>

<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default {
  name: 'PredictiveForecastChart',
  components: {
    Line,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartId: {
      type: String,
      default: 'predictive-line-chart',
    },
    datasetIdKey: {
      type: String,
      default: 'label',
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      type: String,
      default: '',
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Predicted Incidents',
            },
            grid: { color: 'rgba(11, 58, 35, 0.15)' },
            ticks: { color: '#0b3a23', font: { size: 10 }, precision: 0 },
          },
          x: {
            title: {
              display: true,
              text: 'Month',
            },
            grid: { display: false },
            ticks: { color: '#0b3a23', font: { size: 10 } },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          title: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0b3a23',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
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
      if (!this.chartData || !this.chartData.datasets) return this.chartData;

      const historicalColor = '#1d3e21';
      const historicalPoint = '#74a765';
      const predictedColor = 'rgba(255, 165, 0, 1)';

      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map((ds) => {
          const isPredicted =
            ds.label && ds.label.toLowerCase().includes('predicted');
          return {
            ...ds,
            borderColor: isPredicted ? predictedColor : historicalColor,
            backgroundColor: 'transparent',
            pointBackgroundColor: isPredicted ? predictedColor : historicalPoint,
            pointBorderColor: '#ffffff',
            borderDash: isPredicted ? [5, 5] : [],
          };
        }),
      };
    },
  },
};
</script>
