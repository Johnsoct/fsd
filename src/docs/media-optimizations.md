<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 MD041 -->
### Summary

1. Formats should be intentional
2. Use compression

| Asset intention | Worst case | Middle case | Optimized |
| --------------- | --------------- | --------------- | --------------- |
| Animated content | GIF | MP4 | N/A |  
| Icon and logos | JPEG/PNG | SVG | Compressed SVG |
| Raster graphic | N/A | PNG | WEBP |
| Photos | JPEG | WEBP | AVIF |

### Webp

webp was designed to replace png, jpg, and gif for usage on web pages.

Current supported by every desktop and mobile browser except IE.

### AVIF

AVIF is a new image encoding format with the same benefits as webp with even better compression and picture quality.

Currently supported by every desktop and mobile browser except IE, Opera Mini, and QQ Browser; however, it's a new baseline feature as of 2024, so it requires up-to-date browsers.

> [!TIP]
> I would encourage utilizing this format but using srcsets or fallbacks utilizing webp

### SVG path compression

This results in a file size compression from 0.7kb to 0.2kb!

```html
<!-- Typical SVG Structure (human readable) -->
<svg width="600" height="120" fill="none">
    <rect x="10" y="10" width="100"
        height="100" stroke-width="3"
        stroke="#ff6666">
    </rect>
    <rect x="130" y="10"
        width="100" height="100"
        stroke-width="3" stroke="#ff6666">
    </rect>
    <ellipse cx="300" cy="60"
        rx="50" ry="50"
        stroke-width="3" stroke="#66b2ff">
    </ellipse>
    <rect x="370" y="10"
        width="100" height="100"
        stroke-width="3" stroke="#ff6666">
    </rect>
    <rect x="490" y="10"
        width="100" height="100"
        stroke-width="3" stroke="#ff6666">
    </rect>
</svg>

<!-- Compressed SVG -->
<svg width="600" height="120" fill="none" stroke-width="3">
    <path d="M10 10h100v100H10zm120 0h100v100H130z" stroke="#f66"></path>
    <circle cx="300" cy="60" r="50" stroke="#66b2ff"></circle>
    <path d="M370 10h100v100H370zm120 0h100v100H490z" stroke="#f66"></path>
</svg>
```
