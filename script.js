// Minimal CSV parser and trend visualizer for Uber Demand Predictor

let tripData = [];

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fileInput = document.getElementById('csvFile');
  if (!fileInput.files.length) return alert('Please upload a CSV file.');
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    tripData = parseCSV(event.target.result);
    if(tripData.length < 2) {
      alert('CSV seems empty or invalid!');
      return;
    }
    showTrendChart(tripData);
    document.getElementById('predictionSection').style.display = 'block';
  };
  reader.readAsText(file);
});

document.getElementById('predictBtn').addEventListener('click', function() {
  if (tripData.length < 2) return;
  const days = parseInt(document.getElementById('predictDays').value);
  const forecast = predictTrips(tripData, days);
  document.getElementById('predictionResult').innerHTML = `
    <b>Forecast for next ${days} days:</b> <br/>${forecast.map((c,i)=>`Day ${i+1}: <b>${c}</b>`).join('<br/>')}
  `;
});

// Simple CSV parser: Assumes CSV header ["date","trip_count"]
function parseCSV(data) {
  const lines = data.trim().split('\n');
  const rows = [];
  for(let i=1; i<lines.length; ++i) {
    const [date, trips] = lines[i].split(',');
    if(date && trips) rows.push({date, trips: +trips});
  }
  return rows;
}

// Render chart using Chart.js
let chart;
function showTrendChart(data) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const labels = data.map(row => row.date);
  const counts = data.map(row => row.trips);
  if(chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Trips per Day',
        data: counts,
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49,130,206,0.15)',
        fill: true,
        tension: 0.2,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// Simple prediction: average last 7 days or all data
function predictTrips(data, days) {
  const N = Math.min(7, data.length);
  const avg = data.slice(-N).reduce((sum, r) => sum + r.trips, 0) / N;
  return Array(days).fill(Math.round(avg));
}