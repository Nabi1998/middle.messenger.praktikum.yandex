module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  plugins: [
    '@stylistic/stylelint-plugin',
    'stylelint-order'
  ],
  overrides: [
    {
      files: ['**/*.pcss', '**/*.css'],
      customSyntax: 'postcss-scss'
    }
  ],
  rules: {
    'stylistic/indentation': 2,
    'stylistic/string-quotes': 'single',
    'stylistic/color-hex-case': 'lower',
    'order/properties-alphabetical-order': true,
    'stylistic/max-empty-lines': 2
  },
  ignoreFiles: [
    'node_modules/**',
    'dist/**'
  ]
};
