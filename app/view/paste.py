import logging
import aiohttp_jinja2
from app import db
from aiohttp import web
from app.helper.pages import Pages
from http.client import RemoteDisconnected
from tenacity import retry, retry_if_exception_type, stop_after_attempt

log = logging.getLogger(__name__)

@retry(retry=retry_if_exception_type(RemoteDisconnected), stop=stop_after_attempt(3))
@aiohttp_jinja2.template('paste.html')
async def PasteView(request):
    key = request.match_info['key']
    data = db.get(key)
    log.debug(data)
    if data:
        return data
    else:
        return Pages.Paste404