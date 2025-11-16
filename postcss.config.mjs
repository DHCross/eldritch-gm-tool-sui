const plugins = process.env.VITEST ? [] : ["@tailwindcss/postcss"];

const config = {
  plugins,
};

export default config;
