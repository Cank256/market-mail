module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'no-console': 'warn',
        'prefer-const': 'error',
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
    },
};