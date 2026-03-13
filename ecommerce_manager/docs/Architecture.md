# AI eCommerce Manager — Architecture

## System Overview
A multi-tenant AI‑powered eCommerce management platform that acts as an **AI Employee** for online stores, handling product marketing, store page optimization, customer interaction, and analytics.

## High‑Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  Frontend (React + TailwindCSS)                                │
│  Dashboard · ProductGenerator · LandingPageGen · Marketing     │
└───────────────────────┬────────────────────────────────────────┘
                        │  REST  /api/v1/ecommerce/*
┌───────────────────────▼────────────────────────────────────────┐
│  Express Backend — eCommerce Manager Module                    │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Controllers  │→ │  Services    │→ │  EcommerceAIService   │ │
│  │ (CRUD + AI)  │  │ (validation) │  │  (Groq / Llama‑3)    │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                │
│  ┌─────────────────────────────────────────────────────┐      │
│  │  Mongoose Models                                     │      │
│  │  Store · Product · Review · LandingPage              │      │
│  │  MarketingCampaign · SalesInsight                    │      │
│  └─────────────────────────────────────────────────────┘      │
└───────────────────────┬────────────────────────────────────────┘
                        │
         ┌──────────────▼──────────────┐
         │  MongoDB Atlas / In‑Memory  │
         └─────────────────────────────┘
```

## Core Modules

| # | Module | Service Method | API Route |
|---|--------|---------------|-----------|
| 1 | Product Description Generator | `generateProductDescription` | POST `/ai/product-description` |
| 2 | Landing Page Generator | `generateLandingPage` | POST `/ai/landing-page` |
| 3 | Marketing Copy Assistant | `generateMarketingCopy` | POST `/ai/marketing-copy` |
| 4 | Customer Support AI | `generateSupportResponse` | POST `/ai/support-response` |
| 5 | Store Optimization Audit | `getStoreOptimization` | GET `/ai/store-audit/:storeId` |
| 6 | Review Analyzer | `analyzeReviews` | GET `/ai/review-analysis/:productId` |
| 7 | Sales Insights Dashboard | `generateSalesInsights` | GET `/ai/insights/:storeId` |

## Multi‑Tenancy
- Every model has a `storeId` or `userId` index.
- Auth middleware (`authMiddleware.js`) injects `req.user` for tenant scoping.
- No cross‑tenant data leakage: all queries filter by owner.

## Tech Stack
| Layer | Tech |
|-------|------|
| Runtime | Node.js 20+ / Express 5 |
| AI | Groq SDK → Llama‑3.3‑70B |
| Database | MongoDB (Mongoose 9) |
| Auth | JWT (jsonwebtoken) |
| Queue | BullMQ + Redis |
| Storage | AWS S3 |
