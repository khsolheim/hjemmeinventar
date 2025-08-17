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
      // Accessibility rules
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error", 
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-autofocus": "warn",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-empty-object-type": "error",
      
      // React rules
      "react-hooks/exhaustive-deps": "error",
      "react/no-unescaped-entities": "error",
      
      // General code quality
      "prefer-const": "error",
      "no-console": "warn",
      "no-debugger": "error"
    }
  }
];

export default eslintConfig;
