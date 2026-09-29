# Aspect-Based Sentiment Analysis (ABSA) & Multi-Target TNGC

Proyek Analisis Sentimen Berbasis Aspek (ABSA) ulasan pengunjung Taman Nasional Gunung Ciremai (TNGC) dari 12 titik basecamp dan Objek Daya Tarik Wisata Alam (ODTWA) resmi Balai TNGC di Google Maps.

---

## 🎯 Komponen & Struktur Proyek (Handoff Structure)

| File / Folder | Fungsi & Deskripsi |
| :--- | :--- |
| **`tngc_absa_analysis.ipynb`** | Notebook riset utama: Ingesti 2.216 data, audit cleaning, Word Cloud, TF-IDF + SMOTE, evaluasi 3 model klasik + Fine-Tuning IndoBERT (GPU CUDA), dan ekspor raw JSON. |
| **`app_dashboard.py`** | Aplikasi Dashboard analitik Streamlit formal (6 tab analitik interaktif, Plotly charts, peta teks leksikal, dan payload LLM). |
| **`pure_absa.py`** | Modul generator payload murni ABSA tanpa hardcode rekomendasi (siap di-feed ke API LLM). |
| **`indobert_trainer.py`** | Modul deep learning fine-tuning `indobenchmark/indobert-base-p1` terakselerasi NVIDIA RTX GPU. |
| **`tngc_analytics_core.py`** | Modul logika data preprocessing, filter eliminasi estetika alam, dan training model klasik. |
| **`lexicon_loader.py`** | Integrasi kamus resmi GitHub (*Colloquial Indonesian Lexicon* UI) + InSet + istilah lokal Ciremai/Sunda. |
| **`fe/`** | Folder antarmuka web statis (HTML/JS/CSS dashboard visualisasi TNGC dari repositori frontend). |
| **`docs/`** | Dokumentasi lengkap SDLC: PRD, SRS, ADR, Execution Plan, dan Dev Log. |
| **`tngc_official_multitarget_reviews.csv`** | Dataset mentah 2.216 ulasan terverifikasi dari 12 titik resmi TNGC. |
| **`tngc_pure_absa_payloads.json`** | Dataset terproses format JSON murni ABSA untuk integrasi API LLM. |

---

## 🚀 Cara Menjalankan

### 1. Dashboard Streamlit
```bash
/c/Users/seeva/.venvs/nlp-env/Scripts/python -m streamlit run app_dashboard.py
```

### 2. Jupyter Notebook
Buka `tngc_absa_analysis.ipynb` di VS Code / Jupyter Lab, pastikan kernel aktif di `nlp-env`, lalu jalankan **Run All**.

### 3. Frontend Web (`fe/`)
Cukup buka file `fe/index.html` langsung di browser atau gunakan extension Live Server.

---

## 🔗 Remote Repository
Target upstream:
```text
https://github.com/timbubadibako/SA-TNGC.git
```
