# SRS: Aspect-Based Sentiment Analysis & Multi-Horizon Action Plan (TNGC)
- **Related PRD**: `docs/prd/tngc_absa_multitarget.prd.md`
- **Standard**: IEEE 830 / ISO-IEC-IEEE 29148 compliant for NLP Software Engineering

---

## 1. Data Schema & Model Specification

### 1.1 Ingestion Dataset Schema (`tngc_official_multitarget_reviews.csv`)
| Field Name | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `review_id` | Integer | No | ID unik berurutan hasil deduplikasi ulasan |
| `poi_name` | String | No | Nama resmi destinasi / resort / basecamp TNGC |
| `category` | String | No | Kategori objek (Basecamp, Wisata Alam, Buper, dll.) |
| `rating` | Integer | No | Bintang ulasan pengguna Google Maps (1 - 5) |
| `review_text` | Text | No | Teks asli ulasan pengguna dari Google Maps |
| `published_at`| String | Yes | Tanggal publikasi ulasan |
| `sentiment` | String | No | Label sentimen awal (`positif`, `netral`, `negatif`) |

### 1.2 Transformed Dataset Schema (`tngc_absa_facility_action_plan.csv`)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `clean_text` | Text | Teks setelah normalisasi Kamus GitHub UI & istilah Sunda/TNGC |
| `aspek_toilet_sanitasi` | Binary (0/1) | Keberadaan pembahasan toilet, air, MCK, kebersihan kamar mandi |
| `aspek_sampah_kebersihan`| Binary (0/1) | Keberadaan pembahasan sampah, runtah, kebersihan camp |
| `aspek_pelayanan_ranger` | Binary (0/1) | Keberadaan pembahasan petugas, CS, simaksi, keramahan |
| `aspek_jalur_trek` | Binary (0/1) | Keberadaan pembahasan kondisi jalur, tanjakan, plang, tali |
| `aspek_biaya_logistik` | Binary (0/1) | Keberadaan pembahasan harga tiket, parkir, ojek, warung |
| `pred_sentiment` | String | Prediksi sentimen model ML (`positif`, `netral`, `negatif`) |
| `saran_jangka_pendek` | Text | Rekomendasi taktis operasional (< 3 bulan) |
| `saran_jangka_menengah`| Text | Rekomendasi perbaikan infrastruktur/SOP (3 - 12 bulan) |
| `saran_jangka_panjang` | Text | Rekomendasi strategis/kebijakan makro Balai TNGC (> 1 tahun) |

---

## 2. System Architecture & Pipeline Flow
```
[Google Maps Endpoints]
        │
        ▼ (scrape_tngc_multitarget.mjs via verified hex placeId)
[tngc_official_multitarget_reviews.csv] (2.216 Ulasan)
        │
        ▼ (Eliminasi Estetika Alam Murni via FACILITY_KEYWORDS mask)
[Filtered Facility Reviews] (~15-20% ulasan operasional murni)
        │
        ▼ (lexicon_loader.py: Kamus Alay GitHub + Dialek Sunda)
[Normalized Corpus]
        │
   ┌────┴──────────────────────────┐
   ▼                               ▼
[Train Split 80%]           [Test Split 20%]
   │                               │
   ▼                               ▼
[TF-IDF fit_transform]      [TF-IDF transform]
   │                               │
   ▼                               │
[SMOTE Resampling]                 │
   │                               │
   ▼                               │
[Model Training: SVM/LR/RF]        │
   │                               │
   └───────────────┬───────────────┘
                   ▼
       [Classification Report & F1]
                   │
                   ▼
     [Multi-Horizon Action Plan Matrix]
                   │
                   ▼
   [Streamlit UI & Jupyter Notebook Output]
```

---

## 3. Algorithmic & NLP Specifications
1. **Pembersihan Teks (Preprocessing)**:
   - Lowercasing, removal of URLs, numbers, punctuations, and excessive whitespaces.
   - Word tokenization and dictionary lookup against `SLANG_DICTIONARY` (O(N) complexity).
2. **Feature Extraction**:
   - Sub-linear TF-IDF scaling, unigram + bigram (`ngram_range=(1,2)`), max vocabulary size = 1.000 - 3.000 tokens.
3. **Resampling Algorithm**:
   - `imblearn.over_sampling.SMOTE` with $k$-neighbors adjusted dynamically (`min(k, n_samples_minority - 1)`) to avoid crash on tiny sub-classes.
4. **Action Plan Engine**:
   - Rule-based conditional mapper matching active negative aspects with pre-validated institutional recommendations.

---

## 4. Interface & Dashboard Specifications (`app_dashboard.py`)
- **Framework**: Streamlit 1.64.0 (Python).
- **Layout**: Wide mode with sticky sidebar.
- **Controls**: POI Dropdown (12 Destinasi), Category Dropdown, Multi-select Sentiment.
- **Tabs**:
  1. *Distribusi & Grafik*: Bar chart volume ulasan dan sebaran rating.
  2. *Bedah Aspek ABSA*: Agregasi persentase komplain vs pujian per aspek.
  3. *Rekomendasi Berjenjang*: Expander kartu solusi Short/Mid/Long-term.
  4. *Kamus Slang GitHub*: Interactive search table padanan kata baku.
  5. *Data Explorer*: Tabulasi interaktif ulasan raw vs ulasan bersih.
