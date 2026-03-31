import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      'packages/dashboard/next.config.mjs',
      'packages/dashboard/postcss.config.js',
      'packages/dashboard/tailwind.config.ts',
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier compat (disables formatting rules)
  eslintConfigPrettier,

  // Project-specific overrides
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // Test files can be more relaxed
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
