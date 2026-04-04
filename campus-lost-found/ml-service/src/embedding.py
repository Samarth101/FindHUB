from sentence_transformers import SentenceTransformer
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance to keep it loaded in memory
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading SentenceTransformer model 'all-MiniLM-L6-v2'...")
        # A tiny fast model producing 384-dimensional embeddings
        _model = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("Model loaded successfully.")
    return _model

def embed_text(text: str) -> list[float]:
    """
    Generate an embedding vector for the given text.
    """
    model = get_model()
    # encode() returns a numpy array, we convert to standard Python list for JSON serialization
    embedding = model.encode(text)
    return embedding.tolist()
