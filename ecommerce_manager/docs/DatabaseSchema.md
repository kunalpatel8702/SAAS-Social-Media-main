# AI eCommerce Manager — Database Schema

## Models Overview

| Model | File | Purpose |
|-------|------|---------|
| Store | `models/Store.js` | Tenant store configuration |
| Product | `models/Product.js` | Store catalog items |
| Review | `models/Review.js` | Customer reviews + sentiment |
| LandingPage | `models/LandingPage.js` | AI‑generated sales pages |
| MarketingCampaign | `models/MarketingCampaign.js` | Campaign copy drafts |
| SalesInsight | `models/SalesInsight.js` | Periodic analytics snapshots |

---

## Relationships

```
User (existing)
 └── Store (userId)
      ├── Product (storeId)
      │    ├── Review (productId + storeId)
      │    └── LandingPage (productId + storeId)
      ├── MarketingCampaign (storeId)
      └── SalesInsight (storeId)
```

## Field Details

### Store
| Field | Type | Notes |
|-------|------|-------|
| userId | ObjectId → User | Owner / tenant key |
| name | String | Required |
| brandVoice | Enum | Professional, Playful, Luxury, Minimalist, Friendly |
| settings.currency | String | Default USD |
| settings.returnPolicy | String | Free text |
| settings.shippingInfo | String | Free text |

### Product
| Field | Type | Notes |
|-------|------|-------|
| storeId | ObjectId → Store | Required, indexed |
| name | String | Required |
| features | [String] | Bullet‑pointed features |
| aiGeneratedDescription | String | Populated by AI generator |
| seoKeywords | [String] | Populated by AI generator |

### Review
| Field | Type | Notes |
|-------|------|-------|
| productId | ObjectId → Product | Required, indexed |
| storeId | ObjectId → Store | Required, indexed |
| rating | Number | 1–5 |
| sentiment | Enum | Positive / Neutral / Negative |
| isProcessed | Boolean | True after AI analysis |

### MarketingCampaign
| Field | Type | Notes |
|-------|------|-------|
| type | Enum | email, facebook-ad, instagram-post, google-ad, product-launch, social-caption |
| status | Enum | draft, scheduled, sent, archived |

### SalesInsight
| Field | Type | Notes |
|-------|------|-------|
| period | Enum | daily, weekly, monthly |
| metrics | Object | totalProducts, totalReviews, avgRating, sentimentBreakdown, topProducts |
| aiSuggestions | [String] | AI‑generated action items |
