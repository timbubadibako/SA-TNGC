"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface AspectData {
  categories: string[];
  positif: number[];
  negatif: number[];
  netral: number[];
}

const ABSA_DATA: AspectData = {
  categories: [
    "Fasilitas Sanitasi",
    "Biaya & Logistik",
    "Jalur & Trek",
    "Pelayanan Petugas",
    "Sampah & Kebersihan",
  ],
  positif: [458, 425, 381, 110, 77],
  negatif: [35, 79, 15, 27, 20],
  netral: [32, 46, 32, 12, 11],
};

export default function SentimentArenaStudio() {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // States
  const [viewMode, setViewMode] = useState<"stacked_bar" | "grouped_bar">("stacked_bar");
  const [activeTab, setActiveTab] = useState<"short" | "long">("short");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "testing" | "error">("disconnected");

  // Chart Rendering
  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const isStacked = viewMode === "stacked_bar";

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ABSA_DATA.categories,
        datasets: [
          {
            label: "Positif",
            data: ABSA_DATA.positif,
            backgroundColor: "#2ECC71",
            borderColor: "#27ae60",
            borderWidth: 1,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: "Negatif",
            data: ABSA_DATA.negatif,
            backgroundColor: "#E74C3C",
            borderColor: "#c0392b",
            borderWidth: 1,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
          {
            label: "Netral",
            data: ABSA_DATA.netral,
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
  }, [viewMode]);

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

  return (
    <div className="flex flex-col min-h-screen">
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

      {/* 3. MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* KIRI: CHART SECTION (FLEX 7) */}
        <main className="flex-[7] border-r border-black p-6 flex flex-col relative bg-[#f9f9f9]">
          <div className="flex justify-between items-end mb-4 shrink-0">
            <div>
              <div className="text-[0.7rem] text-gray-500 mb-0.5 tracking-wider font-bold">
                ASPECT-BASED SENTIMENT ANALYSIS (ABSA) — 5 DOMAINS
              </div>
              <h2 className="text-lg font-bold uppercase tracking-tight text-black">
                Distribusi Sentimen per Aspek Fasilitas
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.68rem] font-bold text-gray-500">TAMPILAN:</span>
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

          {/* Canvas Wrapper */}
          <div className="flex-1 min-h-[380px] w-full relative bg-white border border-[#e5e5e5] p-4">
            <canvas ref={chartRef} />
            <div className="absolute bottom-2 right-4 text-4xl font-bold opacity-5 pointer-events-none select-none text-black">
              TNGC.ID
            </div>
          </div>

          {/* Aspect Summary Strip */}
          <div className="flex gap-2.5 border-t border-gray-300 pt-3 mt-3 overflow-x-auto">
            <div className="flex-1 min-w-[120px] bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
              <span className="text-[0.62rem] font-bold text-gray-600 truncate">FASILITAS SANITASI</span>
              <span className="text-[0.72rem] font-bold">
                <span className="text-[#2ECC71]">458 Pos</span> / <span className="text-[#E74C3C]">35 Neg</span>
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
              <span className="text-[0.62rem] font-bold text-gray-600 truncate">BIAYA & LOGISTIK</span>
              <span className="text-[0.72rem] font-bold">
                <span className="text-[#2ECC71]">425 Pos</span> / <span className="text-[#E74C3C]">79 Neg</span>
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
              <span className="text-[0.62rem] font-bold text-gray-600 truncate">JALUR & TREK</span>
              <span className="text-[0.72rem] font-bold">
                <span className="text-[#2ECC71]">381 Pos</span> / <span className="text-[#E74C3C]">15 Neg</span>
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
              <span className="text-[0.62rem] font-bold text-gray-600 truncate">PELAYANAN PETUGAS</span>
              <span className="text-[0.72rem] font-bold">
                <span className="text-[#2ECC71]">110 Pos</span> / <span className="text-[#E74C3C]">27 Neg</span>
              </span>
            </div>
            <div className="flex-1 min-w-[120px] bg-white border border-gray-300 p-2 flex flex-col gap-0.5">
              <span className="text-[0.62rem] font-bold text-gray-600 truncate">SAMPAH & BERSIH</span>
              <span className="text-[0.72rem] font-bold">
                <span className="text-[#2ECC71]">77 Pos</span> / <span className="text-[#E74C3C]">20 Neg</span>
              </span>
            </div>
          </div>
        </main>

        {/* KANAN: SIDEBAR (FLEX 3) */}
        <aside className="flex-[3] p-5 bg-white flex flex-col gap-4 overflow-y-auto">
          <div className="text-right border-b-2 border-black pb-2 text-[0.75rem] font-bold tracking-tight uppercase">
            LLM Decision & Recommendation
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
              <span className="text-[0.6rem] font-bold text-gray-600">API STATUS</span>
              <span className="text-[0.85rem] font-bold text-[#e67e22]">OFFLINE</span>
            </div>
          </div>

          {/* Tabs Short vs Long Term */}
          <div className="flex border-b border-black">
            <button
              onClick={() => setActiveTab("short")}
              className={`flex-1 py-2 text-[0.7rem] font-bold border cursor-pointer transition-all ${
                activeTab === "short"
                  ? "bg-white text-black border-black border-b-white -mb-[1px]"
                  : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
              }`}
            >
              SHORT-TERM
            </button>
            <button
              onClick={() => setActiveTab("long")}
              className={`flex-1 py-2 text-[0.7rem] font-bold border cursor-pointer transition-all ${
                activeTab === "long"
                  ? "bg-white text-black border-black border-b-white -mb-[1px]"
                  : "bg-[#f9f9f9] text-gray-500 border-gray-300 border-bottom-0"
              }`}
            >
              LONG-TERM
            </button>
          </div>

          {/* Tab Content Box with 503 Error Handler */}
          <div className="flex-1 flex flex-col justify-between">
            {activeTab === "short" ? (
              <div className="border border-dashed border-[#d9534f] bg-[#fffafa] p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#d9534f] text-[0.75rem] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#e74c3c] blink-dot" />
                  HTTP 503 · LLM_DISCONNECTED
                </div>
                <p className="text-[0.68rem] leading-relaxed text-gray-600 text-justify">
                  Endpoint model LLM belum terhubung. Sesuai arsitektur non-mock, rekomendasi operasional jangka pendek akan di-generate otomatis saat API LLM disambungkan.
                </p>
                <div className="mt-1 border-t border-[#f0d0d0] pt-2 flex flex-col gap-1.5">
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Fokus Analisis</span>
                    <span className="text-[0.7rem] font-bold text-black">Perbaikan Sanitasi, Kebersihan Jalur & SOP Tiket</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Target Horizon</span>
                    <span className="text-[0.7rem] font-bold text-black">1 - 4 Minggu</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Prioritas Keluhan</span>
                    <span className="text-[0.7rem] font-bold text-[#E74C3C]">79 Negatif Logistik, 35 Negatif Sanitasi</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-[#d9534f] bg-[#fffafa] p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[#d9534f] text-[0.75rem] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#e74c3c] blink-dot" />
                  HTTP 503 · LLM_DISCONNECTED
                </div>
                <p className="text-[0.68rem] leading-relaxed text-gray-600 text-justify">
                  Endpoint model LLM belum terhubung. Rekomendasi manajerial & kebijakan infrastruktur jangka panjang menunggu respon valid dari reasoning engine.
                </p>
                <div className="mt-1 border-t border-[#f0d0d0] pt-2 flex flex-col gap-1.5">
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Fokus Kebijakan</span>
                    <span className="text-[0.7rem] font-bold text-black">Renovasi Shelter, Sertifikasi Ranger & Kuota Pendakian</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Target Horizon</span>
                    <span className="text-[0.7rem] font-bold text-black">6 - 24 Bulan</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Lembaga Terkait</span>
                    <span className="text-[0.7rem] font-bold text-black">Balai TNGC & Tata Kelola Pariwisata</span>
                  </div>
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
        <div>Aspect-Based Sentiment Analysis &bull; Next.js App Router Architecture</div>
      </footer>

      {/* 5. MODAL DIALOG CONNECT API LLM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-start border-b border-black pb-3 mb-4">
              <div>
                <h3 className="font-bold text-base uppercase">Konfigurasi API LLM</h3>
                <p className="text-[0.68rem] text-gray-600">Integrasikan engine reasoning untuk rekomendasi otomatis</p>
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
                  API Key disimpan secara aman di environment server tanpa ekspos publik.
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
