<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from 'chart.js'

// Register chart elements
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

export default {
  name: 'MonthlyMisconductChart',
  components: { Line },
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
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Incidents Reported Monthly in 1st Semester S.Y. 2025-2026',
            font: { size: 16, weight: 'bold' },
            padding: { top: 10, bottom: 15 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Incidents' },
            ticks: {
              precision: 0 // Ensure ticks are whole numbers
            }
          },
          x: { // Explicitly define x-axis scale for clarity
            title: { display: true, text: 'Month' }
          }
        },
        elements: {
          line: {
            tension: 0.4, // Smooth the line
            borderWidth: 2,
            fill: 'origin' // Fill the area under the line
          }
        }
      }
    }
  },
  computed: {
    lineChartData() {
      if (!this.chartData || !this.chartData.datasets) {
        return this.chartData
      }

      // Define colors to match the green theme
      const baseColor = '#1d3e21' // Dark Green (Line and Points)
      const fillColor = 'rgba(77, 124, 82, 0.4)' // Light Green (Area fill)

      return {
        ...this.chartData,
        datasets: this.chartData.datasets.map(dataset => ({
          ...dataset,
          // Ensure the label for the legend is clear
          label: 'Number of Incidents', 
          
          // Apply custom styling for the Line Chart
          borderColor: baseColor,
          backgroundColor: fillColor, // Area fill color
          pointBackgroundColor: baseColor,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: baseColor,

          // Ensure the data remains numeric
          data: dataset.data.map(Number) 
        }))
      }
    }
  }
}
</script>

<template>
  <Line :data="lineChartData" :options="chartOptions" />
</template>