'use strict';

const env = require('./config/env');
const server = require('./server');
const models = require('./models');

models.waitForInit()
  .then( () => server.init() )
  .then(app => {
    app.listen(env.PORT || 10010);
  });
