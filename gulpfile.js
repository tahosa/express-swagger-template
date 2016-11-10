'use strict';
/* eslint-disable no-console */

const env = require('./config/env');
env.LOG_LEVEL = 'error';

const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const eslint = require('gulp-eslint');
const gmocha = require('gulp-mocha');
const gulpif = require('gulp-if');
const istanbul = require('gulp-istanbul');
const execa = require('execa');
const yaml = require('js-yaml');
const semver = require('semver');
const argv = require('yargs').argv;
const sequence = require('run-sequence');

const coverageThreshold = 0;
const coverageReporters = ['cobertura', 'html', 'json', 'text', 'text-summary'];

const testReporter = env.TEST_REPORTER ? env.TEST_REPORTER : 'spec';
const gmochaOptions = { timeout: 5000, reporter: testReporter };

const gulpWatchOptions = { interval: 600 };

function getRootPath() {
  return execa.shellSync('git rev-parse --show-cdup').stdout;
}

function getPackageJsonPath() {
  return `${process.cwd()}/${getRootPath()}package.json`;
}

function getSwaggerYamlPath() {
  return `${process.cwd()}/${getRootPath()}api/swagger/swagger.yaml`;
}

function getCoverSource() {
    // Ignore config - else the .env is re-required and the task will fall back to .env's LOG_LEVEL
  return gulp.src([
    '**/*.js',
    '!node_modules/**/*',
    '!test/**/*',
    '!config/**/*',
    '!coverage/**/*',
    '!migrations/**/*',
    '!gulpfile.js',
  ]);
}

function getWatchGlobs() {
  return [
    '**/*',
    '!node_modules/**/*',
    '!coverage/**/*',
  ];
}

function getLintSource() {
  return gulp.src(['**/*.js', '!node_modules/**/*', '!coverage/**/*']);
}

function getTestSource() {
  return gulp.src(['test/setup-chai.js', 'test/**/*.js']);
}

function getUnitTestSource() {
  return gulp.src(['test/setup-chai.js', 'test/unit/**/*.js']);
}

function getIntegrationTestSource() {
  return gulp.src(['test/setup-chai.js', 'test/integration/**/*.js']);
}

function isFixed(file) {
	// Has ESLint fixed the file contents?
  return file.eslint && file.eslint.fixed;
}

gulp.task('default', ['help']);

gulp.task('test', 'Runs all tests', () =>
    getTestSource()
        .pipe(gmocha(gmochaOptions))
);

gulp.task('test-cover', 'Run/Cover all tests', ['pre-cover'], () =>
    getTestSource()
        .pipe(gmocha(gmochaOptions))
        .on('error', err => {
          console.log(err);
          process.exit(1);
        })
        .pipe(istanbul.writeReports({ reporters: coverageReporters }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: coverageThreshold } }))
);

gulp.task('test-watch', 'Watch for files changes, then run all tests', () =>
    gulp.watch(getWatchGlobs(), gulpWatchOptions, ['test'])
);

gulp.task('test-unit', 'Runs unit tests', () =>
    getUnitTestSource()
        .pipe(gmocha(gmochaOptions))
);

gulp.task('test-unit-cover', 'Run/Cover unit tests', ['pre-cover'], () =>
    getUnitTestSource()
        .pipe(gmocha(gmochaOptions))
        .on('error', err => {
          console.log(err);
          process.exit(1);
        })
        .pipe(istanbul.writeReports({ reporters: coverageReporters }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: coverageThreshold } }))
);

gulp.task('test-unit-watch', 'Watch for files changes, then run unit tests', () =>
    gulp.watch(getWatchGlobs(), gulpWatchOptions, ['test-unit'])
);

gulp.task('test-integration', 'Runs integration tests', () =>
    getIntegrationTestSource()
        .pipe(gmocha(gmochaOptions))
);

gulp.task('test-integration-cover', 'Run/Cover integration tests', ['pre-cover'], () =>
    getIntegrationTestSource()
        .pipe(gmocha(gmochaOptions))
        .on('error', err => {
          console.log(err);
          process.exit(1);
        })
        .pipe(istanbul.writeReports({ reporters: coverageReporters }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: coverageThreshold } }))
);

gulp.task('test-integration-watch', 'Watch for files changes, then run all integration tests', () =>
    gulp.watch(getWatchGlobs(), gulpWatchOptions, ['test-integration'])
);

gulp.task('pre-cover', 'Informs istanbul of source files to cover', () =>
    getCoverSource()
        .pipe(istanbul({ includeUntested: true }))
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
);

gulp.task('lint', 'Lints all JS files with eslint', () => {
  const fix = !!argv.fix;
  getLintSource()
    .pipe(eslint({ fix }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulpif(isFixed, gulp.dest('.')));
});

gulp.task('lint-watch', 'Watch for files changes, then run lint', () =>
    gulp.watch(getWatchGlobs(), gulpWatchOptions, ['lint'])
);

gulp.task('pre-commit',
    'Will be called by the git pre-commit hook to lint and run/cover unit tests',
    ['lint', 'test-unit-cover']
);

function getGulpSequelize() {
  const models = require('./models');
  return models.waitForInit().then( () =>
        require('gulp-sequelize')(models.sequelize)
    );
}

gulp.task('db-up', 'Runs all new database migrations', () =>
    getGulpSequelize().call('up')
);

gulp.task('db-down', 'Reverts the most recent migration', () =>
    getGulpSequelize().call('down')
);

gulp.task('db-pending', "Lists all migrations that haven't been run yet", () =>
    getGulpSequelize().call('pending')
);

gulp.task('db-executed', 'Lists all migrations that have been executed', () =>
    getGulpSequelize().call('executed')
);

gulp.task('bump-version', 'Increase the version number of the project', (cb) => {
  const packageJson = require(getPackageJsonPath());
  const swaggerObj = yaml.safeLoad(fs.readFileSync(getSwaggerYamlPath(), { encoding: 'utf-8' }));
  const oldVersion = packageJson.version;

    // --major
  if (argv.major) {
    packageJson.version = semver.inc(oldVersion, 'major');
  }

    // --minor
  if (argv.minor) {
    packageJson.version = semver.inc(oldVersion, 'minor');
  }

    // --patch or no argument given
  if (argv.patch || packageJson.version === oldVersion) {
    packageJson.version = semver.inc(oldVersion, 'patch');
  }

  swaggerObj.info.version = packageJson.version;

  console.log(`Bumping package version: ${oldVersion} -> ${packageJson.version}`);
  fs.writeFileSync(getPackageJsonPath(), `${JSON.stringify(packageJson, null, 2)}\n`);
  fs.writeFileSync(getSwaggerYamlPath(), `${yaml.safeDump(swaggerObj, { lineWidth: 120 })}`);
  sequence('sync-deps', cb);
});

gulp.task('sync-version', 'Sync the version number to what is in package.json', (cb) => {
  const packageJson = require(getPackageJsonPath());
  const swaggerObj = yaml.safeLoad(fs.readFileSync(getSwaggerYamlPath(), { encoding: 'utf-8' }));

  swaggerObj.info.version = packageJson.version;

  console.log(`Syncing package version to ${packageJson.version}`);
  fs.writeFileSync(getSwaggerYamlPath(), `${yaml.safeDump(swaggerObj, { lineWidth: 120 })}`);
  sequence('sync-deps', cb);
});
