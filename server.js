'use strict';

const express = require('express');
const bluebird = require('bluebird');

const cors = require('cors');
const bodyParser = require('body-parser');
const snr = require('swagger-node-runner');
const SwaggerUI = require('swagger-tools/middleware/swagger-ui');

// Don't automatically fail unhandled rejections
// Allows middleware chain to handle it separately
bluebird.onPossiblyUnhandledRejection(() => {});

const middleware = [
  cors,
  parseBody,
  swagger,
  controllerize,
  handleErrors
];

const app = express();

module.exports = {
  app,
  init() {
    return createMW()
      .then(() => app)
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
};

/**
 * Iterate over the list of middleware and bind them to the express instance
 *
 * @return {array} Bound middleware functions
 */
function createMW() {
  return bluebird.mapSeries(middleware, mw => mw(app));
}

/**
 * Parse the body of requests
 * @param {Express instance} app Express instance to bind middleware to.
 */
function parseBody(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
}

/**
 * Create the swagger bindings
 * @param {Express instance} app Express instance to bind middleware to
 */
function swagger(app) {
  return createSNR()
    .then(runner => runner.expressMiddleware())
    .then(swaggerExpress => {
      swaggerExpress.register(app);
      app.use(new SwaggerUI(swaggerExpress.runner.swagger));
    });

    // Create swagger-node-runner instance
    function createSNR() {
      return new bluebird((res, rej) =>
        require('swagger-node-runner').create({
          appRoot: '.',
        }, (err, runner) => {
          if(err) return rej(err);
          return res(runner);
        })
      )
    }
}

/**
 * Create middlware to handle returning promises from controllers
 * @param {Express instance} app Express instance to bind middleware to
 */
function controllerize(app) {
  return app.use(controllerizer);

  // Middleware to handle promise returns from controllers
  function controllerizer(req, res, next) {
    // returning null from a controller implies a 404
    if(res.promise === null) {
      res.status(404).json('Not Found')
    }

    // Either nothing was returned, or it wasn't then-able, so pass it up the chain
    if(res.promise === undefined || !res.promise.then) {
      return next();
    }

    res.promise
      .then(body => {
        // Something else has started to return to the client
        if(res.headersSent) return next();
        // Otherwise, send the return value
        res.json(body);
      })
      .catch(err => {
        next(err);
      })
  }
}

/**
 * Create the error handler
 * @param {Express instance} app Express instance to bind middleware to
 */
function handleErrors(app) {
  app.use(handler);

  // Middleware to trap uncaught errors and return sensible output to the client
  function handler(err, req, res, next) {
    let parsedError = {};
    if(err instanceof Error) {
      parsedError.message = err.message;
      Error.captureStackTrace(parsedError, Error)
    }

    req.log.error(err, 'Unexpect error has occurred');
    res.json(parsedError);
  }
}
