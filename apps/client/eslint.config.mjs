/** @type {import("eslint").Linter.Config} */
import { defineConfig } from "eslint/config";
import { config } from "@repo/eslint-config/next";

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
