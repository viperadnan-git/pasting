const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const marked = require('marked');
const hljs = require('highlight.js');

const port = process.argv[3] || process.env.PORT || 8080;
const hostname = process.argv[2] || process.env.HOST || '127.0.0.1';
const password = process.env.PASSWORD || "StrongestPassword";

const map = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword'
};

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

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  const parsedUrl = url.parse(req.url);
  let pathname = `${parsedUrl.pathname}`;
  if (pathname == "/") {
    res.setHeader('Content-type', 'text/html');
    res.end(mainHTML.html());
  } else if (pathname.startsWith("/assets/images") || pathname.startsWith("/assets/js")) {
    const ext = path.parse(pathname).ext;
    fs.readFile('.' + pathname, function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/html');
        res.end(getPage(page_500));
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html');
        res.end(data);
      }
    });
  } else if (pathname == "/api" && req.method == "POST") {
    let body = "";
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (IsJsonContentString(body)) {
        post_options.body = body;
        request(post_options, function (error, response) {
          if (error || response.statusCode != 200) {
            console.log(error);
            res.statusCode = 500;
            res.end("Internal Error - Try Again Later !");
          } else {
            res.end(url.parse(JSON.parse(response.body).url).pathname);
          }});
      } else {
        res.statusCode = 400;
        res.end("Bad Request - Invalid JSON or JSON doesn't have any key named \"content\"");
      }
    });
  } else if (pathname.startsWith("/raw/")) {
    get_options.url = "https://dumpz.org/"+pathname.substr(5)+"/text/?password="+password;
    request(get_options, function(error, response) {
      if (response.statusCode != 200 || !IsJsonContentString(response.body) || !JSON.parse(response.body).raw) {
        res.statusCode = 404;
        res.end("404 - Page Not Found");
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end(JSON.parse(response.body).content);
      }
    });
  } else {
    get_options.url = "https://dumpz.org"+pathname+"/text/?password="+password;
    request(get_options, function (error, response) {
      if (error || response.statusCode != 200 || !IsJsonContentString(response.body)) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(getPage(page_404));
      } else {
        res.setHeader('Content-Type', 'text/html');
        res.end(getPage(JSON.parse(response.body), req.headers.host));
      }
    });
  }
}).listen(parseInt(port), hostname);

function IsJsonContentString(str) {
  try {
    return JSON.parse(str).content ? true: false;
  } catch(e) {
    return false;
  }}

function getPage(json, name="pasting.codes") {
  if (json.heading) {
    pasteHTML("#heading").text(json.heading);
    pasteHTML("title").text(json.heading);
  } else {
    pasteHTML("#heading").text(name);
    pasteHTML("title").text(name);
  }
  json.raw ? pasteHTML("#raw-button").removeClass("d-none"): pasteHTML("#raw-button").addClass("d-none");
  json.footer ? pasteHTML("#is-footer").removeClass("d-none"): pasteHTML("#is-footer").addClass("d-none");
  json.code ? pasteHTML("#content").html("<pre>"+hljs.highlightAuto(json.content).value+"</pre>"): pasteHTML("#content").html(marked(json.content));
  return pasteHTML.html();
}

console.log(`Server listening on ${hostname}:${port}`);