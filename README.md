![Unofficial KnowYourMeme API](https://raw.githubusercontent.com/lemonismybird/unofficialkymapi/refs/heads/main/images/logo.png) 
An **unoffical API** for KnowYourMeme.com that fetchs About, Origin, Spread, Impact, Various Examples (with and without Images), External links, Views.
# 
# 🐸 Unofficial KnowYourMeme API 🐸
[![API Status](https://img.shields.io/endpoint?url=https%3A%2F%2Fyour-api-url%2Fstatus&style=flat-square)](https://your-api-url)
[![Rate Limit](https://img.shields.io/badge/100%2F15min-Healthy-green?style=flat-square)]()

## Base Endpoints
```
Base URL: GET /unofficialkym/api/v1/memes/[query]
Direct Meme Lookup: /unofficialkym/api/v1/memes/[exact-meme-name]
Meme Search: GET /unofficialkym/api/v1/memes/[search-term]?page=[number]
```

## Features 🛠️
- **Smart Routing**: Direct meme lookup or search fallback
- **Public Data Only**:
  ```javascript
  // Parsed fields from KnowYourMeme HTML
  name, about, origin, spread, image, status, 
  views, tags, impact, references
  ```
- **Caching**: 24-hour response caching
- **Request Rotation**: Randomized user agents
- **Error Resilience**: Fallback values for missing data

## Parameters
| Parameter | Location | Required | Format | Description |
|-----------|----------|----------|--------|-------------|
| `query`   | path     | Yes      | string | Meme slug or search term |
| `page`    | query    | No       | number | Search results page (default: 1) |

## Response Structure

### Direct Match (200 OK)
```json
{
  "status": "success",
  "type": "direct",
  "data": {
    "name": "Doge",
    "about": "An image macro series...",
    "origin": "First appeared on Tumblr...",
    "image": "https://i.kym-cdn.com/.../doge.jpg",
    "status": "Confirmed",
    "views": 2356894,
    "tags": ["Dogs", "Crypto"],
    "impact": {
      "recognition": "Global",
      "derivatives": [
        {"name": "Dogecoin", "url": "/memes/dogecoin"}
      ]
    },
    "references": {
      "videos": ["https://youtube.com/embed/..."],
      "links": [
        {"text": "NY Times Article", "url": "..."}
      ]
    }
  }
}
```

### Search Results (200 OK)
```json
{
  "status": "success",
  "type": "search",
  "data": {
    "results": [
      {
        "name": "Pepe",
        "url": "/memes/pepe",
        "image": "https://i.kym-cdn.com/.../pepe.jpg",
        "description": "Green cartoon frog...",
        "views": 150000000
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_results": 123
    }
  }
}
```

## Error Responses

### 404 Not Found
```json
{
  "status": "error",
  "message": "Meme documentation not found",
  "alternatives": ["doge", "grumpy-cat"]
}
```

### 429 Too Many Requests
```json
{
  "status": "error",
  "message": "Rate limit exceeded",
  "retry_after": 42
}
```

## Rate Limits ⚖️
- **100 requests** per 15 minutes
- Headers included:
  ```http
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 2023-12-25T00:00:00Z
 ```

## Response Headers ℹ️
- `X-Data-Source: KnowYourMeme Public Content`
- `X-Cache-Status: [hit/miss]`
- `X-Response-Time: 152ms`

## Compliance & Security 🔒
- Zero personal data collection. 
- Randomized request fingerprints.
- Cached responses only. 
- No persistent storage. 

## Disclaimer ⚠️
This service provides **read-only access** to public meme documentation.  
Not affiliated with KnowYourMeme.com.
Data accuracy depends on source updates.  

*Data Freshness: 24 Hours.*

***Made with ❤ by Unofficial KnowYourMeme API.***
