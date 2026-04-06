# FindHUB AI/ML Microservice - API Reference

The FindHUB AI Engine is a FastAPI-based microservice that handles semantic matching, metadata extraction, and LLM-powered claim adjudication.

## Base URL
`http://localhost:8000`

---

## Endpoints

### 1. Match Items
`POST /match_items`
Performs a many-to-one similarity search between a Found Item and a list of Lost Reports. Incorporates CLIP embeddings and Haversine distance for proximity boosting.

**Request Body:**
```json
{
  "found_item": {
    "found_item_id": "string",
    "description": "string",
    "category": "string (optional)",
    "color": "string (optional)",
    "brand": "string (optional)",
    "latitude": "number (optional)",
    "longitude": "number (optional)"
  },
  "lost_items": [
    {
      "lost_item_id": "string",
      "description": "string",
      "category": "string (optional)",
      "color": "string (optional)",
      "brand": "string (optional)",
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "matches": [
    {
      "lost_item_id": "string",
      "match_score": 0.85
    }
  ]
}
```

---

### 2. Generate Verification Questions
`POST /generate_questions`
Uses Google Gemini to generate 3 unique, non-revealing ownership questions based on the finder's secret clues.

**Request Body:**
```json
{
  "category": "string",
  "clues": ["string", "string"]
}
```

**Response:**
```json
{
  "questions": [
    "What specific sticker is on the back of the case?",
    "Can you describe the color of the charging port?"
  ]
}
```

---

### 3. Evaluate Answers
`POST /evaluate_answers`
Uses Google Gemini to semantically compare claimant answers against the original secret clues.

**Request Body:**
```json
{
  "category": "string",
  "secret_clues": ["string"],
  "claimant_answers": ["string"]
}
```

**Response:**
```json
{
  "passed": true,
  "reason": "The claimant correctly identified the unique engraving."
}
```

---

### 4. Extract Metadata
`POST /extract_metadata`
Uses spaCy to extract keywords, colors, and potential categories from a description string.

**Request Body:**
```json
{
  "description": "I found a blue water bottle near the swimming pool."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "identified_keywords": ["bottle", "swimming pool"],
    "suggested_category": "bottle",
    "suggested_color": "blue"
  }
}
```
