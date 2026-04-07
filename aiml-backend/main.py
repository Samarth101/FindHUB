from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import spacy
from sentence_transformers import SentenceTransformer, util
import os
import json
import math
import time
import torch
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = FastAPI(title="Smart Campus Found & Lost - AI Engine", version="1.0.0")

@app.on_event("startup")
def startup_event():
    device = "CPU" if not torch.cuda.is_available() else "GPU"
    print(f"🚀 FindHUB AI Engine starting in {device} mode")
    print(f"📦 PyTorch version: {torch.__version__}")

def get_gemini_client():
    """Get a fresh Gemini client, re-reading .env each time so new keys take effect."""
    load_dotenv(override=True)  # Force reload .env
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_google_gemini_api_key_here":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured in .env file")
    print(f"🔑 Using Gemini API key: {api_key[:8]}...{api_key[-4:]}")
    return genai.Client(api_key=api_key)

def call_gemini_with_retry(client, model, contents, max_retries=3):
    """Call Gemini with automatic retry and model fallback on rate limit errors."""
    
    # Try the originally requested model, and provide fallbacks since different keys have different quotas
    models_to_try = [model, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
    # Remove duplicates while preserving order
    models_to_try = list(dict.fromkeys(models_to_try))

    for m in models_to_try:
        for attempt in range(max_retries):
            try:
                print(f"🤖 Trying model: {m} (attempt {attempt+1})")
                response = client.models.generate_content(model=m, contents=contents)
                print(f"✅ Success with model: {m}")
                return response
            except Exception as e:
                error_str = str(e)
                # If 404 model not found, don't wait, just try next model immediately
                if '404' in error_str or 'NOT_FOUND' in error_str:
                    print(f"❌ Model {m} not available on this API key. Skipping.")
                    break # Break retry loop, move to next model
                elif '429' in error_str or 'RESOURCE_EXHAUSTED' in error_str:
                    wait_time = (attempt + 1) * 3  # 3s, 6s, 9s
                    print(f"⏳ Rate limited on {m} (attempt {attempt+1}/{max_retries}). Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    if attempt == max_retries - 1:
                        print(f"❌ Quota exhausted for {m}, trying next model...")
                        break  # try next model
                else:
                    raise e
    raise Exception("All Gemini models exhausted or inaccessible on this API key. Please check your Google AI Studio quota.")

@app.get("/")
def read_root():
    """Health check endpoint for Render/deployment."""
    return {"status": "online", "message": "FindHUB AI Engine is ready for requests."}

@app.get("/test_gemini")
def test_gemini():
    """Test endpoint to verify Gemini API key is working."""
    try:
        client = get_gemini_client()
        response = call_gemini_with_retry(client, 'gemini-2.0-flash', 'Say hello in one word.')
        return {"status": "working", "response": response.text.strip()}
    except Exception as e:
        return {"status": "error", "error": str(e)}

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

class Comment(BaseModel):
    user_id: str
    timestamp: str
    text: str

class ThreadAnalysisInput(BaseModel):
    item_title: str
    comments: List[Comment]

class ThreadAnalysisOutput(BaseModel):
    likely_locations: List[str]
    timeline_events: List[str]
    synthesized_clues: List[str]
    summary_trail: str

@app.get("/")
def root():
    return {"message": "AI/ML Microservice is running successfully."}

@app.get("/demo/clip")
def demo_clip():
    """
    Demo endpoint for judges to see CLIP cosine similarity in action.
    Open http://localhost:8000/demo/clip in browser to view.
    """
    # Sample items to demonstrate
    pairs = [
        ("white Apple AirPods with scratches on back", "white earbuds Electronics"),
        ("black JBL headphones wired", "white earbuds Electronics"),
        ("blue Hydroflask water bottle", "white earbuds Electronics"),
    ]
    
    model = get_clip()
    base_text = pairs[0][1]
    base_embedding = model.encode(base_text)
    
    results = []
    for desc, _ in pairs:
        emb = model.encode(desc)
        sim = util.cos_sim(base_embedding, emb).item()
        results.append({
            "text": desc,
            "cosine_similarity": round(sim, 6),
            "embedding_preview": emb[:5].round(4).tolist()
        })
    
    return {
        "model": "clip-ViT-B-32 (OpenAI CLIP via sentence-transformers)",
        "embedding_dimensions": len(base_embedding),
        "base_item": base_text,
        "base_embedding_preview": base_embedding[:5].round(4).tolist(),
        "comparisons": results,
        "explanation": "Higher cosine similarity = more semantically similar. CLIP understands meaning, not just keywords."
    }

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
    Uses CLIP (clip-ViT-B-32) to encode text descriptions into embeddings,
    then computes Cosine Similarity between them.
    """
    # Create an embedding for the found item
    found_desc = query.found_item.description
    if query.found_item.category:
        found_desc += " " + query.found_item.category
    if query.found_item.color:
        found_desc += " " + query.found_item.color
    
    print("\n" + "="*70)
    print("🔍 CLIP SEMANTIC MATCHING ENGINE")
    print("="*70)
    print(f"📦 Model: clip-ViT-B-32 (sentence-transformers)")
    print(f"📄 Found Item Text: \"{found_desc}\"")
        
    found_embedding = get_clip().encode(found_desc)
    print(f"🧠 Found Embedding: vector[{len(found_embedding)}] dims (first 5: {found_embedding[:5].round(4).tolist()})")
    
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
        
        print(f"\n  📋 Lost Item [{lost_item.lost_item_id[:8]}...]: \"{lost_desc}\"")
        print(f"  🧠 Lost Embedding:  vector[{len(lost_embedding)}] dims")
        print(f"  📐 CLIP Cosine Similarity: {cos_sim:.6f}")
        
        # Basic manual boost if specific attributes matched perfectly
        score = cos_sim
        boosts = []
        if query.found_item.category and lost_item.category and query.found_item.category.lower() == lost_item.category.lower():
             score += 0.05
             boosts.append(f"category match (+0.05)")
        if query.found_item.color and lost_item.color and query.found_item.color.lower() == lost_item.color.lower():
             score += 0.05
             boosts.append(f"color match (+0.05)")
             
        # Location boosting using Haversine
        if query.found_item.latitude and query.found_item.longitude and lost_item.latitude and lost_item.longitude:
             dist = haversine_distance(query.found_item.latitude, query.found_item.longitude, lost_item.latitude, lost_item.longitude)
             if dist < 0.2: # Under 200 meters (same building/area)
                 score += 0.20
                 boosts.append(f"GPS proximity <200m (+0.20, dist={dist:.3f}km)")
             elif dist < 1.0: # Under 1km (same campus)
                 score += 0.05
                 boosts.append(f"GPS proximity <1km (+0.05, dist={dist:.3f}km)")
        
        if boosts:
            print(f"  🚀 Attribute Boosts: {', '.join(boosts)}")
        print(f"  ✅ Final Composite Score: {min(score, 1.0):.6f}")
            
        results.append({
            "lost_item_id": lost_item.lost_item_id,
            "match_score": min(score, 1.0) # Cap at 1.0
        })
    
    # Sort results with highest score first
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    print(f"\n🏆 Best Match: {results[0]['match_score']:.4f}" if results else "\n❌ No items to match")
    print("="*70 + "\n")
    
    return {"status": "success", "matches": results}

@app.post("/generate_questions", response_model=VerificationQuestionsOutput)
def generate_questions(input_data: VerificationCluesInput):
    """
    Transforms secret verification points into challenge questions using Gemini LLM.
    """
    client = get_gemini_client()
    
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
        response = call_gemini_with_retry(client, 'gemini-2.0-flash', prompt)
        
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
    qa_pairs: Optional[List[dict]] = None

class AnswerEvaluationOutput(BaseModel):
    passed: bool
    reason: str

@app.post("/evaluate_answers", response_model=AnswerEvaluationOutput)
def evaluate_answers(input_data: AnswerEvaluationInput):
    """
    Given the original secret clues and the claimant's answers, uses Gemini to determine 
    if the claimant accurately described the item.
    """
    client = get_gemini_client()
    clues_str = "\n".join([f"- {c}" for c in input_data.secret_clues])
    
    # Build Q&A context if available
    if input_data.qa_pairs and len(input_data.qa_pairs) > 0:
        qa_str = "\n".join([f"Q: {qa.get('question', 'N/A')}\nA: {qa.get('answer', 'N/A')}" for qa in input_data.qa_pairs])
    else:
        qa_str = "\n".join([f"Answer {i+1}: {a}" for i, a in enumerate(input_data.claimant_answers)])

    prompt = f"""
    You are an AI adjudicator for a Campus Lost & Found system.
    
    A '{input_data.category}' was found on campus. The finder provided these SECRET CLUES about the item:
    {clues_str}
    
    A student claiming to be the owner answered verification questions:
    {qa_str}
    
    IMPORTANT EVALUATION RULES:
    1. The claimant does NOT need to use the exact same words as the secret clues.
    2. If the claimant's descriptions are SEMANTICALLY SIMILAR or logically equivalent to the clues, they PASS.
    3. For example: "scratch on back" and "scratches on the back side" mean the same thing = PASS.
    4. For example: "white color" and "white" mean the same thing = PASS.
    5. Only REJECT if the answers are clearly WRONG, IRRELEVANT, or CONTRADICTORY to the clues.
    6. Be LENIENT - if a real owner is describing their own item, their description will naturally align with the clues even if worded differently.
    
    Respond EXACTLY in this JSON format:
    {{
        "passed": true or false,
        "reason": "Brief one sentence explanation."
    }}
    Do not include markdown or anything else. Just the raw JSON.
    """

    try:
        response = call_gemini_with_retry(client, 'gemini-2.0-flash', prompt)
        text_resp = response.text.replace("```json", "").replace("```", "").replace("\n", "").strip()
        data = json.loads(text_resp)
        return {"passed": data.get("passed", False), "reason": data.get("reason", "Parsed LLM response.")}
    except Exception as e:
        print(f"LLM Error during evaluation: {e}")
        return {"passed": False, "reason": "System error during AI evaluation."}

@app.post("/analyze_thread", response_model=ThreadAnalysisOutput)
def analyze_thread(input_data: ThreadAnalysisInput):
    """
    Parses an array of anonymous comments to deduce a timeline and location trail for a lost item.
    """
    client = get_gemini_client()
    
    formatted_comments = ""
    for c in input_data.comments:
        formatted_comments += f"[{c.timestamp}] User {c.user_id}: {c.text}\n"

    prompt = f"""
    You are an AI investigator for a campus Lost & Found system.
    A Reddit-style thread has been created for a lost item: "{input_data.item_title}".
    
    Here are the comments from various students:
    {formatted_comments}
    
    Analyze the text and extract:
    1. A list of exact locations mentioned where the item might be.
    2. A chronological timeline of events mapping when it was spotted.
    3. Any repeated/synthesized clues regarding the person who took it or its condition.
    4. A one-sentence final summary trail (e.g. "Item was moved from Lab 10 to Library").
    
    Respond EXACTLY with valid JSON:
    {{
        "likely_locations": ["string"],
        "timeline_events": ["string"],
        "synthesized_clues": ["string"],
        "summary_trail": "string"
    }}
    Do not wrap in markdown or include backticks. Just pure JSON.
    """

    try:
        response = call_gemini_with_retry(client, 'gemini-2.0-flash', prompt)
        text_resp = response.text.replace("```json", "").replace("```", "").replace("\n", "").strip()
        data = json.loads(text_resp)
        return ThreadAnalysisOutput(**data)
    except Exception as e:
        print(f"LLM Error during thread analysis: {e}")
        return ThreadAnalysisOutput(
            likely_locations=["Unknown"],
            timeline_events=["Could not parse timeline from comments."],
            synthesized_clues=["No concrete clues synthesized."],
            summary_trail="Analysis failed, refer to manual comments."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
