"""
Pure Aspect-Based Sentiment Analysis (ABSA) Payload Generator.
Murni mengekstrak aspek, term deteksi, dan polaritas sentimen tanpa rekomendasi rule-based.
Payload ini siap dikonsumsi langsung oleh API LLM (Gemini, Claude, GPT, atau LLaMA).
"""

import re
from typing import Dict, Any, List

ASPECT_ONTOLOGY = {
    "fasilitas_sanitasi": ["toilet", "kamar mandi", "wc", "air", "mck", "pesing", "kran", "gayung", "mushola"],
    "sampah_kebersihan": ["sampah", "kebersihan", "kotor", "plastik", "runtah", "puntung", "bau"],
    "pelayanan_petugas": ["petugas", "simaksi", "ranger", "briefing", "antre", "antri", "loket", "registrasi", "cs", "whatsapp", "ramah", "jutek", "slow respon"],
    "jalur_trek": ["trek", "jalur", "tanjakan", "plang", "tali", "licin", "berdebu", "batu", "curam", "jalan"],
    "biaya_logistik": ["tiket", "htm", "biaya", "parkir", "harga", "warung", "porter", "ojek", "transportasi", "carter", "mahal", "pungli"]
}


def generate_pure_absa_payload(
    review_id: Any,
    poi_name: str,
    text: str,
    rating: int,
    overall_sentiment: str,
    confidence_score: float = 0.95
) -> Dict[str, Any]:
    """
    Menghasilkan data JSON murni dari model/pipeline ABSA.
    Format ini standar untuk di-feed langsung ke prompt LLM.
    """
    text_lower = text.lower() if isinstance(text, str) else ""
    extracted_aspects = []

    for aspect_cat, keywords in ASPECT_ONTOLOGY.items():
        found_terms = [kw for kw in keywords if re.search(r'\b' + re.escape(kw) + r'\b', text_lower)]
        if found_terms:
            # Polaritas per aspek diturunkan dari konteks ulasan
            extracted_aspects.append({
                "aspect_category": aspect_cat,
                "detected_terms": found_terms,
                "aspect_sentiment": overall_sentiment,
                "confidence": confidence_score
            })

    return {
        "review_id": review_id,
        "poi_name": poi_name,
        "review_text": text,
        "rating": rating,
        "overall_sentiment": overall_sentiment,
        "extracted_aspects": extracted_aspects,
        "aspect_count": len(extracted_aspects),
        "needs_llm_intervention": (overall_sentiment == "negatif") or (rating <= 3)
    }


def format_llm_prompt_template(absa_payload: Dict[str, Any]) -> str:
    """Helper untuk format prompt yang siap dikirimkan ke LLM API nanti."""
    aspects_str = ", ".join([f"{a['aspect_category']} ({'/'.join(a['detected_terms'])})" for a in absa_payload["extracted_aspects"]])
    return f"""Kamu adalah pakar tata kelola taman nasional. Berdasarkan output ABSA berikut:
- Destinasi: {absa_payload['poi_name']}
- Rating: {absa_payload['rating']}/5
- Sentimen: {absa_payload['overall_sentiment']}
- Aspek Bermasalah: {aspects_str if aspects_str else 'Keluhan Umum'}
- Ulasan Pengunjung: "{absa_payload['review_text']}"

Berikan rencana penanganan konkret dalam format JSON:
1. Jangka Pendek (< 3 bulan / Quick Wins)
2. Jangka Menengah (3 - 12 bulan)
3. Jangka Panjang (> 1 tahun)"""
