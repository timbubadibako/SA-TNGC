import streamlit as st
import pandas as pd
import numpy as np
import json
import plotly.express as px
import plotly.graph_objects as go
import matplotlib.pyplot as plt
from wordcloud import WordCloud

import os
import sys

# Tambahkan root directory ke sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
CORE_DIR = os.path.join(ROOT_DIR, "core")
if CORE_DIR not in sys.path:
    sys.path.insert(0, CORE_DIR)

from tngc_analytics_core import (
    filter_facility_reviews, 
    preprocess_corpus, 
    ASPECT_LEXICON
)
from pure_absa import generate_pure_absa_payload, format_llm_prompt_template

st.set_page_config(
    page_title="TNGC Aspect-Based Sentiment Analysis (ABSA) Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Formal Style
st.markdown("""
<style>
    .main-title {
        font-size: 26px;
        font-weight: 700;
        color: #1a365d;
        margin-bottom: 2px;
    }
    .sub-title {
        font-size: 14px;
        color: #4a5568;
        margin-bottom: 20px;
    }
    .metric-card {
        background-color: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 12px;
        text-align: center;
    }
    .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #2b6cb0;
    }
    .metric-label {
        font-size: 12px;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
</style>
""", unsafe_allow_html=True)

# 1. Data Loader
@st.cache_data
def load_and_preprocess_data():
    data_path = os.path.join(ROOT_DIR, "data", "raw", "tngc_official_multitarget_reviews.csv")
    raw_df = pd.read_csv(data_path)
    df_facility, df_nature = filter_facility_reviews(raw_df)
    df_proc = preprocess_corpus(df_facility)
    return raw_df, df_proc, df_nature

df_raw, df_processed, df_nature = load_and_preprocess_data()

# Header
st.markdown("<div class='main-title'>Dashboard Analisis Sentimen Berbasis Aspek (ABSA) TNGC</div>", unsafe_allow_html=True)
st.markdown("<div class='sub-title'>Output Murni Aspek & Sentimen dari 12 Objek Daya Tarik Wisata Alam (ODTWA) Balai TNGC | Siap Terintegrasi API LLM</div>", unsafe_allow_html=True)

# Sidebar
st.sidebar.markdown("### Parameter dan Filter")
selected_poi = st.sidebar.selectbox("Destinasi / Titik Kawasan:", ["Semua Destinasi"] + sorted(df_processed["poi_name"].unique().tolist()))
selected_category = st.sidebar.selectbox("Kategori Kawasan:", ["Semua Kategori"] + sorted(df_processed["category"].unique().tolist()))
selected_sentiment = st.sidebar.multiselect("Klasifikasi Sentimen:", ["positif", "netral", "negatif"], default=["positif", "netral", "negatif"])

# Filter Execution
filtered_df = df_processed.copy()
if selected_poi != "Semua Destinasi":
    filtered_df = filtered_df[filtered_df["poi_name"] == selected_poi]
if selected_category != "Semua Kategori":
    filtered_df = filtered_df[filtered_df["category"] == selected_category]
if selected_sentiment:
    filtered_df = filtered_df[filtered_df["sentiment"].isin(selected_sentiment)]

# KPI Metrics
c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    st.markdown(f"<div class='metric-card'><div class='metric-value'>{len(df_raw):,}</div><div class='metric-label'>Total Ulasan Raw</div></div>", unsafe_allow_html=True)
with c2:
    st.markdown(f"<div class='metric-card'><div class='metric-value'>{len(df_nature):,}</div><div class='metric-label'>Estetika Alam (Dieliminasi)</div></div>", unsafe_allow_html=True)
with c3:
    st.markdown(f"<div class='metric-card'><div class='metric-value'>{len(filtered_df):,}</div><div class='metric-label'>Ulasan Fasilitas & Layanan</div></div>", unsafe_allow_html=True)
with c4:
    neg_count = (filtered_df["sentiment"] == "negatif").sum()
    st.markdown(f"<div class='metric-card'><div class='metric-value' style='color:#c53030;'>{neg_count:,}</div><div class='metric-label'>Sentimen Negatif</div></div>", unsafe_allow_html=True)
with c5:
    pos_count = (filtered_df["sentiment"] == "positif").sum()
    st.markdown(f"<div class='metric-card'><div class='metric-value' style='color:#2f855a;'>{pos_count:,}</div><div class='metric-label'>Sentimen Positif</div></div>", unsafe_allow_html=True)

st.write("")

# Tabs
tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
    "Visualisasi Distribusi & Volume", 
    "Evaluasi Sentimen per Aspek", 
    "Peta Teks (Word Cloud)",
    "Audit Pipeline Cleaning",
    "Output Raw ABSA & Payload LLM", 
    "Tabel Data Ulasan"
])

with tab1:
    col_left, col_right = st.columns(2)
    with col_left:
        st.markdown("##### Sebaran Volume Ulasan Berdasarkan Destinasi")
        poi_dist = filtered_df["poi_name"].value_counts().reset_index()
        poi_dist.columns = ["Destinasi", "Jumlah Ulasan"]
        fig_poi = px.bar(
            poi_dist, 
            x="Jumlah Ulasan", 
            y="Destinasi", 
            orientation="h",
            color="Jumlah Ulasan",
            color_continuous_scale="Blues"
        )
        fig_poi.update_layout(yaxis={'categoryorder': 'total ascending'}, height=420, margin=dict(l=0, r=0, t=10, b=0))
        st.plotly_chart(fig_poi, use_container_width=True)

    with col_right:
        st.markdown("##### Rasio Ulasan Fasilitas vs Eliminasi Alam Murni")
        elim_data = pd.DataFrame({
            "Kategori": ["Ulasan Fasilitas & Operasional", "Ulasan Estetika Alam Murni"],
            "Jumlah": [len(filtered_df), len(df_nature)]
        })
        fig_pie = px.pie(
            elim_data, 
            names="Kategori", 
            values="Jumlah",
            color="Kategori",
            color_discrete_map={
                "Ulasan Fasilitas & Operasional": "#2b6cb0",
                "Ulasan Estetika Alam Murni": "#cbd5e0"
            },
            hole=0.45
        )
        fig_pie.update_layout(height=420, margin=dict(l=0, r=0, t=10, b=0), legend=dict(orientation="h", y=-0.1))
        st.plotly_chart(fig_pie, use_container_width=True)

with tab2:
    st.markdown("##### Komparasi Jumlah Pujian dan Keluhan Berdasarkan Aspek")
    aspect_rows = []
    for asp in ASPECT_LEXICON.keys():
        subset = filtered_df[filtered_df[asp] == 1]
        pos = (subset["sentiment"] == "positif").sum()
        net = (subset["sentiment"] == "netral").sum()
        neg = (subset["sentiment"] == "negatif").sum()
        label = asp.replace("aspek_", "").replace("_", " ").title()
        aspect_rows.append({
            "Aspek": label,
            "Pujian (Positif)": pos,
            "Netral": net,
            "Keluhan (Negatif)": neg,
            "Total Disebutkan": len(subset),
            "Rasio Keluhan (%)": round((neg / len(subset) * 100), 2) if len(subset) > 0 else 0
        })
    df_asp = pd.DataFrame(aspect_rows).sort_values(by="Keluhan (Negatif)", ascending=False)
    
    fig_asp = go.Figure()
    fig_asp.add_trace(go.Bar(name="Pujian (Positif)", x=df_asp["Aspek"], y=df_asp["Pujian (Positif)"], marker_color="#38a169"))
    fig_asp.add_trace(go.Bar(name="Netral", x=df_asp["Aspek"], y=df_asp["Netral"], marker_color="#a0aec0"))
    fig_asp.add_trace(go.Bar(name="Keluhan (Negatif)", x=df_asp["Aspek"], y=df_asp["Keluhan (Negatif)"], marker_color="#e53e3e"))
    fig_asp.update_layout(barmode="stack", height=380, margin=dict(l=0, r=0, t=10, b=0), legend=dict(orientation="h", y=1.1))
    st.plotly_chart(fig_asp, use_container_width=True)
    
    st.dataframe(df_asp, use_container_width=True)

with tab3:
    st.markdown("##### Peta Teks (Word Cloud Leksikal)")
    col_wc1, col_wc2 = st.columns(2)
    
    neg_texts = " ".join(filtered_df[filtered_df["sentiment"] == "negatif"]["clean_text"].dropna())
    with col_wc1:
        st.markdown("**Peta Kata Keluhan (Sentimen Negatif)**")
        if len(neg_texts.strip()) > 10:
            wc_neg = WordCloud(width=600, height=350, background_color="white", colormap="Reds").generate(neg_texts)
            fig_wcn, ax_wcn = plt.subplots(figsize=(6, 3.5), dpi=100)
            ax_wcn.imshow(wc_neg, interpolation="bilinear")
            ax_wcn.axis("off")
            plt.tight_layout(pad=0)
            st.pyplot(fig_wcn)
        else:
            st.info("Data keluhan tidak mencukupi untuk filter ini.")

    pos_texts = " ".join(filtered_df[filtered_df["sentiment"] == "positif"]["clean_text"].dropna())
    with col_wc2:
        st.markdown("**Peta Kata Apresiasi (Sentimen Positif)**")
        if len(pos_texts.strip()) > 10:
            wc_pos = WordCloud(width=600, height=350, background_color="white", colormap="Blues").generate(pos_texts)
            fig_wcp, ax_wcp = plt.subplots(figsize=(6, 3.5), dpi=100)
            ax_wcp.imshow(wc_pos, interpolation="bilinear")
            ax_wcp.axis("off")
            plt.tight_layout(pad=0)
            st.pyplot(fig_wcp)
        else:
            st.info("Data pujian tidak mencukupi untuk filter ini.")

with tab4:
    st.markdown("##### Audit Komparasi Data Pipeline Cleaning per Destinasi")
    audit_data = []
    for poi, grp in df_raw.groupby("poi_name"):
        total_raw = len(grp)
        grp_fac, _ = filter_facility_reviews(grp)
        total_fac = len(grp_fac)
        total_nature = total_raw - total_fac
        audit_data.append({
            "Destinasi": poi,
            "Total Ulasan Raw": total_raw,
            "Ulasan Estetika Alam": total_nature,
            "Ulasan Fasilitas Lolos": total_fac,
            "Rasio Fasilitas (%)": round((total_fac / total_raw * 100), 2)
        })
    df_audit = pd.DataFrame(audit_data).sort_values(by="Total Ulasan Raw", ascending=False)
    
    fig_audit = go.Figure()
    fig_audit.add_trace(go.Bar(name="Ulasan Fasilitas Lolos", x=df_audit["Destinasi"], y=df_audit["Ulasan Fasilitas Lolos"], marker_color="#2b6cb0"))
    fig_audit.add_trace(go.Bar(name="Ulasan Alam Murni (Dieliminasi)", x=df_audit["Destinasi"], y=df_audit["Ulasan Estetika Alam"], marker_color="#cbd5e0"))
    fig_audit.update_layout(barmode="group", height=400, margin=dict(l=0, r=0, t=10, b=0), xaxis_tickangle=-35, legend=dict(orientation="h", y=1.1))
    st.plotly_chart(fig_audit, use_container_width=True)

with tab5:
    st.markdown("##### Output Raw ABSA & Payload Integrasi API LLM")
    st.caption("Menampilkan data murni hasil ekstraksi aspek dan polaritas sentimen (tanpa aturan rekomendasi hardcode). Payload ini yang dikirim ke LLM.")
    
    if len(filtered_df) > 0:
        sample_idx = st.selectbox(
            "Pilih Baris Ulasan untuk Ditampilkan Raw JSON Payload:",
            options=range(len(filtered_df)),
            format_func=lambda i: f"[{filtered_df.iloc[i]['poi_name']}] ({filtered_df.iloc[i]['sentiment']}): {filtered_df.iloc[i]['review_text'][:90]}..."
        )
        
        target_row = filtered_df.iloc[sample_idx]
        pure_payload = generate_pure_absa_payload(
            review_id=int(target_row["review_id"]),
            poi_name=str(target_row["poi_name"]),
            text=str(target_row["review_text"]),
            rating=int(target_row["rating"]),
            overall_sentiment=str(target_row["sentiment"])
        )
        prompt_sample = format_llm_prompt_template(pure_payload)
        
        col_json, col_prompt = st.columns([1, 1])
        with col_json:
            st.markdown("**1. Raw JSON Output dari Model ABSA:**")
            st.json(pure_payload)
            
        with col_prompt:
            st.markdown("**2. Contoh Prompt yang Siap Dikirim ke API LLM:**")
            st.code(prompt_sample, language="text")
            st.info("Catatan: LLM akan menerima payload ini lalu menghasilkan rekomendasi Jangka Pendek, Menengah, dan Panjang secara generatif.")
    else:
        st.info("Data ulasan tidak ditemukan pada filter aktif.")

with tab6:
    st.markdown("##### Tabulasi Data Ulasan Fasilitas Terproses")
    st.dataframe(
        filtered_df[["review_id", "poi_name", "rating", "sentiment", "review_text", "clean_text"]],
        use_container_width=True
    )
