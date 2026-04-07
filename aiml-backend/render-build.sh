#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip and install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Download SpaCy model (Build phase)
python -m spacy download en_core_web_sm

# Pre-download SentenceTransformer (CLIP) during build phase 
# so it doesn't cause a timeout during the first start/deploy.
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('clip-ViT-B-32')"
