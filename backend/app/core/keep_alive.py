"""Self-ping loop that stops Render's free-tier instance from spinning down after 15 minutes idle.

This does NOT provide data persistence across deploys/restarts - it only keeps an
already-running instance (and its in-memory/on-disk state) alive between real requests.
"""
import logging
import random
import threading
import time

import requests

from app.core.config import settings

logger = logging.getLogger("keep_alive")

MIN_INTERVAL_SECONDS = 3 * 60
MAX_INTERVAL_SECONDS = 14 * 60


def _ping_loop(url: str) -> None:
    """Ping our own /health endpoint forever on a random 3-14 minute interval."""
    while True:
        try:
            response = requests.get(url, timeout=30)
            logger.info("Keep-alive ping: %s", response.status_code)
        except Exception as exc:
            logger.warning("Keep-alive ping failed: %s", exc)
        time.sleep(random.uniform(MIN_INTERVAL_SECONDS, MAX_INTERVAL_SECONDS))


def start_keep_alive() -> None:
    """Start the background ping thread, only when running in production with a known public URL."""
    if settings.environment != "production" or not settings.public_url:
        return
    url = f"{settings.public_url.rstrip('/')}/health"
    threading.Thread(target=_ping_loop, args=(url,), daemon=True).start()
