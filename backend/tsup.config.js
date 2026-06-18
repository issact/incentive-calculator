import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts", "src/app.ts"],
    format: ["esm"],
    platform: "node",
    target: "es2023",
    outDir: "dist",
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true
})

