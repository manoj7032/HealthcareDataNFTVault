import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const DataInsights = ({ mintedData }) => {
  // Process data for visualization
  const dataTypes = mintedData.map((record) => record.metadata[0]);
  const providers = mintedData.map((record) => record.metadata[2]);
  const months = mintedData.map((record) =>
    new Date(record.metadata[1]).toLocaleString('default', { month: 'short', year: 'numeric' })
  );

  const countOccurrences = (arr) =>
    arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

  const typeCounts = countOccurrences(dataTypes);
  const providerCounts = countOccurrences(providers);
  const monthlyCounts = countOccurrences(months);

  const chartData = (labels, data) => ({
    labels: Object.keys(labels),
    datasets: [
      {
        label: 'Count',
        data: Object.values(labels),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderWidth: 1,
      },
    ],
  });

  return (
    <div className="card">
      <h2>Data Insights</h2>
      <div className="chart-container">
        <div>
          <h3>Records by Type</h3>
          <Bar data={chartData(typeCounts)} />
        </div>
        <div>
          <h3>Records by Provider</h3>
          <Pie data={chartData(providerCounts)} />
        </div>
        <div>
          <h3>Records Over Time</h3>
          <Bar data={chartData(monthlyCounts)} />
        </div>
      </div>
    </div>
  );
};

export default DataInsights;

