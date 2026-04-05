from sklearn.metrics.pairwise import cosine_similarity
from .embedding import embed_text
import numpy as np

def compute_similarity(text1: str, text2: str) -> float:
    """
    Compute cosine similarity between two texts using their embeddings.
    Returns a float between 0.0 and 1.0.
    """
    if not text1.strip() or not text2.strip():
        return 0.0
        
    vec1 = np.array(embed_text(text1)).reshape(1, -1)
    vec2 = np.array(embed_text(text2)).reshape(1, -1)
    
    # Cosine similarity returns values between -1 and 1
    # For text embeddings from sentence transformers, they are generally positive,
    # but we clip to [0, 1] just in case to match the backend expectations.
    score = cosine_similarity(vec1, vec2)[0][0]
    return float(max(0.0, score))
