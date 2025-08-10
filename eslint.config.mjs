import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  {
    rules: {
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error", 
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "warn"
    }
  }
];

export default eslintConfig;
