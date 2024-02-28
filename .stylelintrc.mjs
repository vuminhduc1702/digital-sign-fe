// These are all the custom `@` (at) rules that we use within our custom PostCSS plugins
const CUSTOM_AT_RULES = [
  // Tailwind-specific at-rules
  'apply',
  'layer',
  'responsive',
  'screen',
  'tailwind',
  'variants',
]

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    // Allow Tailwind-based CSS Rules
    'at-rule-no-unknown': [true, { ignoreAtRules: CUSTOM_AT_RULES }],
    // Allow the Global CSS Selector
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    // Enforces the order of the CSS properties to be in alphabetical order
    'order/properties-alphabetical-order': true,
    'no-descending-specificity': null,
    // Disables the Level-4 Media Queries; Since they're more exotic and less known
    'media-feature-range-notation': 'prefix',
    // Adopts the import notation from `postcss-import`
    'import-notation': 'string',
  },
}
