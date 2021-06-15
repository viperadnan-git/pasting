import logging
import random, string
from app import db
from aiohttp import web
from app.helper.pages import Pages
from urllib.parse import quote
from http.client import RemoteDisconnected
from tenacity import retry, retry_if_exception_type, stop_after_attempt

log = logging.getLogger(__name__)
alphanumeric_chars = string.ascii_uppercase + string.ascii_lowercase + string.digits

@retry(retry=retry_if_exception_type(RemoteDisconnected), stop=stop_after_attempt(3))
async def ApiView(request):
    data = await request.json()
    log.debug(data)
    
    if not data.get('content'):
        return web.Response(status=400, text="400: Bad Request, JSON doesn't have key named 'content'.")
    
    key = str(data['key']) if data.get('key') else await generate_key(data)
    if not key.isalnum():
        return web.Response(status=400, text="400: Bad Request, Key should only contains alphanumeric characters.")

    if db.get(key):
        return web.Response(status=400, text="400: Bad Request, Key already exists enter new one.")
    
    db.put(data, key)
    return web.Response(status=200, text=key)

@retry(retry=retry_if_exception_type(RemoteDisconnected), stop=stop_after_attempt(3))
async def RawView(request):
    key = request.match_info['key']
    data = db.get(key)
    if data:
        return web.Response(status=200, text=data['content'])
    else:
        return Pages.Paste404

async def generate_key(dict):
    return "".join(random.choices(alphanumeric_chars, k=12))