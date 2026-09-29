# SRS: Next.js Sentiment Arena & ABSA Web Studio
- **Related PRD**: `docs/prd/nextjs_absa_studio.prd.md`

## 1. Data Models & Constants
```typescript
export interface AspectMetric {
  category: string;
  positif: number;
  negatif: number;
  netral: number;
  total: number;
}

export interface TickerData {
  positif: number;
  negatif: number;
  netral: number;
  totalAspects: number;
}
```

## 2. API Contract & LLM Connection Spec
- **Endpoint**: `/api/llm/connect` (Next.js API route)
- **Status Envelope**:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LLM_DISCONNECTED",
    "message": "Endpoint model LLM belum terhubung. Konfigurasikan API Key pada environment."
  }
}
```

## 3. UI Interaction Specs
- **Header**: Logo `Sentiment Arena by TNGC.ID` dengan navigasi `LIVE ABSA` dan `METRICS`.
- **Ticker Bar**: 4 slot (Positif: 1.770, Negatif: 223, Netral: 223, ABSA Detected: 1.752 Aspek).
- **Chart Section**: Chart.js bar chart 5 aspek TNGC dengan switch mode: `stacked_bar` (Stacked Polarity) & `grouped_bar` (Breakdown Comparison).
- **Sidebar**:
  - Compact Model Meta (SVM: 87.5%, IndoBERT: 90.2%, Status: OFFLINE).
  - Tab Switcher: Short-Term vs Long-Term preview specifications.
  - Connection Box: Call-to-action "Hubungkan API LLM" dengan dialog modal masukkan API key (Gemini / OpenAI).
