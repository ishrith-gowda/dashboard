FROM python:3.12-slim

WORKDIR /app

# Install system deps for potential browser-use needs
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for layer caching
COPY pyproject.toml ./

# Install Python dependencies
RUN pip install --no-cache-dir .

# Copy application code
COPY server/ server/
COPY shared/ shared/
COPY agents/ agents/
COPY tools/ tools/
COPY data/ data/

# Create output directory for agent recordings
RUN mkdir -p output

# Railway sets PORT env var
ENV PORT=8000

CMD uvicorn server.main:app --host 0.0.0.0 --port $PORT
