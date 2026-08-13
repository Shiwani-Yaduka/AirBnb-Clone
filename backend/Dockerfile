FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# No persistent disk on Render's free plan: the SQLite file lives in the container's
# own ephemeral filesystem and resets on every redeploy/restart (see keep_alive.py,
# which stops idle-timeout restarts, but not deploy-triggered ones).
ENV DATABASE_URL=sqlite:////app/airbnb_clone.db
ENV ENVIRONMENT=production

EXPOSE 8000

# app.seed is idempotent (no-ops once real data exists), so it's safe to run on
# every boot: it seeds demo data on first launch and never touches it again.
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
