'use strict';

const server = require('./server');

server.init()
  .then(app => {
    app.listen(process.env.PORT || 10010);
  });
