import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const pages = [
  "index",
  "carrito",
  "labial",
  "login",
  "pagos",
  "pedidos",
  "producto",
  "rubor",
  "sombra",
  "ar",
];

function redirectRootToHtmlIndex() {
  return {
    name: "redirect-root-to-html-index",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split("?")[0] !== "/") {
          next();
          return;
        }

        response.statusCode = 302;
        response.setHeader("Location", "/html/index.html");
        response.end();
      });
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source:
          '<!doctype html><meta http-equiv="refresh" content="0;url=/html/index.html">',
      });
    },
  };
}

export default defineConfig({
  plugins: [redirectRootToHtmlIndex()],
  build: {
    rollupOptions: {
      input: pages.map((page) => resolve(projectRoot, `html/${page}.html`)),
    },
  },
});
