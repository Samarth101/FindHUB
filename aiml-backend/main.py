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

class VerificationCluesInput(BaseModel):
    category: Optional[str] = "item"
    clues: List[str]

class VerificationQuestionsOutput(BaseModel):
    questions: List[str]

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

@app.post("/generate_questions", response_model=VerificationQuestionsOutput)
def generate_questions(input_data: VerificationCluesInput):
    """
    Transforms secret verification points (e.g. 'red sticker', 'scratch on left') 
    into challenge questions for the claimant.
    """
    questions = []
    
    # Generic question based on category
    categoryName = input_data.category if input_data.category else "item"
    
    for clue in input_data.clues:
        clue_lower = clue.lower()
        
        # Rule-based natural language generation
        if "color" in clue_lower or any(c in clue_lower for c in COLORS):
            questions.append(f"What color is the {categoryName} or any part of it?")
        elif "sticker" in clue_lower:
            questions.append(f"Are there any stickers on the {categoryName}? If yes, where/what are they?")
        elif "scratch" in clue_lower or "dent" in clue_lower or "mark" in clue_lower:
            questions.append(f"Are there any visible scratches, dents, or marks on the {categoryName}?")
        elif "brand" in clue_lower:
            questions.append(f"What is the brand or manufacturer of the {categoryName}?")
        elif "wallpaper" in clue_lower or "screen" in clue_lower:
            questions.append("Can you describe the lock screen wallpaper or any screen details?")
        elif "engrave" in clue_lower or "text" in clue_lower or "name" in clue_lower:
            questions.append("Is there any specific text, name, or engraving written on it?")
        elif "inside" in clue_lower or "contain" in clue_lower:
            questions.append(f"What items were inside the {categoryName}?")
        else:
            # Fallback using NLP to extract the main noun
            nlp_model = get_nlp()
            doc = nlp_model(clue)
            nouns = [token.text for token in doc if token.pos_ == "NOUN"]
            if nouns:
                main_noun = nouns[-1]
                questions.append(f"Can you provide details about the '{main_noun}' on the {categoryName}?")
            else:
                questions.append(f"Can you provide more specific details regarding this feature: '{clue}'?")
                
    # Remove duplicates but preserve order
    seen = set()
    unique_questions = [x for x in questions if not (x in seen or seen.add(x))]
    
    # Optional generic fallback if no clues or too few
    if len(unique_questions) == 0:
        unique_questions.append(f"What is the brand of the {categoryName}?")
        unique_questions.append(f"Does the {categoryName} have any unique features?")

    return {"questions": unique_questions[:5]} # Return up to 5 questions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
