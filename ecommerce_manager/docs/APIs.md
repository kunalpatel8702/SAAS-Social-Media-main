# AI eCommerce Manager — API Reference

Base path: **`/api/v1/ecommerce`**

All endpoints require `Authorization: Bearer <JWT>` header.

---

## Store Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store` | Create a new store |
| GET | `/stores` | List all stores for the logged‑in user |
| GET | `/store/:storeId` | Get single store details |
| PUT | `/store/:storeId` | Update store settings |

### POST `/store` — Body
```json
{
  "name": "My Awesome Shop",
  "url": "https://myshop.com",
  "niche": "Sustainable Lifestyle",
  "brandVoice": "Professional",
  "industry": "Retail",
  "settings": {
    "currency": "USD",
    "supportEmail": "help@myshop.com",
    "returnPolicy": "30-day full refund",
    "shippingInfo": "Free shipping over $50"
  }
}
```

---

## Product Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store/:storeId/product` | Add a product to a store |
| GET | `/store/:storeId/products` | List all products in a store |

---

## Review Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/store/:storeId/review` | Add a customer review |
| GET | `/product/:productId/reviews` | List reviews for a product |

---

## AI Generators

### POST `/ai/product-description`
```json
{ "name": "Bamboo Yoga Mat", "category": "Fitness", "features": ["Non-slip", "Eco-friendly"], "brandVoice": "Minimalist" }
```
→ Returns: `{ title, description, benefits[], whyChooseUs, keywords[] }`

### POST `/ai/landing-page`
```json
{ "productId": "...", "goal": "Increase sales", "targetAudience": "Health-conscious millennials" }
```
→ Returns: `{ hero, benefits[], features[], testimonials[], finalCTA }`

### POST `/ai/marketing-copy`
```json
{ "type": "email", "productInfo": "...", "campaignGoal": "drive-sales", "targetAudience": "...", "storeId": "..." }
```
→ Returns: `{ headline, body, cta, hashtags[] }`

### POST `/ai/support-response`
```json
{ "message": "Where is my order?", "storeId": "..." }
```
→ Returns: `{ response, category, requiresHuman }`

---

## AI Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai/review-analysis/:productId` | Sentiment analysis of all reviews for a product |
| GET | `/ai/store-audit/:storeId` | Conversion optimization suggestions |
| GET | `/ai/insights/:storeId` | AI‑generated sales insights and recommendations |
