'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const env = require('../config/env');
const debug = require('debug')('my-app:sequelize');

module.exports = loadModels(__dirname, '');

function loadModels(folder, prefix) {
  const options = {
    logging(msg) {
      debug(msg);
    },
  };

  const sequelize = new Sequelize(
        env.DB_NAME,
        env.DB_USER,
        env.DB_PASSWORD,
        _.assign( {}, options, {
          host: env.DB_HOST,
          dialect: env.DB_DIALECT,
          define: {
            schema: env.DB_SCHEMA || 'dbo',
          },
        })
    );

  const models = { sequelize, Sequelize };

  // get names of all files in current folder
  const files = fs.readdirSync(folder);

  // Read models from the current directory
  files
    .filter( fileName => fileName.slice(-3) === '.js' ) // only .js files
    .filter( fileName => fileName !== 'index.js' ) // don't include index
    .forEach( fileName => {
      const model = sequelize.import(path.join(folder, fileName));
      models[model.name] = model;
    });

  Object.keys(models).forEach( modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  models.waitForInit = function() {
    return sequelize.authenticate()
      .catch(err => {
        debug(err);
        throw err;
      });
  };

  return models;
}
