// src/components/SeverityChart.vue

<script>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement, // Import the BarElement
  CategoryScale, // Import CategoryScale for X-axis
  LinearScale // Import LinearScale for Y-axis
} from 'chart.js'

// Register all necessary elements for a Bar chart
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'SeverityBarChart',
  components: { Bar }, // Use the Bar chart component
  props: {
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true, // Ensure the Y-axis starts at zero
                title: {
                    display: true,
                    text: 'Number of Incidents',
                    font: { size: 12 }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Misconduct Severity Level',
                    font: { size: 12 }
                }
            }
        },
        plugins: {
          legend: {
            display: false, // Often hidden for single-dataset bar charts
          },
          title: {
            display: true,
            text: 'Misconduct Severity Distribution',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
                top: 10,
                bottom: 10
            }
          }
        },
      }
    }
  }
}
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>