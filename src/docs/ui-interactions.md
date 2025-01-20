---
next:
    text: Asset Management
    link: /docs/assets
prev:
    text: APIs
    link: /docs/apis
---

<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 -->

# UI Interactions

## Virtualization

Virtualization makes use of the Intersection Observer API. It's primary use is to alleviate the memory and CPU usage of rendering an extraordinary amount of repetitive content, such as a social network "feed," by recycling rendered components or elements instead of forever increasing the number of elements in the DOM.

The Intersection Observer API is utilized to create a top and bottom observer to register when a user has scroll far enough to initiate the recycling process.

### Process

- [ ] Top observer
- [ ] Bottom observer
- [ ] Viewport
- [ ] State
    - [ ] Element pool
    - [ ] Page
- [ ] DocumentFragment/template/component

### Examples

1. [Full virtualization](./full-virtualization)
2. [Partial virtualization](./partial-virtualization)
3. [Virtualization of elements with dynamic heights](./dynamic-height-virtualization)
