# Aspect-Based Sentiment Analysis (ABSA) - Taman Nasional Gunung Ciremai (TNGC)

Repositori riset Analisis Sentimen Berbasis Aspek (ABSA) ulasan pengunjung Taman Nasional Gunung Ciremai (TNGC) dari 12 titik basecamp dan Objek Daya Tarik Wisata Alam (ODTWA) resmi Balai TNGC di Google Maps.

---

## 📁 Struktur Folder Proyek (Modular Architecture)

```text
analysis-TNGC/
├── core/                        # Modul Python logika utama & model training
│   ├── indobert_trainer.py      # Fine-tuning IndoBERT (PyTorch CUDA GPU)
│   ├── lexicon_loader.py        # Normalisasi teks kamus GitHub + Sunda/TNGC
│   ├── pure_absa.py             # Generator payload murni ABSA (siap ke API LLM)
│   ├── tngc_analytics_core.py   # Filtering fasilitas & pipeline benchmark ML
│   └── kamus_slang_tngc.py      # Entri istilah lokal & dialek pendakian
│
├── dashboard/                   # Dashboard interaktif analitik Streamlit
│   └── app_dashboard.py         # 6 tab visualisasi formal (Plotly + Word Cloud)
│
├── data/                        # Penyimpanan data terstruktur
│   ├── raw/                     # tngc_official_multitarget_reviews.csv (2.216 ulasan)
│   ├── processed/               # tngc_pure_absa_payloads.json & dataset berlabel
│   └── lexicon/                 # colloquial-indonesian-lexicon.csv, inset_*.tsv
│
├── ml-notebooks/                # Eksperimen ilmiah & visualisasi akademik
│   └── tngc_absa_analysis.ipynb # Notebook lengkap (Audit, SMOTE, ML, IndoBERT, JSON)
│
├── scraper/                     # Script pengumpulan data ulasan Google Maps
│   ├── scrape_tngc_multitarget.mjs  # Scraper multi-target internal endpoint
│   └── tngc_resolved_pois.json  # Metadata 12 verified POI hex placeId
│
├── fe/                          # Antarmuka web statis dashboard
│   ├── assets/                  # CSS & JS Chart.js
│   ├── data/                    # Salinan dataset & payload untuk frontend
│   └── index.html               # Entry point visualisasi web
│
└── docs/                        # Dokumentasi enterprise SDLC lengkap
    ├── prd/                     # Product Requirement Document
    ├── srs/                     # Software Requirement Specification
    ├── adr/                     # Architectural Decision Records
    ├── plans/                   # Execution Plan
    └── devlogs/                 # Catatan perkembangan harian (Dev Log)
```

---

## 🚀 Panduan Eksekusi

### 1. Menjalankan Dashboard Streamlit
```bash
/c/Users/seeva/.venvs/nlp-env/Scripts/python -m streamlit run dashboard/app_dashboard.py
```

### 2. Menjalankan Notebook Riset
Buka `ml-notebooks/tngc_absa_analysis.ipynb` di VS Code / Jupyter Lab dengan kernel `nlp-env`, lalu jalankan **Run All**.

### 3. Membuka Web Frontend Statis (`fe/`)
Cukup buka `fe/index.html` langsung di browser atau via Live Server.

---

## 🔗 Target Remote Git
```text
https://github.com/timbubadibako/SA-TNGC.git
```
