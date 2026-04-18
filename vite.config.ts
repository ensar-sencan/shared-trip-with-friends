import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import wasm from "vite-plugin-wasm"
import path from "path"

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		nodePolyfills({
			include: ["buffer"],
			globals: {
				Buffer: true,
			},
		}),
		wasm(),
	],
	resolve: {
		alias: {
			// guess_the_number contract paketi henüz deploy edilmedi — stub
			"guess_the_number": path.resolve("src/contracts/__stub__.ts"),
		},
	},
	build: {
		target: "esnext",
	},
	optimizeDeps: {
		exclude: ["@stellar/stellar-xdr-json"],
	},
	define: {
		global: "window",
	},
	envPrefix: "PUBLIC_",
	server: {
		proxy: {
			"/friendbot": {
				target: "http://localhost:8000/friendbot",
				changeOrigin: true,
			},
		},
	},
})
