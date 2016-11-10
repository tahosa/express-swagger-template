module.exports = {
    'env': {
        'es6': true,
        'node': true
    },
    'extends': '.eslint-airbnb/base.js',
    'parserOptions': {
        'sourceType': 'module'
    },
    'plugins': [
        'mocha',
    ],
    'rules': {
        'mocha/no-exclusive-tests': 2,
        'mocha/no-skipped-tests': 2,

        'array-bracket-spacing': 0,
        'brace-style': [ 2, 'stroustrup' ],
        'consistent-return': 0,
        'default-case': 0,
        'func-names': 0,
        'indent': [ 'error', 2, {
            'SwitchCase': 1,
        }],
        'max-len': [ 2, 120 ],
        'no-console': 2,
        'no-process-env': 2,
        'no-trailing-spaces': [ 2, {
            'skipBlankLines': true,
        }],
        'no-unexpected-multiline': 2,
        'no-unused-vars': [ 2, {
            'args': 'none'
        }],
        'no-use-before-define': [ 2, 'nofunc' ],
        'padded-blocks': 0,
        'prefer-arrow-callback': 0,
        'quotes': [ 2, 'single', 'avoid-escape' ],
        'semi': 0,
        'space-before-function-paren': [ 2, 'never' ],
        'space-in-parens': 0,
        'new-cap': [2, {'capIsNewExceptions': ['STRING']}],
    }
};
