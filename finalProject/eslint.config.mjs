import { defineConfig } from "eslint/config";
import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  { files: ["/*.{js,mjs,cjs,ts}"] },
  {
    files: ["/*.{js,mjs,cjs,ts}"],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/consistent-type-imports": 1,
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "explicit", overrides: { constructors: "off" } },
      ],
      "@typescript-eslint/member-ordering": "error",
      "class-methods-use-this": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "max-lines-per-function": ["error", 40]
    },
  },
  {
    ignores: ["webpack.config.js", "dist"],
  },
  eslintConfigPrettier,
  eslint.configs.recommended,
  tseslint.configs.recommended,
]);