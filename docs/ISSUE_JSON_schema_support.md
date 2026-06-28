# ISSUE: JSON-Based Page & Block Schema Support (Alpha)

## Status

- **Type**: Feature Proposal / Architecture RFC
- **Stage**: **Alpha Support** (Started)
- **Replaces/Enhances**: Traditional Mustache template engine (`mustache.js`)

---

## 1. Objective

Currently, the application renders documents using standard HTML/Mustache templates (`mustache.js`). While Mustache is simple and lightweight, it has significant limitations regarding:

- Page setup configurations (A4 vs Letter, custom margins per page/document type).
- Modular content blocks (e.g. lists, table columns, or paragraph alignment can only be hardcoded in HTML).
- Structured document parsing for modern export formats.

We are proposing and initiating **Alpha support** for a structured **JSON-based Page & Content Block Schema** to eventually replace/complement pure HTML/Mustache templates.

---

## 2. Proposed JSON Schema Structure

The template data, page settings, and document block layout will be defined in a unified JSON structure as shown below:

```json
{
  "page": {
    "size": "A4",
    "margin": {
      "top": 25,
      "bottom": 20,
      "left": 25,
      "right": 20
    }
  },
  "antet": {
    "logo": {
      "position": "left",
      "src": "logo.png"
    },
    "kurum": "T.C. SİNOP ÜNİVERSİTESİ",
    "birim": "Personel Daire Başkanlığı"
  },
  "meta": {
    "sayi": "E-12345678-100-1234",
    "tarih": "21.06.2026",
    "konu": "Temin Dosyası Hk."
  },
  "muhatap": "İlgili Makama",
  "body": [
    {
      "type": "paragraph",
      "text": "..."
    },
    {
      "type": "list",
      "items": ["...", "..."]
    }
  ],
  "imza": {
    "ad": "...",
    "unvan": "..."
  },
  "ekler": ["Ek-1: Liste", "Ek-2: Fatura"]
}
```

---

## 3. Key Benefits of the JSON Block Schema

1. **Dynamic Page Setup**: Margin options (`top`, `bottom`, `left`, `right`) and size (`A4`, `Letter`) are passed directly to the Electron print API (`printToPDF` options) instead of hardcoding `@page` CSS rules inside HTML templates.
2. **Component-Driven Body Rendering**: Instead of writing raw HTML tables/paragraphs, the frontend can render components based on body array `type` properties (e.g., `paragraph`, `list`, `table`).
3. **Better Portability**: Documents are stored as structured data blocks, which makes converting to PDF, Word (DOCX), or HTML much cleaner.

---

## 4. Implementation Path (Alpha)

- **Phase 1 (Alpha - Active)**: Create a parser utility to read these JSON schemas, map them into layout templates dynamically, and allow users to configure page parameters on-the-fly.
- **Phase 2 (Beta)**: Migrate existing stage templates (such as `luzum-muzekkeresi` and `dagitim-cizelgesi`) to leverage the new block structure.
- **Phase 3 (Production)**: Fully deprecate mustache-only templates and shift to unified JSON/Block schemas for all document generations.
