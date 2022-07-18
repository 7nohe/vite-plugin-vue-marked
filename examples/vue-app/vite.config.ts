import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueMarked from "@7nohe/vite-plugin-vue-marked";
import hljs from "highlight.js";
import mermaidAPI from "mermaid/mermaidAPI";

const renderer = {
  heading(text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, "-");

    return `
            <h${level}>
              <a name="${escapedText}" class="anchor" href="#${escapedText}">
                <span class="header-link"></span>
              </a>
              ${text}
            </h${level}>`;
  },
};

export default defineConfig({
  plugins: [
    vue(),
    vueMarked({
      options: {
        highlight: function (code, lang) {
          const language = hljs.getLanguage(lang) ? lang : "plaintext";
          return hljs.highlight(code, { language }).value;
        },
        mermaid: {
          theme: 'forest' as mermaidAPI.Config["theme"],
        }
      },
      extensions: [{ renderer }],
    }),
  ],
});
