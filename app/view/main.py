import logging
import aiohttp_jinja2
from aiohttp import web
from app.helper.pages import Pages

log = logging.getLogger(__name__)

@aiohttp_jinja2.template('main.html')
async def MainView(request):
    return {}

@aiohttp_jinja2.template('paste.html')
async def WildView(request):
    return Pages._404