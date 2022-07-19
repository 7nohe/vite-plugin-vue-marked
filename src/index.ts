import type { Plugin } from "vite";
import { parse } from "@vue/compiler-sfc";
import { marked } from "marked";
import { parse as _parse } from "@babel/parser";
import mermaidAPI from "mermaid/mermaidAPI";

const ID = "vmarked";

interface PluginOptions {
  options?: marked.MarkedOptions;
  extensions?: marked.MarkedExtension[];
  mermaid?: mermaidAPI.Config;
}

const initMarked = ({ options, extensions }: PluginOptions) => {
    const highlight = (code: string, lang: string, callback?: ((error: any, code?: string | undefined) => void) | undefined) => {
      if (lang === "mermaid") {
        return `<div class="mermaid" >${code}</div>`;
      }
      return  options ? options.highlight?.(code, lang, callback) : code;
    };

  options ? marked.setOptions({ ...options, highlight }) : marked.setOptions({ highlight });

  if (extensions) marked.use(...extensions);
};

const replaceCode = (
  {
    start,
    end,
    variableName,
    mermaidOptions
  }: {
    start: number;
    end: number;
    variableName: string;
    mermaidOptions?: mermaidAPI.Config;
  },
  code: string,
  markdown: string
): string => {
  const html = marked(markdown);
  const options = {
    startOnLoad: false,
    theme: 'base',
    ...mermaidOptions,
  }
  const comp = `
  import mermaid from "mermaid";
  import {h, defineComponent, watchEffect} from "vue";
  let _comp = defineComponent({
    name: "Markdown",
    setup() {
      mermaid.initialize(${JSON.stringify(options)})
      return () => h("div", {
        class: "${ID}",
        innerHTML: ${JSON.stringify(html)},
      })
    },
    mounted() {
      mermaid.init();
    }
  });
  
  const ${variableName} = _comp;
  `;
  return `${code.slice(0, start)} \n ${comp} \n ${code.slice(end)}`;
};

function vitePluginVueMarked(
  options: PluginOptions = { options: {}, extensions: [] }
): Plugin {
  return {
    name: "vite-plugin-vue-marked",
    enforce: "pre",
    resolveId(id) {
      if (id === ID) return ID;
    },
    async transform(code: string, id: string) {
      const fileRegex = /\.(vue)$/;

      // Check if file is a vue file
      if (fileRegex.test(id)) {
        const { descriptor } = parse(code);
        if (
          descriptor.scriptSetup &&
          descriptor.customBlocks.find((b) => b.type === "markdown")
        ) {
          initMarked(options);
          let markdown = descriptor.customBlocks.find(
            (b) => b.type === "markdown"
          )!.content;
          const { content } = descriptor.scriptSetup;
          const nodes = _parse(content, {
            sourceType: "module",
            plugins: ["typescript"],
          }).program.body;

          // Find the script node
          nodes.forEach((node) => {
            if (node.type === "ImportDeclaration" && node.source.value === ID) {
              const defaultSpecifier = node.specifiers.find(
                (specifier) => specifier.type === "ImportDefaultSpecifier"
              );

              const replacement = replaceCode(
                {
                  start: node.start!,
                  end: node.end!,
                  variableName: defaultSpecifier?.local?.name ?? "",
                  mermaidOptions: options.mermaid,
                },
                content,
                markdown
              );
              code = code.replace(content, replacement);
            }
          });

          // Remove custom block
          const start = code.indexOf("<markdown>");
          const end = code.indexOf("</markdown>");
          const customBlockContent = code.slice(
            start,
            end + "</markdown>".length
          );
          code = code.replace(customBlockContent, "");
        }
      }

      return {
        code,
        map: null,
      };
    },
  };
}

export default vitePluginVueMarked;
