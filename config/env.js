'use strict';

const dotenv = require('dotenv');
const _ = require('lodash');

dotenv.load({
  path: `${__dirname}/../.env`,
  silent: true,
});

// eslint-disable-next-line no-process-env
module.exports = _.assign({}, process.env);
