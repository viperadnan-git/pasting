const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const request = require('request');
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
  "body": `<a onclick="window.location.href = '/'"><div class="container"><h1>404 - Page not found</h1><p><i>Unable to find your pasted code maybe it doesn't exists.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
  "code": false,
  "raw": false,
  "footer": true
};
const page_500 = {
  "heading": "500",
  "body": `<a onclick="window.location.href = '/'"><div class="container"><h1>500 - Unknown Error</h1><p><i>An unknown error has occurred. Contact the developer with the url to fix it.</i></p><span class="text-muted small">Tap to go home</span></div></a>`,
  "code": false,
  "raw": false,
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

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  const parsedUrl = url.parse(req.url);
  let pathname = `${parsedUrl.pathname}`;
  const ext = path.parse(pathname).ext;
  if (pathname == "/") {
    fs.readFile('./assets/main.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', 'text/html');
        res.end(data);
      }
    });
  } else if (pathname.startsWith("/assets/images") || pathname.startsWith("/assets/js")) {
    fs.readFile('.' + pathname, function(err, data) {
      if (err) {
        fs.readFile("./assets/paste.html", function(err, data) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end(Buffer.from(data.toString().replace('#JSON-TEXT', JSON.stringify(page_500))));
        });
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html');
        res.end(data);
      }
    });
  } else if (pathname == "/api" && req.method == "POST") {
    req.on('data', data => {
      post_options.body = data.toString();
      request(post_options, function (error, response) {
        if (error) {
          console.log(error); res.end("Bad Request - Try Again Later");
        } else {
          res.end(url.parse(JSON.parse(response.body).url).pathname);
        }});
    });
  } else if (pathname.startsWith("/raw/")) {
    get_options.url = "https://dumpz.org/"+pathname.substr(5)+"/text/?password="+password;
    request(get_options, function(error, response) {
      if (response.statusCode != 200 || !JSON.parse(response.body).raw) {
        fs.readFile("./assets/paste.html", function(err, data) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end(Buffer.from(data.toString().replace('#JSON-TEXT', JSON.stringify(page_404))));
        });
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end(JSON.parse(response.body).body);
      }
    });
  } else {
    get_options.url = "https://dumpz.org"+pathname+"/text/?password="+password;
    request(get_options, function (error, response) {
      if (response.statusCode != 200) {
        fs.readFile('./assets/paste.html', function(err, data) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end(Buffer.from(data.toString().replace('#JSON-TEXT', JSON.stringify(page_404))));
        });
      } else {
        fs.readFile('./assets/paste.html', function(err, data) {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            res.setHeader('Content-Type', 'text/html');
            res.end(Buffer.from(data.toString().replace('#JSON-TEXT', response.body)));
          }
        });
      }
    });
  }
}).listen(parseInt(port), hostname);

console.log(`Server listening on ${hostname}:${port}`);