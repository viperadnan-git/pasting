const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const port = process.argv[3] || 8080;
const hostname = process.argv[2] || '127.0.0.1';

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  const ext = path.parse(pathname).ext;
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
  if (pathname == "./") {
    fs.readFile('./assets/index.html', function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html' );
        res.end(data);
      }
    });
  } else if (pathname.startsWith("./assets/images")) {
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html' );
        res.end(data);
      }
    });
  } else {
    fs.readFile('./assets/blog.html', function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        res.setHeader('Content-type', map[ext] || 'text/html' );
        res.end(data);
      }
    });
  }
}).listen(parseInt(port), hostname);

console.log(`Server listening on ${hostname}:${port}`);