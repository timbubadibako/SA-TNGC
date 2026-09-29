// Data lengkap untuk chart
const fullLabels = [
    'Okt 01', 'Okt 02', 'Okt 03', 'Okt 04', 'Okt 05', 'Okt 06', 'Okt 07',
    'Okt 08', 'Okt 09', 'Okt 10', 'Okt 11', 'Okt 12', 'Okt 13', 'Okt 14',
    'Okt 15', 'Okt 16', 'Okt 17', 'Okt 18', 'Okt 19', 'Okt 20', 'Okt 21',
    'Okt 22', 'Okt 23', 'Okt 24', 'Okt 25', 'Okt 26', 'Okt 27', 'Okt 28',
    'Okt 29', 'Okt 30', 'Nov 01', 'Nov 02', 'Nov 03', 'Nov 04', 'Nov 05',
    'Nov 06', 'Nov 07', 'Nov 08', 'Nov 09', 'Nov 10', 'Nov 11', 'Nov 12',
    'Nov 13', 'Nov 14', 'Nov 15', 'Nov 16', 'Nov 17', 'Nov 18', 'Nov 19', 'Nov 20'
];

const fullDataPositif = [
    100, 105, 110, 108, 120, 118, 115, 122, 130, 140, 138, 135, 142, 145,
    140, 148, 150, 145, 152, 135, 140, 148, 155, 158, 160, 162, 158, 155,
    160, 155, 165, 170, 172, 175, 180, 178, 175, 182, 185, 175, 180, 188,
    190, 192, 190, 195, 200, 205, 208, 210
];

const fullDataNegatif = [
    50, 48, 52, 49, 45, 47, 60, 58, 55, 55, 53, 50, 52, 48,
    55, 52, 50, 48, 45, 50, 48, 45, 42, 40, 40, 38, 40, 38,
    35, 35, 32, 30, 33, 35, 30, 32, 28, 30, 35, 45, 42, 40,
    38, 35, 25, 28, 30, 25, 22, 20
];

const fullDataNetral = [
    80, 82, 78, 85, 85, 83, 80, 78, 82, 82, 80, 88, 85, 83,
    82, 85, 87, 85, 88, 88, 85, 90, 88, 92, 90, 88, 92, 90,
    85, 85, 87, 88, 90, 92, 88, 90, 85, 92, 88, 92, 90, 93,
    95, 92, 95, 93, 98, 95, 92, 90
];

let chart;

// Inisialisasi chart
function initChart() {
    const ctx = document.getElementById('sentimentChart').getContext('2d');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fullLabels,
            datasets: [
                {
                    label: 'Positif',
                    data: fullDataPositif,
                    borderColor: '#2ECC71',
                    backgroundColor: '#2ECC71',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Negatif',
                    data: fullDataNegatif,
                    borderColor: '#E74C3C',
                    backgroundColor: '#E74C3C',
                    borderWidth: 2,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Netral',
                    data: fullDataNetral,
                    borderColor: '#BDBDBD',
                    backgroundColor: '#BDBDBD',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#000',
                    titleFont: { family: 'Space Mono', size: 11 },
                    bodyFont: { family: 'Space Mono', size: 11 },
                    padding: 12,
                    cornerRadius: 0,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { display: true, color: '#f0f0f0' },
                    ticks: { font: { family: 'Space Mono', size: 10 } }
                },
                y: {
                    grid: { display: true, color: '#f0f0f0' },
                    ticks: { font: { family: 'Space Mono', size: 10 } }
                }
            }
        }
    });
}

// Update chart berdasarkan range
function updateChartRange(range) {
    let labels, dataPos, dataNeg, dataNeu;

    if (range === '1D') {
        // Tampilkan data 1 hari terakhir
        labels = fullLabels.slice(-1);
        dataPos = fullDataPositif.slice(-1);
        dataNeg = fullDataNegatif.slice(-1);
        dataNeu = fullDataNetral.slice(-1);
    } else if (range === '1W') {
        // Tampilkan data 7 hari terakhir
        labels = fullLabels.slice(-7);
        dataPos = fullDataPositif.slice(-7);
        dataNeg = fullDataNegatif.slice(-7);
        dataNeu = fullDataNetral.slice(-7);
    } else {
        // Tampilkan semua data
        labels = fullLabels;
        dataPos = fullDataPositif;
        dataNeg = fullDataNegatif;
        dataNeu = fullDataNetral;
    }

    chart.data.labels = labels;
    chart.data.datasets[0].data = dataPos;
    chart.data.datasets[1].data = dataNeg;
    chart.data.datasets[2].data = dataNeu;
    chart.update();
}

// Event listener untuk dropdown
document.addEventListener('DOMContentLoaded', function () {
    initChart();

    const rangeSelector = document.getElementById('rangeSelector');
    if (rangeSelector) {
        rangeSelector.addEventListener('change', function () {
            updateChartRange(this.value);
        });
    }
});