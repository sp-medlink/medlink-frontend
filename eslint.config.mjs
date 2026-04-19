import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "react/no-danger": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/entities/session/model/session-store.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value='medlink.session']",
          message:
            "The 'medlink.session' storage key may only be referenced inside src/entities/session/model/session-store.ts. Use useSessionStore / getSessionToken instead.",
        },
      ],
    },
  },
];

export default config;
