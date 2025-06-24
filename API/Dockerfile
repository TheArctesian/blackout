FROM python:3.9-slim

# Install Tesseract OCR and other dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    libgl1-mesa-glx \
    libglib2.0-0 \
    build-essential \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .

# Install spaCy and its dependencies with specific build options
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir spacy
RUN python -m spacy download en_core_web_md

# Copy the application code
COPY app.py .

# Create required directories
RUN mkdir -p uploads redacted

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py

# Expose the port
EXPOSE 5000

# Run the application
CMD ["flask", "run", "--host=0.0.0.0"]
