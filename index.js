const fs = require('fs');
const { Deta } = require('deta');
const marked = require('marked');
const express = require('express');
const cheerio = require('cheerio');

const app = express();
const deta = Deta();
const db = deta.Base('pasting');

const port = process.argv[3] || process.env.PORT || 8080;
const hostname = process.argv[2] || process.env.HOST || '127.0.0.1';
const password = process.env.PASSWORD || "StrongestPassword";

const page_404 = {
    "heading": "404",
    "content": `<a class="text-decoration-none text-dark" href="/"><div class="container"><h1>404 - Page not found</h1><p><i>Unable to find your pasted code maybe it doesn't exists.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
    "footer": true
};
const page_500 = {
    "heading": "500",
    "content": `<a class="text-decoration-none text-dark" href="/"><div class="container"><h1>500 - Unknown Error</h1><p><i>An unknown error has occurred. Contact the developer with the url to fix it. Inconvenience is strictly regretted.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
    "footer": true
};

String.prototype.isalnum = function() {
    var regExp = /^[A-Za-z0-9]+$/;
    return (this.match(regExp));
};

const mainHTML = cheerio.load(fs.readFileSync("./assets/main.html"));
fs.readFile("./assets/template.html", function(error, data) {
    if (!error) {
        mainHTML("#content").html(marked(data.toString()));
    }
});
const pasteHTMLraw = fs.readFileSync("./assets/paste.html");


app.use(async (req, res, next) => {
    res.header("X-Powered-By", "viperadnan");
    // console.log(`${req.method} ${req.path}`);
    next();
});
app.use(express.json({
    limit: '50mb'
}));
app.use('/static', express.static('assets/static'));

app.get("/", async (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.end(mainHTML.html());
});

app.post("/api", async (req, res) => {
    if (req.body.content) {
        if (!req.body.key) {
            req.body.key = await generateKey();
        }
        if (req.body.key.isalnum()) {
            try {
                res.end((await db.insert(
                    req.body
                )).key);
            } catch(e) {
                res.status(400).end(e.message);
            }
        } else {
            res.status(400).end('Key can only contains alphanumeric characters');
        }
    } else {
        res.status(400).end("Bad Request - No content found.");
    }
});

app.get("/raw/:key", async (req, res) => {
    data = await db.get(req.params.key);
    if (data && data.raw) {
        res.setHeader('Content-Type', 'text/plain');
        res.end(data.content);
    } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(await getPage(page_404));
    }
});

app.get("/:key", async (req, res) => {
    data = await db.get(req.params.key);
    res.setHeader('Content-Type', 'text/html');
    if (data) {
        res.end(await getPage(data, req.hostname));
    } else {
        res.end(await getPage(page_404));
    }
});

async function getPage(data, heading = "pasting") {
    var pasteHTML = cheerio.load(pasteHTMLraw);
    if (data.heading) {
        pasteHTML("#heading").text(data.heading);
        pasteHTML("title").text(data.heading);
    } else {
        pasteHTML("#heading").text(heading);
        pasteHTML("title").text(heading);
    }
    if (data.raw) {
        pasteHTML("#raw-button").removeClass("d-none");
    }
    if (data.footer) {
        pasteHTML("#is-footer").removeClass("d-none");
    }
    if (data.code) {
        pasteHTML('#content').append(`<pre id="code"></pre><script type="text/javascript">$(document).ready(function(){$("#code").html(hljs.highlightAuto($('#code').text()).value);});</script>`);
        pasteHTML('#code').text(data.content);
    } else {
        pasteHTML('#content').html(await marked(data.content));
    }
    return pasteHTML.html();
}

async function generateKey(length = 8) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

/* Uncomment if running on local server
app.listen(port, hostname, () => {
    console.log(`Listening at ${hostname}:${port}`);
});
*/

// Uncomment if deploying on Deta
module.exports = app;