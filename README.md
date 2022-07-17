# vite-plugin-vue-marked

This plugin allows you to use `markdown` blocks in your Vue SFC with Vite
**⚠️ This plugin currently only works with the \<script setup> format**

## Install

Install the pacakge
```bash
npm install -D @7nohe/vite-plugin-vue-marked
```

Add to your `vite.config.ts`

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueMarked from "@7nohe/vite-plugin-vue-marked";

export default defineConfig({
  plugins: [vue(), vueMarked()],
});
```

## Usage
```vue
<!-- Example.vue -->
<script setup lang="ts">
import VMarked from 'vmarked';
</script>

<template>
  <VMarked />
</template>

<markdown>
# Heading 1
## Heading 2
### Heading 3
</markdown>
```

You can use [marked](https://marked.js.org/) options to customize the generated HTML code. 

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueMarked from "@7nohe/vite-plugin-vue-marked";
import hljs from "highlight.js";

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
      },
      extensions: [{ renderer }],
    }),
  ],
});
```

An example app is available in the `/examples/vue-app` directory.

## Options

| name         | type              | describe                                                                  |
| ------------ | ----------------- | ------------------------------------------------------------------------- |
| options      | MarkedOptions     | marked's [setOptions config](https://marked.js.org/using_advanced#options)|
| extensions   | MarkedExtension[] | marked's [marked.use(extension)](https://marked.js.org/using_pro#use)     |

## License

MIT
