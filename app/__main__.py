import jinja2
import logging
import aiohttp_jinja2
from aiohttp import web
from app.view import *
from app import host, port

log = logging.getLogger(__name__)

async def setup_app():
    app = web.Application()
    aiohttp_jinja2.setup(app,
        loader=jinja2.FileSystemLoader(
            './assets/'
        )
    )
    routes = [
        web.get("/", MainView),
        web.static('/static', './assets/static'),
        web.post('/api', ApiView),
        web.get('/raw/{key}', RawView),
        web.get('/{key}', PasteView)
        ]
    app.add_routes(routes)
    return app

web.run_app(setup_app(), host=host, port=port)