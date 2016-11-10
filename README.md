express-swagger-rest
====================

This is a boilerplate project for use in creating RESTful web applications based
on NodeJS using the Express web server and Swagger (OpenAPI) API definitions.

Setup
-----

NPM is used for all dependency management, and gulp is used for development
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
