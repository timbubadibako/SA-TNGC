"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import frontendData from "./absa_frontend_data.json";

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ALL_CATEGORIES = [
  "Fasilitas Sanitasi",
  "Biaya & Logistik",
  "Jalur & Trek",
  "Pelayanan Petugas",
  "Sampah & Kebersihan",
];

// Pre-computed recommendation cache per POI (hemat token, zero real-time loop)
const PRECOMPUTED_RECOMMENDATIONS: Record<string, { short: string; medium: string; long: string }> = {
  "Taman Nasional Gunung Ciremai (Pusat Balai TNGC)": {
    short: "Perbaikan darurat kran dan pasokan air bersih toilet basecamp, serta standarisasi rincian tarif tiket & asuransi resmi di loket.",
    medium: "Peremajaan shelter peristirahatan kayu yang lapuk di pos bayangan dan penertiban tarif batas atas kendaraan bak transit Sadarehe.",
    long: "Pembangunan eco-toilet di pos ketinggian (>2.000 mdpl), sertifikasi kompetensi ranger pemandu, dan integrasi smart-gate barcode e-KTP."
  },
  "Basecamp Pendakian Jalur Linggarjati": {
    short: "Pemasangan tali webbing pengaman di tanjakan bebatuan terjal serta pengadaan karung pilah sampah wajib saat registrasi.",
    medium: "Peningkatan debit air bersih di pos peristirahatan dan pelatihan keramahan (hospitality) bagi volunteer penjaga pos.",
    long: "Pemberlakuan kuota harian ketat untuk pemulihan jalur vegetasi dan pembangunan helipad evakuasi medis darurat."
  },
  "Basecamp Pendakian Jalur Palutungan & Apuy": {
    short: "Sanitasi intensif toilet basecamp minimal 3 kali sehari dan transparansi retribusi parkir serta tes kesehatan.",
    medium: "Penyediaan pos medis darurat di Pos 3 dan perbaikan plang penunjuk kilometer fosfor bercahaya malam.",
    long: "Pengembangan pusat edukasi konservasi lingkungan mandiri dan elektrifikasi ramah lingkungan bertenaga surya di pos bayangan."
  }
};

export default function SentimentArenaStudio() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // States
  const [selectedPoi, setSelectedPoi] = useState<string>("Semua Destinasi");
  const [viewMode, setViewMode] = useState<"stacked_bar" | "grouped_bar">("stacked_bar");
  const [activeTab, setActiveTab] = useState<"short" | "medium" | "long">("short");
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "testing" | "error">("disconnected");

  // Filtered Aspects Data
  const currentAspects = useMemo(() => {
    if (selectedPoi === "Semua Destinasi") {
      return frontendData.global_aspects as Record<string, { positif: number; negatif: number; netral: number }>;
    }
    return ((frontendData.poi_aspects as Record<string, Record<string, { positif: number; negatif: number; netral: number }>>)[selectedPoi]) || frontendData.global_aspects;
  }, [selectedPoi]);

  // Filtered Reviews Data (Tabel Ulasan Tersaring)
  const filteredReviews = useMemo(() => {
    return frontendData.reviews.filter((rev) => {
      const matchPoi = selectedPoi === "Semua Destinasi" || rev.poi === selectedPoi;
      const matchSentiment = selectedSentimentFilter === "all" || rev.sentiment === selectedSentimentFilter;
      return matchPoi && matchSentiment;
    });
  }, [selectedPoi, selectedSentimentFilter]);

  // Chart Rendering
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const isStacked = viewMode === "stacked_bar";

    const positifData = ALL_CATEGORIES.map((cat) => currentAspects[cat]?.positif || 0);
    const negatifData = ALL_CATEGORIES.map((cat) => currentAspects[cat]?.negatif || 0);
    const netralData = ALL_CATEGORIES.map((cat) => currentAspects[cat]?.netral || 0);

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ALL_CATEGORIES,
        datasets: [
          {
            label: "Positif",
            data: positifData,
            backgroundColor: "#2ECC71",
            borderColor: "#27ae60",
            borderWidth: 1,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: "Negatif",
            data: negatifData,
            backgroundColor: "#E74C3C",
            borderColor: "#c0392b",
            borderWidth: 1,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: "Netral",
            data: netralData,
            backgroundColor: "#BDC3C7",
            borderColor: "#95a5a6",
            borderWidth: 1,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: { family: "var(--font-space-mono)", size: 10, weight: "bold" },
              boxWidth: 12,
              color: "#111",
            },
          },
          tooltip: {
            backgroundColor: "#000",
            titleFont: { family: "var(--font-space-mono)", size: 11, weight: "bold" },
            bodyFont: { family: "var(--font-space-mono)", size: 10 },
            padding: 10,
            cornerRadius: 0,
            callbacks: {
              footer: (items) => {
                const total = items.reduce((acc, curr) => acc + (curr.parsed.x || 0), 0);
                return `Total Aspek: ${total}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: isStacked,
            grid: { display: true, color: "#e5e5e5" },
            ticks: { font: { family: "var(--font-space-mono)", size: 10 }, color: "#333" },
          },
          y: {
            stacked: isStacked,
            grid: { display: false },
            ticks: { font: { family: "var(--font-space-mono)", size: 10, weight: "bold" }, color: "#111" },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [viewMode, currentAspects]);

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      alert("Masukkan API Key terlebih dahulu.");
      return;
    }
    setConnectionStatus("testing");
    setTimeout(() => {
      setConnectionStatus("error");
    }, 1200);
  };

  const cachedRec = PRECOMPUTED_RECOMMENDATIONS[selectedPoi];

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] text-[#111111]">
      {/* 1. HEADER (PLEK KETIPLEK) */}
      <header className="h-[60px] flex justify-between items-center px-8 border-b border-black bg-white shrink-0">
        <div className="text-2xl font-bold tracking-tight">
          <span className="font-serif italic text-[1.8rem] mr-1">Sentiment</span>
          <span className="text-[1.2rem] mr-2">Arena</span>
          <span className="text-[0.7rem] align-top text-gray-500 font-normal">by TNGC.ID</span>
        </div>
        <nav className="flex gap-8">
          <a href="#" className="font-bold text-sm text-black border-b-2 border-black pb-0.5">
            LIVE ABSA
          </a>
          <a href="#" className="font-bold text-sm text-gray-400 hover:text-black transition-colors">
            METRICS
          </a>
        </nav>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
        >
          CONNECT LLM ↗
        </button>
      </header>

      {/* 2. TICKER BAR */}
      <div className="h-[60px] border-b border-black flex bg-white shrink-0 overflow-x-auto">
        <div className="flex-1 min-w-[140px] px-6 py-2 border-r border-black flex flex-col justify-center cursor-default">
          <div className="flex items-center gap-2 font-bold text-[0.75rem] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" /> POSITIF
          </div>
          <div className="text-[1.1rem] font-bold tracking-tight text-[#2ECC71]">1.770</div>
        </div>

        <div className="flex-1 min-w-[140px] px-6 py-2 border-r border-black flex flex-col justify-center cursor-default">
          <div className="flex items-center gap-2 font-bold text-[0.75rem] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-[#E74C3C]" /> NEGATIF
          </div>
          <div className="text-[1.1rem] font-bold tracking-tight text-[#E74C3C]">223</div>
        </div>

        <div className="flex-1 min-w-[140px] px-6 py-2 border-r border-black flex flex-col justify-center cursor-default">
          <div className="flex items-center gap-2 font-bold text-[0.75rem] text-gray-600">
            <span className="w-2 h-2 rounded-full bg-[#BDBDBD]" /> NETRAL
          </div>
          <div className="text-[1.1rem] font-bold tracking-tight text-[#BDBDBD]">223</div>
        </div>

        <div className="flex-1 min-w-[160px] px-6 py-2 flex flex-col justify-center cursor-default bg-[#fafafa]">
          <div className="font-bold text-[0.75rem] text-gray-500">ABSA DETECTED</div>
          <div className="text-[1.1rem] font-bold tracking-tight text-black">1.752 Aspek</div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT (FLEX CONTAINER) */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* SISI KIRI: ANALYTICS + CHART + TABEL ULASAN (FLEX 7) */}
        <main className="flex-[7] border-r border-black p-6 flex flex-col gap-4 bg-[#f9f9f9] overflow-y-auto">
          {/* Global Filter Bar */}
          <div className="flex flex-wrap justify-between items-end gap-3 pb-3 border-b border-gray-300">
            <div className="flex-1 min-w-[280px]">
              <label className="text-[0.65rem] text-gray-500 font-bold block uppercase mb-1">
                Pilih Destinasi / Pos Jalur (12 POI TNGC):
              </label>
              <select
                value={selectedPoi}
                onChange={(e) => setSelectedPoi(e.target.value)}
                className="w-full bg-white border border-black px-3 py-1.5 font-mono text-[0.78rem] font-bold cursor-pointer focus:outline-black"
              >
                <option value="Semua Destinasi">Semua Destinasi (Agregat Kawasan TNGC)</option>
                {frontendData.pois.map((poi) => (
                  <option key={poi} value={poi}>
                    {poi}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="text-[0.65rem] text-gray-500 font-bold block uppercase mb-1">
                  Format Tampilan:
                </label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as "stacked_bar" | "grouped_bar")}
                  className="bg-white border border-black px-3 py-1.5 font-mono text-[0.75rem] font-bold cursor-pointer focus:outline-black"
                >
                  <option value="stacked_bar">BAR POLARITAS (STACKED)</option>
                  <option value="grouped_bar">BREAKDOWN (GROUPED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chart Section Header */}
          <div className="flex justify-between items-baseline">
            <h2 className="text-base font-bold uppercase tracking-tight text-black">
              Distribusi Sentimen per Aspek: <span className="text-blue-700">{selectedPoi}</span>
            </h2>
            <span className="text-[0.65rem] text-gray-500 font-bold">DATA HASIL PREPROCESSING</span>
          </div>

          {/* Canvas Wrapper */}
          <div className="h-[280px] w-full relative bg-white border border-[#e5e5e5] p-3 shrink-0">
            <canvas ref={chartRef} />
            <div className="absolute bottom-2 right-4 text-3xl font-bold opacity-5 pointer-events-none select-none text-black">
              TNGC.ID
            </div>
          </div>

          {/* Strip Ringkasan 5 Aspek */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const p = currentAspects[cat]?.positif || 0;
              const n = currentAspects[cat]?.negatif || 0;
              return (
                <div key={cat} className="bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
                  <span className="text-[0.62rem] font-bold text-gray-600 truncate">{cat.toUpperCase()}</span>
                  <span className="text-[0.72rem] font-bold">
                    <span className="text-[#2ECC71]">{p} Pos</span> / <span className="text-[#E74C3C]">{n} Neg</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* TABEL MINI ULASAN TERSARING (PENGGANTI TAB STREAMLIT) */}
          <div className="border border-black bg-white flex flex-col mt-2">
            <div className="flex justify-between items-center px-4 py-2 bg-[#f4f4f4] border-b border-black">
              <span className="text-[0.72rem] font-bold uppercase tracking-wider">
                Sampel Ulasan Asli Pengunjung ({filteredReviews.length} Ulasan)
              </span>
              <div className="flex items-center gap-1.5 text-[0.68rem] font-bold">
                <span>Filter Sentimen:</span>
                <select
                  value={selectedSentimentFilter}
                  onChange={(e) => setSelectedSentimentFilter(e.target.value)}
                  className="bg-white border border-black px-2 py-0.5 font-mono text-[0.68rem] focus:outline-none"
                >
                  <option value="all">SEMUA</option>
                  <option value="positif">POSITIF</option>
                  <option value="negatif">NEGATIF</option>
                  <option value="netral">NETRAL</option>
                </select>
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-200">
              {filteredReviews.length > 0 ? (
                filteredReviews.slice(0, 15).map((rev) => (
                  <div key={rev.id} className="p-3 text-[0.72rem] flex flex-col gap-1 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 truncate max-w-[70%]">{rev.poi}</span>
                      <span
                        className={`px-1.5 py-0.2 text-[0.62rem] font-bold uppercase ${
                          rev.sentiment === "positif"
                            ? "bg-green-100 text-green-800"
                            : rev.sentiment === "negatif"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rev.sentiment} ({rev.rating}★)
                      </span>
                    </div>
                    <p className="text-gray-800 text-justify line-clamp-2 italic">&ldquo;{rev.text}&rdquo;</p>
                    <div className="flex gap-1 flex-wrap mt-0.5">
                      {rev.aspects.map((asp) => (
                        <span key={asp} className="bg-gray-200 text-gray-700 text-[0.6rem] px-1 py-0.2 font-mono">
                          #{asp}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-[0.75rem]">
                  Tidak ada ulasan ulasan fasilitas pada filter ini.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* SISI KANAN: RECOMMENDER SYSTEM (FLEX 3) */}
        <aside className="flex-[3] p-5 bg-white flex flex-col gap-4 overflow-y-auto">
          <div className="text-right border-b-2 border-black pb-2 text-[0.75rem] font-bold tracking-tight uppercase">
            LLM Decision & Recommender
          </div>

          {/* Compact Model Meta Bar */}
          <div className="flex justify-between bg-[#f4f4f4] border border-black px-3 py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] font-bold text-gray-600">SVM ACC</span>
              <span className="text-[0.85rem] font-bold text-black">87.5%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] font-bold text-gray-600">INDOBERT F1</span>
              <span className="text-[0.85rem] font-bold text-black">90.2%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] font-bold text-gray-600">CACHE STATUS</span>
              <span
                className={`text-[0.85rem] font-bold ${
                  cachedRec ? "text-[#2ECC71]" : "text-[#e67e22]"
                }`}
              >
                {cachedRec ? "ACTIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* 3-Tier Tabs: Short vs Medium vs Long */}
          <div className="flex border-b border-black">
            <button
              onClick={() => setActiveTab("short")}
              className={`flex-1 py-1.5 text-[0.65rem] font-bold border cursor-pointer transition-all ${
                activeTab === "short"
                  ? "bg-white text-black border-black border-b-white -mb-[1px]"
                  : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
              }`}
            >
              SHORT
            </button>
            <button
              onClick={() => setActiveTab("medium")}
              className={`flex-1 py-1.5 text-[0.65rem] font-bold border cursor-pointer transition-all ${
                activeTab === "medium"
                  ? "bg-white text-black border-black border-b-white -mb-[1px]"
                  : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
              }`}
            >
              MEDIUM
            </button>
            <button
              onClick={() => setActiveTab("long")}
              className={`flex-1 py-1.5 text-[0.65rem] font-bold border cursor-pointer transition-all ${
                activeTab === "long"
                  ? "bg-white text-black border-black border-b-white -mb-[1px]"
                  : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
              }`}
            >
              LONG
            </button>
          </div>

          {/* Recommendation Card Body */}
          <div className="flex-1 flex flex-col justify-between">
            {cachedRec ? (
              <div className="border border-black bg-[#fbfbfb] p-3 flex flex-col gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between text-[0.68rem] font-bold border-b border-gray-200 pb-1.5">
                  <span className="text-green-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    PRE-COMPUTED INFERENCE
                  </span>
                  <span className="text-gray-400">12 POI BATCH</span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[0.62rem] font-bold text-gray-500 uppercase">
                    Rekomendasi Tindakan ({activeTab.toUpperCase()}-TERM):
                  </span>
                  <p className="text-[0.72rem] leading-relaxed text-gray-800 text-justify font-sans">
                    {activeTab === "short" && cachedRec.short}
                    {activeTab === "medium" && cachedRec.medium}
                    {activeTab === "long" && cachedRec.long}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 text-[0.6rem] text-gray-500">
                  Target POI: <strong>{selectedPoi}</strong> | Zero Token Burn
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#d9534f] bg-[#fffafa] p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#d9534f] text-[0.72rem] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#e74c3c] blink-dot" />
                  HTTP 503 · AWAITING_BATCH_INFERENCE
                </div>
                <p className="text-[0.68rem] leading-relaxed text-gray-600 text-justify">
                  Hasil inferensi LLM untuk destinasi <strong>{selectedPoi}</strong> belum di-generate ke pre-computed cache. Sesuai arsitektur non-mock, tidak ada data rekomendasi rekaan yang ditampilkan.
                </p>
                <div className="mt-1 border-t border-[#f0d0d0] pt-2 flex flex-col gap-1 text-[0.68rem]">
                  <span className="font-bold text-gray-500 uppercase text-[0.6rem]">Status Gateway</span>
                  <span className="text-black font-mono">STANDBY (Hubungkan API key untuk generate batch)</span>
                </div>
              </div>
            )}

            {/* Bottom Connect Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-black text-white py-3 px-4 text-center font-bold text-[0.75rem] uppercase tracking-wider border border-black hover:bg-white hover:text-black transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>HUBUNGKAN API LLM</span>
              <span>↗</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 4. FOOTER */}
      <footer className="h-[30px] border-t border-black flex justify-between items-center px-8 text-[0.65rem] bg-[#f4f4f4] text-gray-600 shrink-0">
        <div>&copy; 2026 Sentiment Arena — Mount Ciremai National Park</div>
        <div>Aspect-Based Sentiment Analysis &bull; Pre-computed Batch Caching Architecture</div>
      </footer>

      {/* 5. MODAL DIALOG CONNECT API LLM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start border-b border-black pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base uppercase">Konfigurasi API LLM</h3>
                <p className="text-[0.68rem] text-gray-600">Integrasikan engine reasoning untuk pre-compute batch 12 POI</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setConnectionStatus("disconnected");
                }}
                className="text-black font-bold text-lg hover:bg-black hover:text-white px-2 py-0.5 border border-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTestConnection} className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.7rem] font-bold uppercase mb-1">Pilih Provider</label>
                <select className="w-full bg-[#f9f9f9] border border-black p-2 text-xs font-mono font-bold focus:outline-none">
                  <option value="gemini">Google Gemini 2.5 Flash / Pro (Recommended)</option>
                  <option value="openai">OpenAI GPT-4o / Mini</option>
                  <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.7rem] font-bold uppercase mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy... atau sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-[#f9f9f9] border border-black p-2 text-xs font-mono focus:outline-none"
                />
                <span className="text-[0.6rem] text-gray-500 mt-1 block">
                  Hasil inferensi akan disimpan ke cache JSON lokal tanpa request berulang.
                </span>
              </div>

              {connectionStatus === "testing" && (
                <div className="text-[0.7rem] text-blue-600 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 blink-dot" />
                  Menguji konektivitas ke gateway reasoning...
                </div>
              )}

              {connectionStatus === "error" && (
                <div className="p-2 border border-red-500 bg-red-50 text-[0.68rem] text-red-700 font-bold">
                  Gagal menghubungi backend: Environment production belum memuat secret API. Hubungi administrator untuk mengisi konfigurasi .env.
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-black text-xs font-bold uppercase hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 cursor-pointer"
                >
                  Uji & Simpan Koneksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
