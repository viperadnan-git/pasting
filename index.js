const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const request = require('request');
const port = process.argv[3] || process.env.PORT || 8080;
const hostname = process.argv[2] || '127.0.0.1';
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
    fs.readFile('./assets/index.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html');
        res.end(data);
      }
    });
  } else if (pathname.startsWith("/assets/images") || pathname.startsWith("/assets/js")) {
    fs.readFile('.' + pathname, function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html');
        res.end(data);
      }
    });
  } else if (pathname == "/api" && req.method == "POST") {
    req.on('data', data => {
      post_options.body = data.toString();
      request(post_options, function (error, response) {
        if (error) {console.log(error);res.end("Bad Request - Try Again Later")} else {
        res.end(url.parse(JSON.parse(response.body).url).pathname);
      }});
    });
  } else {
    fs.readFile('./assets/blog.html', function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        get_options.url = "https://dumpz.org"+pathname+"/text/?password="+password;
        request(get_options, function (error, response) {
          if (response.statusCode != 200) {
            res.statusCode = 404;
            res.end("404 ! &#129321;");
          } else {
            res.setHeader('Content-Type', map[ext] || 'text/html');
            res.end(Buffer.from(data.toString().replace('#JSON-TEXT', response.body)));
          }
          });
      }
    });
  }
}).listen(parseInt(port), hostname);

console.log(`Server listening on ${hostname}:${port}`);