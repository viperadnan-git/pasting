import logging, sys
from os import environ
from deta import Deta

logging.basicConfig(
    level=logging.DEBUG if environ.get('DEBUG') else logging.WARNING,
    format='%(levelname)s - %(pathname)s - %(message)s'
    )
log = logging.getLogger(__name__)

host = environ.get("HOST", "127.0.0.1")
port = environ.get("PORT", "8080")

try:
    deta = Deta(environ['DETA_KEY'])
    db = deta.Base("pasting")
except KeyError:
    log.error('Set DETA_KEY variable and run it again.')
    sys.exit()