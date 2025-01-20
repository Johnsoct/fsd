---
next:
    text: APIs 
    link: /docs/apis
prev:
    text: Fundamentals
    link: /docs/fundamentals
---

<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD030 MD033 MD041 -->

# Application State

In this module, we'll cover:

- Minimizing the cost of reading state
- Minimizing the cost of searching state

## Summary

1. Know your scale - optimize accordingly
2. Always start with how you structure your data
3. Use normal forms to optimize access cost
4. Use indexes if in-app search is required
5. Offload data to hard-drive when it's needed (IndexDB, browser storage)
6. Pick a suitable storage

::: details Frontend application state
<!--@include: ./frontend-application-state.md-->
:::

::: details General guidelines for approaching state design
<!--@include: ./state-design-general-guidelines.md-->
:::
