module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sort-class-members', 'import', 'html'],
  env: {
    browser: true,
    node: true,
  },
  extends: '@foxy.io',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },
  rules: {
    'sort-class-members/sort-class-members': [
      'warn',
      {
        accessorPairPositioning: 'getThenSet',
        stopAfterFirstProblem: true,
        order: [
          '[static-properties]',
          '[static-methods]',
          '[properties]',
          '[conventional-private-properties]',
          'constructor',
          '[methods]',
          '[conventional-private-methods]',
        ],
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'import/named': 'off',
    'import/no-unresolved': 'off',
    'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
    'lines-between-class-members': 'warn',
  },
};
