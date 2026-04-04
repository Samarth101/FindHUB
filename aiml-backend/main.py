from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import spacy
from sentence_transformers import SentenceTransformer, util

app = FastAPI(title="Smart Campus Found & Lost - AI Engine", version="1.0.0")

# Global models (loaded lazily on first request to speed up server boot)
_nlp = None
_clip_model = None

def get_nlp():
    global _nlp
    if _nlp is None:
        print("Loading NLP Model (spaCy)...")
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Warning: spaCy model 'en_core_web_sm' not found. Will use blank model.")
            _nlp = spacy.blank("en")
    return _nlp

def get_clip():
    global _clip_model
    if _clip_model is None:
        print("Loading Embedding Model (CLIP)... this might take a few seconds!")
        _clip_model = SentenceTransformer('clip-ViT-B-32')
    return _clip_model

# Common color taxonomy for extraction
COLORS = {"black", "white", "red", "blue", "green", "yellow", "purple", "pink", "grey", "silver", "gold", "brown"}

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
    # Use spaCy for NLP extraction 
    doc = get_nlp()(item.description.lower())
    
    # Extract noun chunks for potential categories
    keywords = [chunk.root.text for chunk in doc.noun_chunks]
    
    # Extract colors by matching tokens
    extracted_colors = [token.text for token in doc if token.text in COLORS]
    
    extracted_data = {
        "identified_keywords": list(set(keywords)),
        "suggested_category": keywords[-1] if keywords else None, # Simple heuristic: last noun chunk root
        "suggested_color": extracted_colors[0] if extracted_colors else None
    }
    return {"status": "success", "data": extracted_data}

@app.post("/match_items")
def match_items(query: MatchQuery):
    """
    Compares a Found item against a list of active Lost items.
    Returns the similarity scores for each pair.
    """
    # Create an embedding for the found item
    found_desc = query.found_item.description
    if query.found_item.category:
        found_desc += " " + query.found_item.category
    if query.found_item.color:
        found_desc += " " + query.found_item.color
        
    found_embedding = get_clip().encode(found_desc)
    
    results = []
    for lost_item in query.lost_items:
        # Create an embedding for each lost item
        lost_desc = lost_item.description
        if lost_item.category:
            lost_desc += " " + lost_item.category
        if lost_item.color:
            lost_desc += " " + lost_item.color

        lost_embedding = get_clip().encode(lost_desc)
        
        # Calculate Cosine Similarity
        cos_sim = util.cos_sim(found_embedding, lost_embedding).item()
        
        # Basic boost if specific attributes matched perfectly
        score = cos_sim
        if query.found_item.category and lost_item.category and query.found_item.category.lower() == lost_item.category.lower():
             score += 0.15
        if query.found_item.color and lost_item.color and query.found_item.color.lower() == lost_item.color.lower():
             score += 0.10
            
        results.append({
            "lost_item_id": lost_item.lost_item_id,
            "match_score": min(score, 1.0) # Cap at 1.0
        })
    
    # Sort results with highest score first
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    return {"status": "success", "matches": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
