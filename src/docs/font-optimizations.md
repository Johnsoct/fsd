<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 MD041 -->
There's not many options to optimize font loading besides:

1. Don't download fonts you don't need (weights === separate fonts, rarely a need for two different typefaces)
2. Allow the browser to display content while custom fonts are downloading

### Displaying content while fonts are downloading

- Browser waits for 3s to load

```css
@font-face {
    src="...";
    font-display: "auto";
}
```

- Render unstyled text immediately; switch if font is loaded within 3s

```css
@font-face {
    src="...";
    font-display: "fallback";
}
```

- Render unstyled text immediately; switch only on refresh if font is downloaded

```css
@font-face {
    src="...";
    font-display: "optional";
}
```
