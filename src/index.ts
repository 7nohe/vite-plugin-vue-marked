import type { Plugin } from 'vite'
import { parse } from '@vue/compiler-sfc'
import { marked } from 'marked'
import { parse as _parse } from '@babel/parser'

const ID = 'vmarked'

interface PluginOptions {
  options?: marked.MarkedOptions
  extensions?: marked.MarkedExtension[]
}

const initMarked = ({ options, extensions }: PluginOptions) => {
  if (options)
    marked.setOptions(options)

  if (extensions)
    marked.use(...extensions)
}

const replaceCode = (
  {
    start,
    end,
    variableName,
  }: { start: number; end: number; variableName: string },
  code: string,
  markdwon: string,
): string => {
  const html = marked(markdwon)
  const comp = `
  import {h, defineComponent} from "vue";
  let _comp = defineComponent({
    name: "Markdown",
  });
  
  const _render = () => {
    return h("div", {
      class: "${ID}",
      innerHTML: ${JSON.stringify(html)},
    })
  };
  
  _comp.render = _render;
  const ${variableName} = _comp;
  `
  return `${code.slice(0, start)} \n ${comp} \n ${code.slice(end)}`
}

function vitePluginVueMarked(
  options: PluginOptions = { options: {}, extensions: [] },
): Plugin {
  return {
    name: 'vite-plugin-vue-marked',
    enforce: 'pre',
    resolveId(id) {
      if (id === ID)
        return ID
    },
    async transform(code: string, id: string) {
      const fileRegex = /\.(vue)$/

      // Check if file is a vue file
      if (fileRegex.test(id)) {
        const { descriptor } = parse(code)
        if (
          descriptor.scriptSetup
          && descriptor.customBlocks.find(b => b.type === 'markdown')
        ) {
          initMarked(options)
          const markdwon = descriptor.customBlocks.find(
            b => b.type === 'markdown',
          )!.content
          const { content } = descriptor.scriptSetup
          const nodes = _parse(content, {
            sourceType: 'module',
            plugins: ['typescript'],
          }).program.body

          // Find the script node
          nodes.forEach((node) => {
            if (node.type === 'ImportDeclaration' && node.source.value === ID) {
              const defaultSpecifier = node.specifiers.find(
                specifier => specifier.type === 'ImportDefaultSpecifier',
              )

              const replacement = replaceCode(
                {
                  start: node.start!,
                  end: node.end!,
                  variableName: defaultSpecifier?.local?.name ?? '',
                },
                content,
                markdwon,
              )
              code = code.replace(content, replacement)
            }
          })

          // Remove custom block
          const start = code.indexOf('<markdown>')
          const end = code.indexOf('</markdown>')
          const customBlockContent = code.slice(
            start,
            end + '</markdwon>'.length,
          )
          code = code.replace(customBlockContent, '')
        }
      }

      return {
        code,
        map: null,
      }
    },
  }
}

export default vitePluginVueMarked
