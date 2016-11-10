'use strict';

const server = require('./server');

server.init()
  .then(app => {
      // eslint-disable-next-line no-process-env
    app.listen(process.env.PORT || 10010);
  });
