from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import spacy
from sentence_transformers import SentenceTransformer, util
import os
import json
import math
from dotenv import load_dotenv
from google import genai

load_dotenv()

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
COLORS = {"black", "white", "red", "blue", "green", "yellow", "purple", "pink", "grey", "silver", "gold", "brown", "orange"}

# Models for Request and Response validation
class LostItemInput(BaseModel):
    lost_item_id: str
    description: str
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FoundItemInput(BaseModel):
    found_item_id: str
    description: str
    category: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0 # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

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
        
        # Basic manual boost if specific attributes matched perfectly
        score = cos_sim
        if query.found_item.category and lost_item.category and query.found_item.category.lower() == lost_item.category.lower():
             score += 0.05
        if query.found_item.color and lost_item.color and query.found_item.color.lower() == lost_item.color.lower():
             score += 0.05
             
        # Location boosting using Haversine
        if query.found_item.latitude and query.found_item.longitude and lost_item.latitude and lost_item.longitude:
             dist = haversine_distance(query.found_item.latitude, query.found_item.longitude, lost_item.latitude, lost_item.longitude)
             if dist < 0.2: # Under 200 meters (same building/area)
                 score += 0.20
             elif dist < 1.0: # Under 1km (same campus)
                 score += 0.05
            
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
    Transforms secret verification points into challenge questions using Gemini LLM.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_google_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured in .env file")

    client = genai.Client(api_key=api_key)
    
    categoryName = input_data.category if input_data.category else "item"
    clues_str = ", ".join(input_data.clues)

    prompt = f"""
    You are an AI assistant for a Lost & Found system.
    A user found a '{categoryName}' and left these secret verification clues: {clues_str}
    
    Generate 3 distinct, challenging ownership verification questions to ask the person claiming this item.
    The questions should be designed to test if they know these secret clues. Do not reveal the clues in the questions.
    
    Format your response EXACTLY as a JSON array of strings, for example:
    [
        "What is the brand of the {categoryName}?",
        "Are there any specific stickers on it?"
    ]
    Do not include markdown blocks or any other text.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Clean potential markdown from LLM output
        text_resp = response.text.replace("```json", "").replace("```", "").strip()
        questions = json.loads(text_resp)
        return {"questions": questions}
    except Exception as e:
        print(f"LLM Error: {e}")
        # Fallback
        return {"questions": [f"What is the brand of the {categoryName}?", f"Does the {categoryName} have any unique features or marks?"]}

class AnswerEvaluationInput(BaseModel):
    category: str
    secret_clues: List[str]
    claimant_answers: List[str]

class AnswerEvaluationOutput(BaseModel):
    passed: bool
    reason: str

@app.post("/evaluate_answers", response_model=AnswerEvaluationOutput)
def evaluate_answers(input_data: AnswerEvaluationInput):
    """
    Given the original secret clues and the claimant's answers, uses Gemini to determine 
    if the claimant accurately described the item.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_google_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured in .env file")

    client = genai.Client(api_key=api_key)
    clues_str = ", ".join(input_data.secret_clues)
    answers_str = ", ".join(input_data.claimant_answers)

    prompt = f"""
    You are an AI adjudicator for a Lost & Found system.
    A '{input_data.category}' was found with these Secret Clues: [{clues_str}].
    A claimant who says they own it provided these Answers: [{answers_str}].
    
    Does the claimant's answers closely match the meaning of the secret clues? 
    They do not need to be exact words, just logically equivalent. If they are completely wrong, reject them.
    
    Respond EXACTLY in this JSON format:
    {{
        "passed": bool,
        "reason": "Brief one sentence explanation of why it passed or failed."
    }}
    Do not include markdown or anything else.
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        text_resp = response.text.replace("```json", "").replace("```", "").replace("\n", "").strip()
        data = json.loads(text_resp)
        return {"passed": data.get("passed", False), "reason": data.get("reason", "Parsed LLM response.")}
    except Exception as e:
        print(f"LLM Error during evaluation: {e}")
        return {"passed": False, "reason": "System error during AI evaluation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
