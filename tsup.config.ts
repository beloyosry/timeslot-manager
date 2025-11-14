import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/commands/init.ts"],
    format: ["cjs", "esm"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    shims: true,
    skipNodeModulesBundle: true,
    external: ["@prisma/client", "prisma"],
    treeshake: true,
    minify: false,
    target: "node16",
    outDir: "dist",
});
