import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

from .embedding import embed_text, get_model
from .similarity import compute_similarity

app = FastAPI(title="FindHUB ML Service", description="AI matching service for campus lost and found.")

class EmbedRequest(BaseModel):
    text: str

class EmbedResponse(BaseModel):
    embedding: list[float]

class SimilarityRequest(BaseModel):
    textA: str
    textB: str

class SimilarityResponse(BaseModel):
    score: float

@app.on_event("startup")
async def startup_event():
    # Preload the ML model when the server starts so first requests aren't slow
    get_model()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml_service"}

@app.post("/embed", response_model=EmbedResponse)
def embed(body: EmbedRequest):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        vector = embed_text(body.text)
        return {"embedding": vector}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/similarity", response_model=SimilarityResponse)
def similarity(body: SimilarityRequest):
    try:
        score = compute_similarity(body.textA, body.textB)
        return {"score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
