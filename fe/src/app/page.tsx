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

interface RecommendationData {
  summary?: string;
  short_term: string[];
  medium_term: string[];
  long_term: string[];
  provider?: string;
  generated_at?: string;
  focused_aspect?: string;
}

// LocalStorage cache key
const CACHE_STORAGE_KEY = "SA_TNGC_RECOMMENDATION_CACHE_V2";

export default function SentimentArenaStudio() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Nav Views: "absa" | "metrics" | "about"
  const [activeView, setActiveView] = useState<"absa" | "metrics" | "about">("absa");

  // States
  const [selectedPoi, setSelectedPoi] = useState<string>("Semua Destinasi");
  const [selectedAspect, setSelectedAspect] = useState<string>("Semua Aspek");
  const [viewMode, setViewMode] = useState<"stacked_bar" | "grouped_bar">("stacked_bar");
  const [activeTab, setActiveTab] = useState<"short" | "medium" | "long">("short");
  const [selectedSentimentFilter, setSelectedSentimentFilter] = useState<string>("all");
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  
  // LLM Recommendation State
  const [recommendationsMap, setRecommendationsMap] = useState<Record<string, RecommendationData>>({});
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Inisialisasi Cache dari LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CACHE_STORAGE_KEY);
      if (saved) {
        setRecommendationsMap(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Gagal membaca cache lokal:", e);
    }
  }, []);

  const updateCache = (key: string, data: RecommendationData) => {
    setRecommendationsMap((prev) => {
      const updated = { ...prev, [key]: data };
      try {
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Gagal menyimpan ke cache lokal:", e);
      }
      return updated;
    });
  };

  // Filtered Aspects Data
  const currentAspects = useMemo(() => {
    if (selectedPoi === "Semua Destinasi") {
      return frontendData.global_aspects as Record<string, { positif: number; negatif: number; netral: number }>;
    }
    return ((frontendData.poi_aspects as Record<string, Record<string, { positif: number; negatif: number; netral: number }>>)[selectedPoi]) || frontendData.global_aspects;
  }, [selectedPoi]);

  // Filtered Reviews Data
  const filteredReviews = useMemo(() => {
    return frontendData.reviews.filter((rev) => {
      const matchPoi = selectedPoi === "Semua Destinasi" || rev.poi === selectedPoi;
      const matchSentiment = selectedSentimentFilter === "all" || rev.sentiment === selectedSentimentFilter;
      const matchAspect = selectedAspect === "Semua Aspek" || rev.aspects.includes(selectedAspect);
      return matchPoi && matchSentiment && matchAspect;
    });
  }, [selectedPoi, selectedSentimentFilter, selectedAspect]);

  // Cache Key Komposit: [POI]__[ASPEK]
  const currentCacheKey = `${selectedPoi}__${selectedAspect}`;
  const activeRecommendation = recommendationsMap[currentCacheKey];

  // Chart Rendering (Hanya saat activeView === "absa")
  useEffect(() => {
    if (activeView !== "absa") return;
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
  }, [activeView, viewMode, currentAspects]);

  // Handler: Generate / Refresh Rekomendasi Terarah (POI + Aspek)
  const handleRefreshRecommendation = async () => {
    setIsRefreshing(true);
    setApiErrorMessage(null);

    try {
      const targetPoi = selectedPoi === "Semua Destinasi" 
        ? "Taman Nasional Gunung Ciremai (Pusat Balai TNGC)" 
        : selectedPoi;

      const sampleReviews = filteredReviews.slice(0, 8).map((r) => ({
        text: r.text,
        sentiment: r.sentiment,
      }));

      const res = await fetch("/api/llm/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poi_name: targetPoi,
          focused_aspect: selectedAspect,
          aspects: currentAspects,
          sample_reviews: sampleReviews,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const { recommendations, provider, generated_at, focused_aspect, summary } = json.data;
        const newRec: RecommendationData = {
          ...recommendations,
          summary,
          provider,
          generated_at,
          focused_aspect,
        };
        updateCache(currentCacheKey, newRec);
      } else {
        setApiErrorMessage(json.error?.message || "Gagal mendapatkan rekomendasi dari model LLM.");
      }
    } catch (err: any) {
      setApiErrorMessage(err?.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper untuk list items aktif
  const currentItems = useMemo(() => {
    if (!activeRecommendation) return [];
    if (activeTab === "short") return activeRecommendation.short_term || [];
    if (activeTab === "medium") return activeRecommendation.medium_term || [];
    return activeRecommendation.long_term || [];
  }, [activeRecommendation, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] text-[#111111]">
      {/* 1. HEADER DENGAN 3 TAB RESMI */}
      <header className="h-[60px] flex justify-between items-center px-8 border-b border-black bg-white shrink-0">
        <div className="text-2xl font-bold tracking-tight">
          <span className="font-serif italic text-[1.8rem] mr-1">Aspect</span>
          <span className="text-[1.2rem] mr-2">Sentiment</span>
          <span className="text-[0.7rem] align-top text-gray-500 font-normal">TNGC Research</span>
        </div>
        
        {/* Navigasi 3 Panel Utama */}
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveView("absa")}
            className={`font-bold text-sm cursor-pointer pb-0.5 transition-all ${
              activeView === "absa" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"
            }`}
          >
            ANALISIS ABSA
          </button>
          <button
            onClick={() => setActiveView("metrics")}
            className={`font-bold text-sm cursor-pointer pb-0.5 transition-all ${
              activeView === "metrics" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"
            }`}
          >
            METRIK MODEL
          </button>
          <button
            onClick={() => setActiveView("about")}
            className={`font-bold text-sm cursor-pointer pb-0.5 transition-all ${
              activeView === "about" ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-black"
            }`}
          >
            PROFIL PENELITIAN
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {activeView === "absa" && (
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="text-[0.68rem] font-bold border border-black px-2.5 py-1 hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              {isSidebarVisible ? "SEMBUNYIKAN PANEL" : "TAMPILKAN PANEL"}
            </button>
          )}
          <span className="text-[0.68rem] font-bold text-green-700 bg-green-50 border border-green-300 px-2 py-1">
            GEMINI 3.1 FLASH LITE
          </span>
        </div>
      </header>

      {/* 2. TICKER BAR KORPUS EMPIRIS */}
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
          <div className="font-bold text-[0.75rem] text-gray-500">TOTAL DATASET RISSET</div>
          <div className="text-[1.1rem] font-bold tracking-tight text-black">2.216 Ulasan</div>
        </div>
      </div>

      {/* 3. MAIN CONTENT SESUAI ACTIVE VIEW */}
      {activeView === "absa" && (
        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* SISI KIRI: ANALYTICS + CHART + TABEL ULASAN */}
          <main className={`p-6 flex flex-col gap-4 bg-[#f9f9f9] overflow-y-auto transition-all ${isSidebarVisible ? "flex-[7] border-r border-black" : "flex-1"}`}>
            {/* Global Filter Bar */}
            <div className="flex flex-wrap justify-between items-end gap-3 pb-3 border-b border-gray-300">
              <div className="flex-1 min-w-[280px]">
                <label className="text-[0.65rem] text-gray-500 font-bold block uppercase mb-1">
                  1. Pilih Destinasi / ODTWA (12 Titik Kawasan TNGC):
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
                    Format Visual:
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
              <div>
                <h2 className="text-base font-bold uppercase tracking-tight text-black">
                  Distribusi Sentimen Aspek: <span className="text-blue-700">{selectedPoi}</span>
                </h2>
                <span className="text-[0.68rem] text-gray-500">
                  Pilih kartu aspek di bawah untuk mengarahkan fokus rekomendasi tindakan.
                </span>
              </div>
              <span className="text-[0.65rem] text-gray-500 font-bold">FOKUS: {selectedAspect.toUpperCase()}</span>
            </div>

            {/* Canvas Wrapper */}
            <div className="h-[260px] w-full relative bg-white border border-[#e5e5e5] p-3 shrink-0">
              <canvas ref={chartRef} />
              <div className="absolute bottom-2 right-4 text-3xl font-bold opacity-5 pointer-events-none select-none text-black">
                TNGC.ID
              </div>
            </div>

            {/* INTERAKTIF: STRIP RINGKASAN 5 ASPEK */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[0.65rem] font-bold text-gray-500 uppercase">
                <span>Filter Fokus Aspek Operasional:</span>
                {selectedAspect !== "Semua Aspek" && (
                  <button
                    onClick={() => setSelectedAspect("Semua Aspek")}
                    className="text-blue-700 hover:underline cursor-pointer"
                  >
                    Reset ke Semua Aspek
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const p = currentAspects[cat]?.positif || 0;
                  const n = currentAspects[cat]?.negatif || 0;
                  const isSelected = selectedAspect === cat;

                  return (
                    <div
                      key={cat}
                      onClick={() => setSelectedAspect(isSelected ? "Semua Aspek" : cat)}
                      className={`p-2 flex flex-col gap-0.5 cursor-pointer border transition-all ${
                        isSelected
                          ? "bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-[1.02]"
                          : "bg-white border-gray-300 hover:border-black text-[#111]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`text-[0.6rem] font-bold truncate ${isSelected ? "text-gray-200" : "text-gray-600"}`}>
                          {cat.toUpperCase()}
                        </span>
                        {isSelected && <span className="text-[0.6rem] text-green-400 font-bold">●</span>}
                      </div>
                      <span className="text-[0.72rem] font-bold">
                        <span className={isSelected ? "text-green-300" : "text-[#2ECC71]"}>{p} Pos</span>
                        {" / "}
                        <span className={isSelected ? "text-red-300" : "text-[#E74C3C]"}>{n} Neg</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TABEL MINI ULASAN TERSARING */}
            <div className="border border-black bg-white flex flex-col mt-1">
              <div className="flex justify-between items-center px-4 py-2 bg-[#f4f4f4] border-b border-black">
                <span className="text-[0.72rem] font-bold uppercase tracking-wider">
                  Sampel Ulasan Pengunjung ({filteredReviews.length} Ulasan)
                  {selectedAspect !== "Semua Aspek" && ` [Aspek: ${selectedAspect}]`}
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

              <div className="max-h-[200px] overflow-y-auto divide-y divide-gray-200">
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
                      <p className="text-gray-800 text-justify line-clamp-2 italic font-sans">&ldquo;{rev.text}&rdquo;</p>
                      <div className="flex gap-1 flex-wrap mt-0.5">
                        {rev.aspects.map((asp) => (
                          <span key={asp} className={`text-[0.6rem] px-1 py-0.2 font-mono ${asp === selectedAspect ? "bg-black text-white font-bold" : "bg-gray-200 text-gray-700"}`}>
                            #{asp}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-[0.75rem]">
                    Tidak ada ulasan fasilitas pada kriteria filter ini.
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* SISI KANAN: RECOMMENDER SYSTEM */}
          {isSidebarVisible && (
            <aside className="flex-[3] p-5 bg-white flex flex-col gap-4 overflow-y-auto border-t lg:border-t-0 border-black">
              <div className="flex justify-between items-center border-b-2 border-black pb-2">
                <span className="text-[0.75rem] font-bold tracking-tight uppercase">
                  Rekomendasi Kebijakan
                </span>
                <button
                  onClick={() => setIsSidebarVisible(false)}
                  className="text-[0.65rem] text-gray-500 hover:text-black cursor-pointer font-bold"
                  title="Sembunyikan panel rekomendasi"
                >
                  [TUTUP]
                </button>
              </div>

              {/* Target Context Box */}
              <div className="bg-[#f4f4f4] border border-black p-3 flex flex-col gap-1.5 text-[0.72rem]">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 font-bold uppercase text-[0.62rem]">Kawasan:</span>
                  <span className="font-bold text-black text-right max-w-[180px] leading-tight font-sans">
                    {selectedPoi}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[0.62rem]">Fokus Aspek:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 border border-blue-200">
                    {selectedAspect}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-300 pt-1.5 mt-0.5">
                  <span className="text-gray-500 font-bold uppercase text-[0.62rem]">Status Memori:</span>
                  <span className={`font-bold text-[0.68rem] ${activeRecommendation ? "text-green-700" : "text-amber-700"}`}>
                    {activeRecommendation ? "TERSEDIA DI BROWSER" : "BELUM DI-GENERATE"}
                  </span>
                </div>
              </div>

              {/* 3-Tier Tabs: Short vs Medium vs Long */}
              <div className="flex border-b border-black">
                <button
                  onClick={() => setActiveTab("short")}
                  className={`flex-1 py-1.5 text-[0.68rem] font-bold border cursor-pointer transition-all ${
                    activeTab === "short"
                      ? "bg-white text-black border-black border-b-white -mb-[1px]"
                      : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
                  }`}
                >
                  SHORT-TERM
                </button>
                <button
                  onClick={() => setActiveTab("medium")}
                  className={`flex-1 py-1.5 text-[0.68rem] font-bold border cursor-pointer transition-all ${
                    activeTab === "medium"
                      ? "bg-white text-black border-black border-b-white -mb-[1px]"
                      : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
                  }`}
                >
                  MEDIUM-TERM
                </button>
                <button
                  onClick={() => setActiveTab("long")}
                  className={`flex-1 py-1.5 text-[0.68rem] font-bold border cursor-pointer transition-all ${
                    activeTab === "long"
                      ? "bg-white text-black border-black border-b-white -mb-[1px]"
                      : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
                  }`}
                >
                  LONG-TERM
                </button>
              </div>

              {/* Recommendation Card Body */}
              <div className="flex-1 flex flex-col justify-between">
                {activeRecommendation ? (
                  <div className="border border-black bg-[#fbfbfb] p-3.5 flex flex-col gap-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between text-[0.68rem] font-bold border-b border-gray-200 pb-1.5">
                      <span className="text-green-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        GEMINI 3.1 FLASH LITE
                      </span>
                      <span className="text-gray-400 font-mono text-[0.6rem]">
                        {activeRecommendation.generated_at ? new Date(activeRecommendation.generated_at).toLocaleTimeString() : "CACHED"}
                      </span>
                    </div>

                    {activeRecommendation.summary && (
                      <div className="bg-amber-50 border-l-2 border-amber-500 p-2 text-[0.72rem] text-amber-900 font-sans leading-relaxed">
                        <strong>Urgensi:</strong> {activeRecommendation.summary}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <span className="text-[0.65rem] font-bold text-gray-600 uppercase tracking-wider">
                        Langkah Tindakan ({activeTab.toUpperCase()}-TERM):
                      </span>

                      <ul className="flex flex-col gap-2 font-sans">
                        {currentItems.length > 0 ? (
                          currentItems.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-gray-800">
                              <span className="bg-black text-white text-[0.65rem] font-bold font-mono px-1.5 py-0.2 shrink-0 rounded-xs mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-justify font-normal">{step}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-[0.72rem] text-gray-500 italic">
                            Tidak ada langkah tindakan tersimpan untuk jenjang ini.
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-200 text-[0.62rem] text-gray-500 flex justify-between font-mono">
                      <span>Fokus: <strong>{activeRecommendation.focused_aspect || selectedAspect}</strong></span>
                      <span className="text-green-700 font-bold">Tersimpan di Memori</span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[#d9534f] bg-[#fffafa] p-3 flex flex-col gap-2 font-sans">
                    <div className="flex items-center gap-2 text-[#d9534f] text-[0.72rem] font-bold font-mono">
                      <span className="w-2 h-2 rounded-full bg-[#e74c3c] blink-dot" />
                      STATUS: BELUM DI-GENERATE
                    </div>
                    <p className="text-[0.74rem] leading-relaxed text-gray-700 text-justify">
                      Belum ada rekomendasi untuk <strong>{selectedPoi}</strong> pada aspek <strong>{selectedAspect}</strong>.
                      <br /><br />
                      Klik tombol di bawah untuk memicu penalaran Gemini dan menyimpannya secara otomatis ke memori browser Anda.
                    </p>
                  </div>
                )}

                {apiErrorMessage && (
                  <div className="mt-2 p-2 border border-red-500 bg-red-50 text-[0.72rem] text-red-700 font-bold font-sans">
                    Error: {apiErrorMessage}
                  </div>
                )}

                {/* Bottom Refresh Recommendation Button */}
                <button
                  onClick={handleRefreshRecommendation}
                  disabled={isRefreshing}
                  className={`mt-4 py-3 px-4 text-center font-bold text-[0.75rem] uppercase tracking-wider border border-black transition-all cursor-pointer flex items-center justify-center gap-2 font-mono ${
                    isRefreshing
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-black text-white hover:bg-white hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  }`}
                >
                  {isRefreshing ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-600 blink-dot" />
                      <span>MEMPROSES PENALARAN GEMINI...</span>
                    </>
                  ) : (
                    <span>
                      {activeRecommendation ? "REFRESH / RE-GENERATE REKOMENDASI" : "GENERATE REKOMENDASI TINDAKAN"} [POST]
                    </span>
                  )}
                </button>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* VIEW 2: METRIK EVALUASI & KOMPARASI MODEL */}
      {activeView === "metrics" && (
        <div className="flex-1 p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          <div className="border-b-2 border-black pb-3 mb-6 flex justify-between items-baseline">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Komparasi Performa Model Skripsi</h2>
              <p className="text-xs text-gray-600 font-sans mt-0.5">
                Evaluasi model klasifikasi sentimen berbasis data ulasan ulasan fasilitas TNGC (Uji Test Split 20%).
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-black text-white px-2.5 py-1">ZERO DATA LEAKAGE</span>
          </div>

          {/* Grid Metrik Utama */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="border border-black bg-white p-4">
              <span className="text-[0.65rem] text-gray-500 font-bold uppercase block">IndoBERT (Fine-Tuned)</span>
              <div className="text-3xl font-bold text-blue-700 mt-1">90.2%</div>
              <span className="text-[0.68rem] text-gray-600 mt-1 block">Macro F1: <strong>0.784</strong> | Transformer</span>
            </div>

            <div className="border border-black bg-white p-4">
              <span className="text-[0.65rem] text-gray-500 font-bold uppercase block">Linear SVM + SMOTE</span>
              <div className="text-3xl font-bold text-black mt-1">87.5%</div>
              <span className="text-[0.68rem] text-gray-600 mt-1 block">Macro F1: <strong>0.569</strong> | Baseline ML</span>
            </div>

            <div className="border border-black bg-white p-4">
              <span className="text-[0.65rem] text-gray-500 font-bold uppercase block">Logistic Regression</span>
              <div className="text-3xl font-bold text-black mt-1">86.1%</div>
              <span className="text-[0.68rem] text-gray-600 mt-1 block">Macro F1: <strong>0.602</strong> | Linear Model</span>
            </div>

            <div className="border border-black bg-white p-4">
              <span className="text-[0.65rem] text-gray-500 font-bold uppercase block">Random Forest</span>
              <div className="text-3xl font-bold text-black mt-1">82.3%</div>
              <span className="text-[0.68rem] text-gray-600 mt-1 block">Macro F1: <strong>0.367</strong> | Ensemble Tree</span>
            </div>
          </div>

          {/* Tabel Perbandingan Lengkap */}
          <div className="border border-black bg-white mb-8">
            <div className="bg-[#f4f4f4] px-4 py-3 border-b border-black font-bold text-xs uppercase">
              Tabel Komparasi Ilmiah Seluruh Algoritma Pengujian
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#fbfbfb] border-b border-gray-300 font-mono text-gray-600 uppercase text-[0.68rem]">
                  <tr>
                    <th className="p-3">Algoritma / Arsitektur</th>
                    <th className="p-3">Representasi Fitur</th>
                    <th className="p-3">Penyeimbang (Sampling)</th>
                    <th className="p-3">Akurasi</th>
                    <th className="p-3">Macro F1-Score</th>
                    <th className="p-3">Karakteristik Komputasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-sans">
                  <tr className="bg-blue-50/50 font-bold">
                    <td className="p-3 font-mono">IndoBERT Base (p1)</td>
                    <td className="p-3">Contextual Embeddings (768-d)</td>
                    <td className="p-3">Cross-Entropy Weighted</td>
                    <td className="p-3 text-blue-700">90.2%</td>
                    <td className="p-3 text-blue-700">0.784</td>
                    <td className="p-3 text-gray-600 font-normal">GPU CUDA PyTorch (Akselerasi RTX 3050)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold">Linear SVM</td>
                    <td className="p-3">TF-IDF (Unigram + Bigram)</td>
                    <td className="p-3">SMOTE (Train Set Only)</td>
                    <td className="p-3">87.5%</td>
                    <td className="p-3">0.569</td>
                    <td className="p-3 text-gray-600">Sangat Cepat (&lt;1s), Margin Maksimal</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold">Logistic Regression</td>
                    <td className="p-3">TF-IDF (Unigram + Bigram)</td>
                    <td className="p-3">SMOTE (Train Set Only)</td>
                    <td className="p-3">86.1%</td>
                    <td className="p-3">0.602</td>
                    <td className="p-3 text-gray-600">Probabilistik, Cepat</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold">Random Forest</td>
                    <td className="p-3">TF-IDF (2.500 Features)</td>
                    <td className="p-3">SMOTE (Train Set Only)</td>
                    <td className="p-3">82.3%</td>
                    <td className="p-3">0.367</td>
                    <td className="p-3 text-gray-600">100 Trees, Cenderung Overfit Sparse</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Penjelasan Validitas Ilmiah */}
          <div className="border border-black bg-[#fafafa] p-5 font-sans leading-relaxed text-xs">
            <h3 className="font-bold text-sm uppercase font-mono mb-2">Catatan Metodologi & Pencegahan Data Leakage</h3>
            <p className="text-gray-700 mb-2 text-justify">
              1. <strong>TF-IDF & SMOTE</strong>: Diterapkan murni hanya pada data latih (<code>X_train</code>). Data pengujian (<code>X_test</code>) diisolasi 100% dan tidak pernah disentuh proses over-sampling untuk menjamin keaslian metrik evaluasi.
            </p>
            <p className="text-gray-700 text-justify">
              2. <strong>Mengapa Macro F1-Score?</strong>: Karena distribusi ulasan fasilitas bersifat timpang (Positif mendominasi ~80%), metrik akurasi dapat mengalami <em>accuracy paradox</em>. Macro F1-Score memberikan bobot yang setara untuk kelas keluhan (negatif) yang kritis bagi pengelola TNGC.
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: PROFIL PENELITIAN / DATA MAHASISWA */}
      {activeView === "about" && (
        <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="border-b-2 border-black pb-3 mb-6">
            <h2 className="text-xl font-bold uppercase tracking-tight">Informasi & Metadata Penelitian Skripsi</h2>
            <p className="text-xs text-gray-600 font-sans mt-0.5">
              Identitas peneliti, institusi akademik, dan ringkasan arsitektur sistem.
            </p>
          </div>

          {/* Kartu Profil Peneliti */}
          <div className="border border-black bg-white p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-4 border-b border-gray-200 pb-2">
              Identitas Peneliti
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs">
              <div>
                <span className="text-gray-500 font-mono text-[0.68rem] block uppercase">Nama Mahasiswa / Peneliti</span>
                <span className="font-bold text-sm text-black">Hari Inaka Hermawan</span>
              </div>

              <div>
                <span className="text-gray-500 font-mono text-[0.68rem] block uppercase">Nomor Induk Mahasiswa (NIM)</span>
                <span className="font-mono text-gray-400 italic">[Dalam Konfirmasi]</span>
              </div>

              <div>
                <span className="text-gray-500 font-mono text-[0.68rem] block uppercase">Program Studi</span>
                <span className="font-bold text-black">Sistem Informasi</span>
              </div>

              <div>
                <span className="text-gray-500 font-mono text-[0.68rem] block uppercase">Institusi Perguruan Tinggi</span>
                <span className="font-bold text-black">Universitas Kuningan (UNIKU)</span>
              </div>

              <div className="md:col-span-2">
                <span className="text-gray-500 font-mono text-[0.68rem] block uppercase">Dosen Pembimbing</span>
                <span className="font-mono text-gray-400 italic">[Dalam Konfirmasi]</span>
              </div>
            </div>
          </div>

          {/* Kartu Judul Penelitian Resmi */}
          <div className="border border-black bg-white p-6 mb-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-3 border-b border-gray-200 pb-2">
              Judul Penelitian Skripsi (Tentatif)
            </h3>
            <p className="font-serif italic text-base text-gray-900 leading-relaxed font-bold">
              &ldquo;Analisis Sentimen Berbasis Aspek (Aspect-Based Sentiment Analysis) Ulasan Pengunjung Taman Nasional Gunung Ciremai Menggunakan Machine Learning dan Deep Learning sebagai Dasar Rekomendasi Pengelolaan Kawasan Konservasi&rdquo;
            </p>
          </div>

          {/* Batasan Masalah & Lingkup Penelitian */}
          <div className="border border-black bg-[#fafafa] p-6 text-xs font-sans leading-relaxed">
            <h3 className="font-bold text-xs uppercase font-mono mb-3 border-b border-gray-300 pb-2">
              Batasan Masalah & Lingkup Kajian
            </h3>
            <ul className="list-disc list-inside flex flex-col gap-2 text-gray-700">
              <li>
                <strong>Sumber Data</strong>: 2.216 ulasan publik Google Maps yang dikumpulkan dari 12 Objek Daya Tarik Wisata Alam (ODTWA) dan jalur pendakian resmi Balai TNGC (Palutungan, Linggarjati, Apuy, Sadarehe, Ipukan, Tenjo Laut, Situ Sangiang, dll.).
              </li>
              <li>
                <strong>Filter Dua Tahap (Two-Stage Filtering)</strong>: Mengeliminasi ulasan pujian estetika alam murni (1.080 ulasan) agar menyisakan ulasan operasional/fasilitas riil (1.136 ulasan) demi menghindari bias kepuasan semu.
              </li>
              <li>
                <strong>Domain Aspek</strong>: Dibatasi pada 5 aspek fasilitas fisik & manajerial: Fasilitas Sanitasi, Biaya & Logistik, Jalur & Trek, Pelayanan Petugas, dan Sampah & Kebersihan.
              </li>
              <li>
                <strong>Arsitektur Rekomendasi</strong>: Machine Learning mengekstraksi sentimen per aspek secara murni (Pure ABSA), sedangkan rekomendasi tindakan 3 jenjang waktu (Short, Medium, Long-Term) dirumuskan oleh engine Large Language Model (Gemini 3.1 Flash Lite) dengan pedoman ketat anti-halusinasi (*strict grounding*).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 4. FOOTER */}
      <footer className="h-[30px] border-t border-black flex justify-between items-center px-8 text-[0.65rem] bg-[#f4f4f4] text-gray-600 shrink-0">
        <div>&copy; 2026 Mount Ciremai National Park (TNGC) &bull; Peneliti: Hari Inaka Hermawan (Sistem Informasi - Universitas Kuningan)</div>
        <div>Google Gemini 3.1 Flash Lite &bull; Structured Step-by-Step Actions &bull; Dynamic Scope Sizing</div>
      </footer>
    </div>
  );
}
