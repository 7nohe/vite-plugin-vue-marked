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


```mermaid
classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
        +String beakColor
        +swim()
        +quack()
    }
    class Fish{
        -int sizeInFeet
        -canEat()
    }
    class Zebra{
        +bool is_wild
        +run()
    }
```

</markdown>
