module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:prettier/recommended',
    'plugin:nuxt/recommended'
  ],
  plugins: [],
  // add your custom rules here
  rules: {
    'prettier/prettier': 'warn',
    radix: 'off',
    'comma-dangle': 'off',
    'linebreak-style': 'off',
    'arrow-parens': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    'implicit-arrow-linebreak': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
