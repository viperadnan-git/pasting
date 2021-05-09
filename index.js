const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');
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
    'method': 'POST',
    'url': 'https://dumpz.org/api/dump?password='+password+'&lexer=json',
    'headers': {
        'Content-Type': 'application/json'
    },
};
var get_options = {
    'method': 'GET'
};

const mainHTML = cheerio.load(fs.readFileSync("./assets/main.html"));
fs.readFile("./assets/template.html", function(error, data) {
    if (!error) {
        mainHTML("#content").html(marked(data.toString()));
    }
});
const pasteHTML = cheerio.load(fs.readFileSync("./assets/paste.html"));

app.use(express.json({
    "limit": "50mb"
}));
app.use((req, res, next) => {
    res.header("X-Powered-By", "viperadnan");
    console.log(`${req.method} ${req.path}`);
    next();
});

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
        post_options.body = JSON.stringify(req.body);
        request(post_options, function (error, response) {
            if (error || response.statusCode != 200) {
                console.log(error);
                res.status(500).end("Internal Error - Try Again Later !");
            } else {
                res.end(url.parse(JSON.parse(response.body).url).pathname);
            }});
    } else {
        res.status(400).end("Bad Request - Invalid JSON or JSON doesn't have any key named\"content\"");
    }
});

app.get("/raw/*", (req, res) => {
    get_options.url = "https://dumpz.org/"+req.path.substr(5)+"/text/?password="+password;
    request(get_options, function(error, response) {
        if (response.statusCode != 200 || !IsJsonContentString(response.body) || !JSON.parse(response.body).raw) {
            res.status(404).end("404 - Page Not Found");
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end(JSON.parse(response.body).content);
        }
    });
});

app.get("/*", (req, res) => {
    get_options.url = "https://dumpz.org"+req.path+"/text/?password="+password;
    request(get_options,
        function (error, response) {
            if (error || response.statusCode != 200 || !IsJsonContentString(response.body)) {
                res.status(404).end(getPage(page_404));
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.end(getPage(JSON.parse(response.body), req.hostname));
            }
        });
});

function IsJsonContentString(str) {
    try {
        return JSON.parse(str).content ? true: false;
    } catch(e) {
        return false;
    }
}

function getPage(json, heading = "pasting.codes") {
    if (json.heading) {
        pasteHTML("#heading").text(json.heading);
        pasteHTML("title").text(json.heading);
    } else {
        pasteHTML("#heading").text(heading);
        pasteHTML("title").text(heading);
    }
    json.raw ? pasteHTML("#raw-button").removeClass("d-none"): pasteHTML("#raw-button").addClass("d-none");
    json.footer ? pasteHTML("#is-footer").removeClass("d-none"): pasteHTML("#is-footer").addClass("d-none");
    json.code ? pasteHTML("#content").html("<pre>"+hljs.highlightAuto(json.content).value+"</pre>"): pasteHTML("#content").html(marked(json.content));
    return pasteHTML.html();
}

app.listen(port, hostname, () => {
    console.log(`Listening at ${hostname}:${port}`);
});