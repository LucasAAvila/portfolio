from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _real_ip(request: Request) -> str:
    # Cloudflare sets CF-Connecting-IP to the original client IP.
    # Fall back to the leftmost X-Forwarded-For entry (set by Railway's proxy),
    # then to the direct TCP peer (local dev / non-proxied environments).
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip.strip()
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_real_ip)
