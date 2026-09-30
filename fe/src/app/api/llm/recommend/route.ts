import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AspectStats {
  positif: number;
  negatif: number;
  netral: number;
}

interface RequestPayload {
  poi_name: string;
  focused_aspect?: string;
  aspects: Record<string, AspectStats>;
  sample_reviews?: Array<{ text: string; sentiment: string }>;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "API_KEY_MISSING",
            message: "GEMINI_API_KEY belum dikonfigurasi di environment server.",
          },
        },
        { status: 500 }
      );
    }

    const body: RequestPayload = await req.json();
    const { poi_name, focused_aspect = "Semua Aspek", aspects, sample_reviews = [] } = body;

    if (!poi_name) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Parameter poi_name wajib disertakan.",
          },
        },
        { status: 400 }
      );
    }

    const isSpecificPoi = poi_name !== "Semua Destinasi";
    const isSpecificAspect = focused_aspect !== "Semua Aspek";

    // Aturan Panjang & Scope Dinamis:
    // Jika mikro (1 POI + 1 Aspek): 2 butir langkah taktis singkat
    // Jika makro (Semua Destinasi): 3 butir kebijakan strategis terpadu
    const itemsPerTier = (isSpecificPoi && isSpecificAspect) ? 2 : 3;
    const toneScope = isSpecificPoi 
      ? `Tingkat Lapangan / Pos Spesifik (${poi_name}). Rumuskan langkah taktis ringkas dan langsung dapat dieksekusi oleh koordinator pos/ranger.`
      : `Tingkat Balai / Makro Kawasan TNGC. Rumuskan arahan standarisasi kebijakan serentak lintas seluruh jalur dan ODTWA.`;

    const systemPrompt = `Anda adalah Analis Kebijakan dan Manajemen Pariwisata Konservasi Senior untuk Balai Taman Nasional Gunung Ciremai (TNGC).
Tugas Anda adalah merumuskan rencana tindakan operasional terstruktur berdasarkan hasil ekstraksi sentimen ulasan pengunjung (Aspect-Based Sentiment Analysis).

PEDOMAN KETAT (GUARDRAILS):
1. GROUNDING FAKTA: Hanya gunakan data ulasan dan aspek yang disediakan. DILARANG MENGARANG fasilitas fiktif.
2. CAKUPAN ANALISIS: ${toneScope}
3. FOKUS ASPEK: ${isSpecificAspect ? `Fokus khusus HANYA pada domain aspek "${focused_aspect}".` : `Fokus mencakup domain fasilitas operasional TNGC.`}
4. FORMAT OUTPUT WAJIB LIST/LANGKAH KONKRET:
   Setiap jenjang waktu (short_term, medium_term, long_term) WAJIB berupa array/daftar string berisi tepat ${itemsPerTier} langkah/butir tindakan konkret.
   Setiap butir harus ringkas, lugas, padat (maksimal 1-2 kalimat per butir).
5. FORMAT OUTPUT JSON MURNI: Kembalikan HANYA objek JSON valid sesuai skema yang diminta, tanpa teks markdown pembuka/penutup.`;

    const userContent = `DATA MASUKAN ABSA TNGC:
- Destinasi / ODTWA: ${poi_name}
- Domain Fokus: ${focused_aspect}
- Distribusi Sentimen:
${JSON.stringify(aspects, null, 2)}
- Sampel Keluhan Negatif Terkini:
${sample_reviews
  .filter((r) => r.sentiment === "negatif")
  .slice(0, 5)
  .map((r, i) => `${i + 1}. "${r.text}"`)
  .join("\n") || "Tidak ada keluhan kritis spesifik."}

Kembalikan respon JSON persis seperti skema ini:
{
  "summary": "1 kalimat ringkasan urgensi tindakan",
  "short_term": [
    "Langkah 1...",
    "Langkah 2..."
  ],
  "medium_term": [
    "Langkah 1...",
    "Langkah 2..."
  ],
  "long_term": [
    "Langkah 1...",
    "Langkah 2..."
  ]
}`;

    // Memanggil Gemini 3.1 Flash Lite
    const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userContent}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "LLM_UPSTREAM_ERROR",
            message: `Gagal memanggil API Gemini: ${errText}`,
          },
        },
        { status: 502 }
      );
    }

    const geminiResult = await geminiResponse.json();
    const candidateText =
      geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "EMPTY_LLM_RESPONSE",
            message: "Tidak ada output teks yang dihasilkan oleh model LLM.",
          },
        },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(candidateText);

    // Normalisasi agar selalu array of strings
    const toArray = (val: any): string[] => {
      if (Array.isArray(val)) return val.map((s) => String(s));
      if (typeof val === "string") return [val];
      return [];
    };

    return NextResponse.json({
      success: true,
      data: {
        poi_name,
        focused_aspect,
        provider: "Google Gemini 3.1 Flash Lite",
        generated_at: new Date().toISOString(),
        summary: parsedData.summary || "",
        recommendations: {
          short_term: toArray(parsedData.short_term),
          medium_term: toArray(parsedData.medium_term),
          long_term: toArray(parsedData.long_term),
        },
      },
      error: null,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "SERVER_ERROR",
          message: error?.message || "Terjadi kesalahan internal pada server.",
        },
      },
      { status: 500 }
    );
  }
}
