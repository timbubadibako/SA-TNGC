// Data ABSA riil hasil ekstraksi dataset Taman Nasional Gunung Ciremai (1.752 deteksi aspek)
const absaAspectData = {
    categories: [
        'Fasilitas Sanitasi',
        'Biaya & Logistik',
        'Jalur & Trek',
        'Pelayanan Petugas',
        'Sampah & Kebersihan'
    ],
    positif: [458, 425, 381, 110, 77],
    negatif: [35, 79, 15, 27, 20],
    netral: [32, 46, 32, 12, 11]
};

let chart;

// Inisialisasi Chart ABSA (Horizontal Stacked Bar atau Grouped Bar)
function initChart(mode = 'stacked_bar') {
    const ctx = document.getElementById('absaAspectChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const isStacked = (mode === 'stacked_bar');

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: absaAspectData.categories,
            datasets: [
                {
                    label: 'Positif',
                    data: absaAspectData.positif,
                    backgroundColor: '#2ECC71',
                    borderColor: '#27ae60',
                    borderWidth: 1,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Negatif',
                    data: absaAspectData.negatif,
                    backgroundColor: '#E74C3C',
                    borderColor: '#c0392b',
                    borderWidth: 1,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Netral',
                    data: absaAspectData.netral,
                    backgroundColor: '#BDC3C7',
                    borderColor: '#95a5a6',
                    borderWidth: 1,
                    barPercentage: 0.65,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            indexAxis: 'y', // Horizontal bar untuk keterbacaan nama aspek yang panjang
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { family: 'Space Mono', size: 10, weight: 'bold' },
                        boxWidth: 12,
                        color: '#111'
                    }
                },
                tooltip: {
                    backgroundColor: '#000',
                    titleFont: { family: 'Space Mono', size: 11, weight: 'bold' },
                    bodyFont: { family: 'Space Mono', size: 10 },
                    padding: 10,
                    cornerRadius: 0,
                    callbacks: {
                        footer: function(tooltipItems) {
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                total += tooltipItem.parsed.x;
                            });
                            return 'Total Aspek: ' + total;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: isStacked,
                    grid: { display: true, color: '#e5e5e5' },
                    ticks: { font: { family: 'Space Mono', size: 10 }, color: '#333' }
                },
                y: {
                    stacked: isStacked,
                    grid: { display: false },
                    ticks: { font: { family: 'Space Mono', size: 10, weight: 'bold' }, color: '#111' }
                }
            }
        }
    });
}

function toggleChartView(mode) {
    initChart(mode);
}

// Switcher Tab Rekomendasi Short vs Long Term
function switchRecomTab(type) {
    const tabs = document.querySelectorAll('.recom-tab-btn');
    tabs.forEach(btn => btn.classList.remove('active'));

    const contents = document.querySelectorAll('.recom-tab-content');
    contents.forEach(cnt => cnt.classList.remove('active'));

    if (type === 'short') {
        tabs[0].classList.add('active');
        document.getElementById('tab-short').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('tab-long').classList.add('active');
    }
}

// Load preview JSON mentah murni tanpa rekomendasi mock
function loadPayloadPreview() {
    const previewEl = document.getElementById('rawPayloadPreview');
    const samplePayload = {
        "status": "AWAITING_LLM_INFERENCE",
        "timestamp": "2026-09-30T03:00:00Z",
        "aspect_distribution": {
            "biaya_logistik": { "negatif": 79, "positif": 425 },
            "fasilitas_sanitasi": { "negatif": 35, "positif": 458 },
            "pelayanan_petugas": { "negatif": 27, "positif": 110 },
            "sampah_kebersihan": { "negatif": 20, "positif": 77 }
        },
        "llm_prompt_contract": {
            "mode": "ZERO_MOCK_OPERATIONAL_INFERENCE",
            "required_keys": ["short_term_actions", "long_term_policies"]
        }
    };

    if (previewEl) {
        previewEl.textContent = JSON.stringify(samplePayload, null, 2);
    }
}

function triggerConnectPrompt() {
    alert("Endpoint LLM belum dikonfigurasi.\n\nSilakan masukkan API Key LLM (Gemini 2.5 / OpenAI / Claude) di backend (.env) untuk mengaktifkan penalaran analitik otomatis.");
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    initChart('stacked_bar');
    loadPayloadPreview();
});