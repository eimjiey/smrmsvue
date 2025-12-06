<template>
  <Bar
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
// Assuming you are using 'vue-chartjs' and 'chart.js'
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'SpecificOffenseBarChart',
  components: { Bar },
  props: {
    // This prop will receive the formatted data from the computed property in AdminDashboard.vue
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
        // --- FIX 1: Change indexAxis to 'x' for a vertical bar chart ---
        indexAxis: 'x', 
        scales: {
            x: {
                // X-axis now displays the category (Specific Offense)
                beginAtZero: true,
                title: {
                    display: true,
                    // --- FIX 2: Set X-axis title to the category label ---
                    text: 'Specific Offense'
                }
            },
            y: {
                // Y-axis now displays the value (Number of Incidents)
                title: {
                    display: true,
                    // --- FIX 3: Set Y-axis title to the count label ---
                    text: 'Number of Incidents'
                }
            }
        },
        plugins: {
          legend: {
            display: false // Hide legend since there's only one dataset
          },
          title: {
            display: false, // Title is handled by the parent component
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                // When indexAxis is 'x', the value is context.parsed.y
                if (context.parsed.y !== null) { 
                    label += context.parsed.y;
                }
                return label;
              }
            }
          }
        }
      }
    }
  }
}
</script>