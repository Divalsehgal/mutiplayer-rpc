module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-magic-numbers': ['error', {
      ignore: [-20, -10, -5, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 24, 30, 36, 50, 60, 100, 120, 160, 200, 201, 204, 300, 400, 401, 403, 404, 409, 429, 500, 1000, 3000, 3030, 3600, 5000, 10000, 3600000, 86400000, 0.03, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4],
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
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/test.ts', '**/test.tsx'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}

