module.exports = {
  extends: ['stylelint-config-standard'],
  plugins: ['@stylistic/stylelint-plugin', 'stylelint-order'],
  overrides: [
    {
      files: ['**/*.pcss', '**/*.css'],
      customSyntax: 'postcss-scss'
    }
  ],
  rules: {
    '@stylistic/indentation': 2,
    '@stylistic/string-quotes': 'single',
    '@stylistic/color-hex-case': 'lower',
    '@stylistic/max-empty-lines': 2,
    'order/properties-alphabetical-order': true
  },
  ignoreFiles: ['node_modules/**', 'dist/**']
};
