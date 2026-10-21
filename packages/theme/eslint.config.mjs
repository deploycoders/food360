import { defineConfig } from "eslint/config";
import { config } from "@repo/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default defineConfig(
  config,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
