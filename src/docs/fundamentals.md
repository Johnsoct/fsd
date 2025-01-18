---
next:
    text:  State
    link: /docs/state
prev:
    text: Introduction to FSD
    link: /docs/intro
---

<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD028 MD033 -->

<script setup>
import DocHeading from "../../components/doc-heading.vue"
</script>

# Important fundamentals

<DocHeading />

In this module, we'll cover:

- How browser rendering really works
- DOM API(s) for performant manipulation
- Web APIs for complex UI Patterns
	- Observer API
        - Intersection
        - Mutation
        - Resize
- Virtualization

<hr>

::: details How browser rendering really works {open}
<!--@include: ./browser-rendering.md-->
:::

::: details DOM APIs for performant manipulations
<!--@include: ./dom-apis.md-->
:::

::: details Web APIs for complex UI patterns
<!--@include: ./web-apis.md-->
:::

:::details Virtualization
<!--@include: ./virtualization.md-->
:::
