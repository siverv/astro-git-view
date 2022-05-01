import http from 'http';
import { handler as ssrHandler } from './dist-ssr/server/entry.mjs';

http.createServer(function(req, res) {
  ssrHandler(req, res, err => {
    if(err) {
      res.writeHead(500);
      res.end(err.toString());
    } else {
      // Static assets are served through nginx
      res.writeHead(404);
      res.end();
    }
  });
}).listen(12549);