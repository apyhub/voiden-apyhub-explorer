import { build, context } from "esbuild";
import { copyFileSync, mkdirSync } from "fs";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["src/index.tsx"],
  outfile: "dist/main.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime", "@voiden/sdk", "@voiden/sdk/ui"],
  logLevel: "info",
};

// Copy manifest.json to dist/
mkdirSync("dist", { recursive: true });
copyFileSync("src/manifest.json", "dist/manifest.json");

if (isWatch) {
  const ctx = await context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await build(buildOptions);
}
