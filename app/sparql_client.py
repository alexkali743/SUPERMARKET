# sparql_client.py
import time
import requests

try:
    from app.config import (
        GRAPHDB_ENDPOINT,
        GRAPHDB_UPDATE_ENDPOINT,
        GRAPHDB_USER,
        GRAPHDB_PASS,
        HTTP_TIMEOUT,
    )
except Exception:
    from config import (
        GRAPHDB_ENDPOINT,
        GRAPHDB_UPDATE_ENDPOINT,
        GRAPHDB_USER,
        GRAPHDB_PASS,
        HTTP_TIMEOUT,
    )

AUTH = (GRAPHDB_USER, GRAPHDB_PASS) if GRAPHDB_USER and GRAPHDB_PASS else None
TIMEOUT = float(HTTP_TIMEOUT or 10.0)
MAX_RETRIES = 3
BACKOFF = 0.6

HDR_QUERY = {
    "Content-Type": "application/sparql-query; charset=utf-8",
    "Accept": "application/sparql-results+json",
    "Connection": "close",
}
HDR_UPDATE_SPARQL = {
    "Content-Type": "application/sparql-update; charset=utf-8",
    "Accept": "text/plain, */*;q=0.1",
    "Connection": "close",
}
HDR_UPDATE_FORM = {
    "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    "Accept": "text/plain, */*;q=0.1",
    "Connection": "close",
}

def _retry_loop(fn, where: str, url: str):
    last_exc = None
    delay = BACKOFF
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return fn()
        except requests.RequestException as e:
            last_exc = e
            if attempt >= MAX_RETRIES:
                break
            time.sleep(delay)
            delay *= 2
    msg = getattr(last_exc.response, "text", str(last_exc)) if isinstance(last_exc, requests.RequestException) else str(last_exc)
    raise Exception(f"GraphDB {where} error @ {url}: All connection attempts failed ({MAX_RETRIES} tries). Last error: {msg}")

def query_graphdb(sparql_query: str):
    def _do():
        r = requests.post(
            GRAPHDB_ENDPOINT,
            data=sparql_query.encode("utf-8"),
            headers=HDR_QUERY,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        return r.json()
    return _retry_loop(_do, "SELECT", GRAPHDB_ENDPOINT)

def update_graphdb(sparql_update: str):
    # 1) application/sparql-update
    def _do_update_hdr():
        r = requests.post(
            GRAPHDB_UPDATE_ENDPOINT,
            data=sparql_update.encode("utf-8"),
            headers=HDR_UPDATE_SPARQL,
            auth=AUTH,
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        return {"ok": True}
    try:
        return _retry_loop(_do_update_hdr, "UPDATE", GRAPHDB_UPDATE_ENDPOINT)
    except Exception as first_err:
        # 2) fallback: application/x-www-form-urlencoded (update=...)
        def _do_update_form():
            r = requests.post(
                GRAPHDB_UPDATE_ENDPOINT,
                data={"update": sparql_update},
                headers=HDR_UPDATE_FORM,
                auth=AUTH,
                timeout=TIMEOUT,
            )
            r.raise_for_status()
            return {"ok": True}
        try:
            return _retry_loop(_do_update_form, "UPDATE(form)", GRAPHDB_UPDATE_ENDPOINT)
        except Exception as second_err:
            raise Exception(
                "GraphDB UPDATE failed on both methods.\n"
                f"- application/sparql-update: {first_err}\n"
                f"- application/x-www-form-urlencoded: {second_err}"
            )
