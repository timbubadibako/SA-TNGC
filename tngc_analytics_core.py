"""
Core NLP and Machine Learning Module for TNGC Aspect-Based Sentiment Analysis.
Standardized, reproducible, and zero-leakage pipeline.
"""

import re
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from imblearn.over_sampling import SMOTE

from lexicon_loader import normalize_text_github

# Aspek Khusus Evaluasi Pengelola TNGC
ASPECT_LEXICON: Dict[str, List[str]] = {
    "aspek_toilet_sanitasi": ["toilet", "kamar mandi", "wc", "air", "mck", "pesing", "kran", "gayung"],
    "aspek_sampah_kebersihan": ["sampah", "kebersihan", "kotor", "plastik", "runtah", "puntung"],
    "aspek_pelayanan_ranger": ["petugas", "simaksi", "ranger", "briefing", "antre", "loket", "registrasi", "cs", "whatsapp", "ramah", "jutek"],
    "aspek_jalur_trek": ["trek", "jalur", "tanjakan", "plang", "tali", "licin", "berdebu", "batu", "curam", "jalan"],
    "aspek_biaya_logistik": ["tiket", "htm", "biaya", "parkir", "harga", "warung", "porter", "ojek", "transportasi", "carter", "mahal", "pungli"]
}

FACILITY_REGEX_FILTER = r'(?i)\b(toilet|kamar mandi|wc|air|shelter|pos|camp|basecamp|sampah|mushola|kebersihan|fasilitas|mck|listrik|warung|parkir|biaya|tiket|htm|petugas|simaksi|ranger|briefing|ojek|porter|jalan|tali|plang|jalur|trek|transportasi|angkutan|harga|carter|pungli|batu|licin)\b'

ACTION_PLAN_MATRIX: Dict[str, Dict[str, str]] = {
    "aspek_toilet_sanitasi": {
        "short": "Jadwal sanitasi toilet basecamp minimum 3 kali sehari dan jaminan ketersediaan air bersih serta sabun cuci tangan.",
        "medium": "Pipanisasi permanen perbaikan jalur air dari mata air terdekat ke pos sanitasi dan renovasi bilik pintu rusak di Palutungan dan Apuy.",
        "long": "Pembangunan unit eco-toilet berbasis pengomposan mandiri di pos ketinggian (>2000 mdpl) untuk mencegah pencemaran semak dan sumber air."
    },
    "aspek_sampah_kebersihan": {
        "short": "Distribusi kantong sampah wajib terdata saat registrasi simaksi dan pengetatan inspeksi checklist sampah saat checkout.",
        "medium": "Penyediaan titik pengumpulan karung sampah pilah di setiap pos bayangan dan program operasi pembersihan gunung berkala.",
        "long": "Implementasi sistem deposit jaminan sampah digital terintegrasi aplikasi simaksi TNGC dan pusat pengolahan sampah lingkar Ciremai."
    },
    "aspek_pelayanan_ranger": {
        "short": "Standarisasi standar operasional prosedur keramahan petugas loket dan customer service WhatsApp basecamp serta penambahan personel saat akhir pekan.",
        "medium": "Peningkatan kapasitas infrastruktur server booking simaksi online bebas down dan pelatihan hospitality bagi volunteer dan ranger pos.",
        "long": "Implementasi smart gate otomatis mandiri berbasis scan barcode terintegrasi e-KTP dan sertifikasi kompetensi ranger pemandu nasional."
    },
    "aspek_biaya_logistik": {
        "short": "Pemasangan papan informasi resmi rincian tarif tiket, asuransi, tes kesehatan, dan retribusi parkir di gerbang masuk basecamp.",
        "medium": "Penertiban dan standarisasi tarif batas atas angkutan transit (truk/mobil bak Sadarehe) dan panduan harga warung logistik pos.",
        "long": "Paket ekowisata terpadu (tiket simaksi, tes kesehatan, makan produk UMKM lokal, transportasi) dalam satu platform digital TNGC."
    },
    "aspek_jalur_trek": {
        "short": "Pemasangan pita reflektif fosfor penanda jalur malam dan penggantian tali pengaman webbing yang putus atau lapuk di titik terjal.",
        "medium": "Pembuatan undakan kayu atau batu penahan erosi tanah di tanjakan terjal dan peremajaan plang penunjuk kilometer anti-cuaca.",
        "long": "Sistem buka-tutup jalur berkala berbasis daya dukung lingkungan untuk pemulihan vegetasi dan penetapan jalur evakuasi helipad darurat."
    }
}


def filter_facility_reviews(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Memisahkan ulasan fasilitas & operasional dari ulasan estetika alam murni."""
    mask = df["review_text"].str.contains(FACILITY_REGEX_FILTER, na=False)
    df_facility = df[mask].copy().reset_index(drop=True)
    df_nature = df[~mask].copy().reset_index(drop=True)
    return df_facility, df_nature


def preprocess_corpus(df: pd.DataFrame) -> pd.DataFrame:
    """Membersihkan teks dan menerapkan normalisasi kamus GitHub + istilah lokal."""
    df_out = df.copy()
    df_out["clean_text"] = df_out["review_text"].apply(normalize_text_github)
    
    # Ekstraksi aspek
    for asp, keywords in ASPECT_LEXICON.items():
        pattern = r'\b(?:' + '|'.join(keywords) + r')\b'
        df_out[asp] = df_out["clean_text"].str.contains(pattern, regex=True).astype(int)
        
    return df_out


def train_benchmark_models(
    X_train_text: pd.Series, 
    y_train: pd.Series, 
    X_test_text: pd.Series, 
    y_test: pd.Series,
    random_state: int = 42
) -> Dict[str, Any]:
    """Melatih Linear SVM, Logistic Regression, dan Random Forest dengan SMOTE."""
    vectorizer = TfidfVectorizer(max_features=2500, ngram_range=(1, 2))
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)
    
    min_k = max(1, min(2, y_train.value_counts().min() - 1))
    smote = SMOTE(random_state=random_state, k_neighbors=min_k)
    X_train_res, y_train_res = smote.fit_resample(X_train_vec, y_train)
    
    models = {
        "Logistic Regression": LogisticRegression(random_state=random_state, max_iter=1000),
        "Linear SVM": LinearSVC(random_state=random_state, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=random_state)
    }
    
    results = {}
    for name, model in models.items():
        model.fit(X_train_res, y_train_res)
        preds = model.predict(X_test_vec)
        macro_f1 = f1_score(y_test, preds, average="macro", zero_division=0)
        report = classification_report(y_test, preds, output_dict=True, zero_division=0)
        cm = confusion_matrix(y_test, preds, labels=np.unique(y_test))
        results[name] = {
            "model": model,
            "macro_f1": macro_f1,
            "report": report,
            "confusion_matrix": cm,
            "predictions": preds
        }
        
    return {
        "vectorizer": vectorizer,
        "models": results,
        "classes": np.unique(y_test),
        "X_train_res_shape": X_train_res.shape,
        "y_train_res_dist": y_train_res.value_counts().to_dict()
    }


def map_action_plan(row: pd.Series) -> pd.Series:
    """Memetakan ulasan komplain/negatif ke matriks rekomendasi berjenjang."""
    is_negative = str(row.get("sentiment", "")).lower() == "negatif" or row.get("rating", 5) <= 2
    if not is_negative:
        return pd.Series({
            "saran_jangka_pendek": "-",
            "saran_jangka_menengah": "-",
            "saran_jangka_panjang": "-"
        })
        
    short_plans, medium_plans, long_plans = [], [], []
    for asp, plans in ACTION_PLAN_MATRIX.items():
        if row.get(asp, 0) == 1:
            label = asp.replace("aspek_", "").replace("_", " ").title()
            short_plans.append(f"[{label}]: {plans['short']}")
            medium_plans.append(f"[{label}]: {plans['medium']}")
            long_plans.append(f"[{label}]: {plans['long']}")
            
    return pd.Series({
        "saran_jangka_pendek": " \n".join(short_plans) if short_plans else "Monitoring berkala kepuasan operasional.",
        "saran_jangka_menengah": " \n".join(medium_plans) if medium_plans else "Evaluasi berkala kepuasan pengunjung.",
        "saran_jangka_panjang": " \n".join(long_plans) if long_plans else "Alokasi anggaran tahunan Balai TNGC."
    })
