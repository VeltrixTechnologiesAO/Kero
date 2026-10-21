"""
Rate limit por IP com sliding window.
Em memória — para uma só instância é suficiente.
Em produção multi-worker/multi-servidor, substituir por Redis.
"""
import asyncio
import time
from collections import defaultdict, deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        max_requests: int = 120,
        window_seconds: int = 60,
        exclude_paths: tuple[str, ...] = (),
    ) -> None:
        super().__init__(app)
        self.max_requests = max_requests
        self.window = window_seconds
        self.exclude_paths = exclude_paths
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()
        self._last_cleanup = time.time()
        self._cleanup_interval = 300  # 5 min

    def _client_key(self, request: Request) -> str:
        # Em produção atrás de proxy confiável, considera usar X-Forwarded-For.
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next):
        if any(request.url.path.startswith(p) for p in self.exclude_paths):
            return await call_next(request)

        key = self._client_key(request)
        now = time.time()

        async with self._lock:
            self._maybe_cleanup(now)
            hits = self._hits[key]
            cutoff = now - self.window
            while hits and hits[0] < cutoff:
                hits.popleft()

            if len(hits) >= self.max_requests:
                retry_after = int(self.window - (now - hits[0])) + 1
                return JSONResponse(
                    {"detail": "Demasiados pedidos. Tente novamente mais tarde."},
                    status_code=429,
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)

        return await call_next(request)

    def _maybe_cleanup(self, now: float) -> None:
        if now - self._last_cleanup < self._cleanup_interval:
            return
        cutoff = now - self.window
        stale = [k for k, v in self._hits.items() if not v or v[-1] < cutoff]
        for k in stale:
            del self._hits[k]
        self._last_cleanup = now
