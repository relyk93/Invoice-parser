# Invoice Parser AI

> AI-powered invoice and receipt data extraction — upload a doc, get clean structured data instantly.

## What It Does

Users upload PDF or image invoices/receipts. The app uses Claude AI to extract:
- Vendor name, date, invoice number
- Line items with descriptions, quantities, unit prices
- Subtotal, tax, and total amounts
- Payment terms and due dates

Results are displayed in a clean table and can be exported as CSV or copied to a spreadsheet.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| AI | Anthropic Claude API |
| Auth + DB | Supabase |
| Payments | Stripe |
| Hosting | Vercel |

## Pricing Plans

| Plan | Price | Documents/mo |
|------|-------|--------------|
| Starter | $12/mo | 50 docs |
| Pro | $29/mo | Unlimited |

## Getting Started

### Prerequisites
- Node.js 18+
- Accounts: Anthropic, Supabase, Stripe

### Setup

```bash
# Clone and install
git clone https://github.com/relyk93/Invoice-parser.git
cd Invoice-parser
npm install

# Configure environment
cp .env.example .env.local
# Fill in your API keys in .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── parse/        # AI extraction endpoint
│   │   └── stripe/       # Stripe webhook handler
│   ├── dashboard/        # User dashboard
│   ├── layout.tsx
│   └── page.tsx          # Landing + upload page
├── components/
│   ├── UploadZone.tsx
│   └── ResultTable.tsx
├── lib/
│   ├── anthropic.ts      # Claude API client
│   └── supabase.ts       # Supabase client
└── types/
    └── index.ts
```

## Environment Variables

See `.env.example` for all required variables.

## Deployment

Deploy to Vercel:
```bash
npx vercel
```

Set all environment variables from `.env.example` in the Vercel dashboard.
Add your Vercel URL as the Stripe webhook endpoint.
