<script setup lang="ts">
import VMarked from 'vmarked';

</script>

<template>
  <VMarked />
</template>

<style>
h1 {
  color: red;
}

h2 {
  color: blue;
}

h3 {
  color: green;
}
</style>

<markdown>
# Heading 1
## Heading 2
### Heading 3

```js
const msg = "This is a code block.";
console.log(msg);
```
</markdown>
