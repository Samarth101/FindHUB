from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Smart Campus Found & Lost - AI Engine", version="1.0.0")

# Models for Request and Response validation
class LostItemInput(BaseModel):
    lost_item_id: str
    description: str
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None

class FoundItemInput(BaseModel):
    found_item_id: str
    description: str
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None

class MatchQuery(BaseModel):
    found_item: FoundItemInput
    lost_items: List[LostItemInput] # MERN ka backend idhar aayega.

@app.get("/")
def root():
    return {"message": "AI/ML Microservice is running successfully."}

@app.post("/extract_metadata")
def extract_metadata(item: LostItemInput):
    """
    Extracts structured data (category, color, brand) from free-form text.
    Currently a mock holding place for the spaCy/NLP logic.
    """
    # TODO: need Implement NLP extraction 
    extracted_data = {
        "identified_keywords": ["bottle", "black"],
        "suggested_category": "water bottle",
        "suggested_color": "black"
    }
    return {"status": "success", "data": extracted_data}

@app.post("/match_items")
def match_items(query: MatchQuery):
    """
    Compares a Found item against a list of active Lost items.
    Returns the similarity scores for each pair.
    """
    # TODO: need Implement CLIP / Cosine Similarity logic 
    results = []
    for lost_item in query.lost_items:
        # Mock calculation
        # If category matches exactly, high score.
        score = 0.5 
        if query.found_item.category and lost_item.category and query.found_item.category.lower() == lost_item.category.lower():
            score += 0.3
        if query.found_item.color and lost_item.color and query.found_item.color.lower() == lost_item.color.lower():
            score += 0.15
            
        results.append({
            "lost_item_id": lost_item.lost_item_id,
            "match_score": min(score, 1.0)
        })
    
    # Sort results with highest score first
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"status": "success", "matches": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
