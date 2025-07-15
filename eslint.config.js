import js from '@eslint/js';

export default [
  {
    languageOptions: {
      sourceType: 'script', // permite require
      ecmaVersion: 'latest',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        document: 'readonly'
      }
    },
    plugins: {},
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
];
