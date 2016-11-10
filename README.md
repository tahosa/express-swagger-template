express-swagger-template
========================

This is a boilerplate project for use in creating RESTful web applications based
on NodeJS using the Express web server and Swagger (OpenAPI) API definitions.

*** DELETE OR MODIFY THIS README WHEN YOU CLONE THIS REPO FOR USE IN AN APP ***

Setup
-----

`npm` is used for all dependency management, and gulp is used for development
automation.

```shell
npm install
```

Once all dependencies are installed, you will need to configure the
following for your project:

### Environment
1. Set default database configs in `.env.example`
2. Copy `.env.example` to `.env` and set your local development variables

### Sequelize - Database
1. Change the debug statement in `models/index.js` to use your app's name
2. Create your sequelize models as `.js` files in the `models/` folder
3. Create your sequelize migrations in the `migrations/` folder

Running the App
---------------

Once all the necessary configuration has been done, the app can be run by
executing `node index.js`. `nodemon` can also be used to restart the server
whenever you make a change in your development environment. Every time you make
changes to your database definition, be sure to run `gulp db-up` to run the
migrations.

```shell
gulp db-up          # Run database migrations
nodemon index.js    # Run the server with nodemon to restart on changes
```

Development
-----------

While developing your app, feel free to create a git pre-commit hook that runs
`gulp pre-commit`. This will run the style checker (eslint) and all tests. They
will all have to pass in order to be able to commit your code.

```shell
echo "gulp pre-commit" >> .git/hooks/pre-commit
chmod 755 .git/hooks/pre-commit
```

Sequelize - Database
--------------------

This project is intended to use [Sequelize](http://docs.sequelizejs.com/) for
interacting with databases using its Object-Relational Model (ORM). Models
generally correspond to tables in the database, and migrations are used to
create tables, or make changes to your database.

There are several gulp tasks which assit in working with your databases:

* `gulp db-up`: Run migrations against the database configured by your env
* `gulp db-down`: Undo the last migration that was run
* `gulp db-executed`: List the migrations that have been run
* `gulp db-pending`: List all migrations that haven't been run yet

Testing
-------

Tests should be added for your app in the `test/` folder where gulp will search
for tests when you run any of the `gulp test` tasks. To see all gulp tasks, run
`gulp help`. Several of the tasks have a `-watch` suffix, which indicates that
gulp will watch your work area for changes, and will re-run tests when changes
are detected.

Utilities
---------

There are also gulp tasks intended for use in maintaining your app. Mostly, they
are for working with your package versioning to make sure the version number
stays in sync across the various files that use it.

* `gulp bump-version [ --major | --minor | --patch ]`: Increase the package
  version in accordance with [semver](http://semver.org/)
  * By default, it increases the patch number
  * The additional arguments can be used to bump the other pieces of the
    version.
* `gulp sync-version`: Synchronize the version number from `package.json` to the
  other files which use it, namely `api/swagger/swagger.yaml`
