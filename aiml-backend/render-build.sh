#!/usr/bin/env bash
# exit on error
set -o errexit

# Upgrade pip
python -m pip install --upgrade pip

# INSTALL CPU-ONLY PYTORCH (IMPORTANT: This saves 1.5GB+ of disk space and prevents timeouts)
# We do this first so sentence-transformers uses this instead of the GPU version.
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install other dependencies
python -m pip install -r requirements.txt

# Download SpaCy model (Build phase)
python -m spacy download en_core_web_sm

# Pre-download SentenceTransformer (CLIP) during build phase 
# so it doesn't cause a timeout during the first start/deploy.
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('clip-ViT-B-32')"
