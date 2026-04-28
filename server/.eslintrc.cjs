module.exports = {
  root: true,
  env: { node: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-magic-numbers': ['error', {
      ignore: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 24, 36, 50, 60, 100, 120, 160, 200, 201, 204, 300, 400, 401, 403, 404, 409, 429, 500, 1000, 3030, 3600, 5000, 3600000, 86400000],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      enforceConst: true,
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/test.ts', '**/test.tsx'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};

