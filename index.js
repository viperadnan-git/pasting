const fs = require('fs');
const url = require('url');
const axios = require('axios');
const marked = require('marked');
const express = require('express');
const cheerio = require('cheerio');
const hljs = require('highlight.js');
const app = express();

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

var post_options = {
    method: 'post',
    url: 'https://dumpz.org/api/dump?lexer=json&password='+password,
    headers: {
        'Content-Type': 'application/json'
    }
};
var get_options = {
    method: 'get'
};

const mainHTML = cheerio.load(fs.readFileSync("./assets/main.html"));
fs.readFile("./assets/template.html", function(error, data) {
    if (!error) {
        mainHTML("#content").html(marked(data.toString()));
    }
});
const pasteHTML = cheerio.load(fs.readFileSync("./assets/paste.html"));


app.use((req, res, next) => {
    res.header("X-Powered-By", "viperadnan");
    console.log(`${req.method} ${req.path}`);
    next();
});
app.use(express.json({
    limit: '50mb'
}));

app.get("/", (req, res) => {
    res.setHeader('Content-type', 'text/html');
    res.end(mainHTML.html());
});

app.get("/assets/*/*", (req, res) => {
    res.sendFile(req.path, {
        root: __dirname
    }, (err) => {
        if (err) res.end(getPage(page_500));
    });
});

app.post("/api", (req, res) => {
    if (req.body.content) {
        post_options.data = Buffer.from(JSON.stringify(req.body));
        axios(post_options)
        .then(function (response) {
            res.end(url.parse(response.data.url).pathname);
        })
        .catch(function (error) {
            console.error(error);
            res.status(500).end("InternalError: Try Again Later !");
        });
    } else {
        res.status(400).end("Bad Request - Invalid JSON or JSON doesn't have any key named 'content'");
    }
});

app.get("/raw/*", (req, res) => {
    get_options.url = "https://dumpz.org/"+req.path.substr(5)+"/text/?password="+password;
    axios(get_options).then((response) => {
        if (response.data.content && response.data.raw) {
            res.setHeader('Content-Type', 'text/plain');
            res.end(response.data.content);
        } else {
            res.status(404).end("404 - Page Not Found");
        }
    }).catch((error) => {
        res.status(404).end("404 - Page Not Found");
    });
});

app.get("/*", (req, res) => {
    get_options.url = "https://dumpz.org"+req.path+"/text/?password="+password;
    axios(get_options).then(
        (response) => {
            if (response.data.content) {
                res.setHeader('Content-Type', 'text/html');
                res.end(getPage(response.data, req.hostname));
            } else {
                res.status(404).end(getPage(page_404));
            }
        }).catch((error) => {
            res.status(404).end(getPage(page_404));
        });
});

function getPage(json, heading="pasting.codes") {
    if (json.heading) {
        pasteHTML("#heading").text(json.heading);
        pasteHTML("title").text(json.heading);
    } else {
        pasteHTML("#heading").text(heading);
        pasteHTML("title").text(heading);
    }
    json.raw ? pasteHTML("#raw-button").removeClass("d-none"): pasteHTML("#raw-button").addClass("d-none");
    json.footer ? pasteHTML("#is-footer").removeClass("d-none"): pasteHTML("#is-footer").addClass("d-none");
    json.code ? pasteHTML("#content").html("<pre id='code'>"+hljs.highlightAuto(json.content).value+"</pre>"): pasteHTML("#content").html(marked(json.content));
    return pasteHTML.html();
}

app.listen(port, hostname, () => {
    console.log(`Listening at ${hostname}:${port}`);
});