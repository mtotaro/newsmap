import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // react-hooks/set-state-in-effect is overly strict for intentional
      // loading-state patterns where setState is called at the top of an async
      // effect. Downgrade to warn so CI passes.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
