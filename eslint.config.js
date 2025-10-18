import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      "prettier/prettier": "off"
    }
  }
];
