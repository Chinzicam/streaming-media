module.exports = {
  root: true,
  env: {
    node: true,
    "vue/setup-compiler-macros": true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-redeclare": "off",
    "no-self-assign": "off",
    "no-irregular-whitespace": 0,
    "@typescript-eslint/no-var-requires": 0,
    "vue/no-deprecated-slot-attribute": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "vue/no-unused-vars": 0,
    "no-empty": 0,
    "vue/multi-word-component-names": 0,
    "@typescript-eslint/no-this-alias": 0,
    "vue/no-useless-template-attributes": 0,
    "vue/valid-define-emits": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "vue/no-async-in-computed-properties": 0,
    "vue/no-setup-props-destructure": 0
  }
}
