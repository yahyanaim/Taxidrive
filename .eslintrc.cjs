/* eslint-env node */

module.exports = {
  root: true,
  ignorePatterns: ["**/dist/**", "**/build/**", "**/node_modules/**", "wingy-site/**"],
  env: {
    es2022: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier"
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ]
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: ["frontend/tsconfig.json", "backend/tsconfig.json"]
      }
    }
  },
  overrides: [
    {
      files: ["frontend/**/*.{ts,tsx}"],
      env: {
        browser: true,
        es2022: true
      },
      plugins: ["react", "react-hooks", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended"
      ],
      settings: {
        react: {
          version: "detect"
        }
      },
      rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off"
      }
    },
    {
      files: ["backend/**/*.ts"],
      env: {
        node: true,
        es2022: true,
        jest: true
      }
    },
    {
      files: ["**/*.cjs"],
      env: {
        node: true
      },
      parserOptions: {
        sourceType: "script"
      }
    }
  ]
};
