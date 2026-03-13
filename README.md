# AI Agents Module

This directory contains the core AI Agent modules for the SaaS platform.

## 1. Customer Support Agent (`customer_support/`)
- **Main Purpose**: Provides a deployable AI Support Widget for external websites.
- **Key Features**:
  - Semantic Search (Pinecone RAG) for knowledge base retrieval.
  - Automated ticket creation and escalation.
  - Real-time chat via WebSockets/API.
  - Inbox management for human agents.

## 2. eCommerce Manager (`ecommerce_manager/`)
- **Main Purpose**: An autonomous AI brain for Shopify/eCommerce stores.
- **Key Features**:
  - **Signal Detection**: Monitors inventory, reviews, and sales.
  - **Decision Engine**: Automatically generates action plans (e.g., Marketing, Pricing, Operations).
  - **Autonomous Agents**: Specialized roles (Growth, Security, Competitor analysis).
  - **Generators**: AI Product descriptions and Landing pages.

---
**Deployment Note**: Ensure `GROQ_API_KEY` and `PINECONE_API_KEY` are configured in the server environment.
