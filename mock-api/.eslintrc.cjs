module.exports = {
    root: true,
    env: { node: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    ignorePatterns: ['.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
    },
    globals:{'require' : true},
    rules: {
        '@typescript-eslint/no-unsafe-member-access': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/consistent-type-definitions': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/prefer-nullish-coalescing': 0,
    },
}
