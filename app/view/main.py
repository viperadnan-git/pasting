import logging
import aiohttp_jinja2
from aiohttp import web

log = logging.getLogger(__name__)

@aiohttp_jinja2.template('main.html')
async def MainView(request):
    return {}