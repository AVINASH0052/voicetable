# VoiceTable - AI Restaurant Ops

Full-Stack Engineer Assignment for Bolna AI.

AI-powered restaurant ops platform using Bolna Voice AI for COD order confirmations and post-delivery feedback collection.

## Features
- Order Confirmation via Bolna Voice AI (reduces RTO on COD orders)
- Post-delivery Feedback Collection (ratings, sentiment, complaints)
- Analytics Dashboard (confirmation rate, revenue, sentiment breakdown)
- Full Call Logs with transcripts and extracted data
- CSV bulk order import

## Stack
Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts, Prisma ORM, PostgreSQL (Neon), Vercel

## Env Variables Needed
DATABASE_URL, DIRECT_URL, BOLNA_API_KEY, CONFIRMATION_AGENT_ID, FEEDBACK_AGENT_ID, APP_URL

## Bolna Webhook URLs
POST /api/webhook/bolna  (post-call events)
POST /api/webhook/order-update  (tool calling during live calls)
