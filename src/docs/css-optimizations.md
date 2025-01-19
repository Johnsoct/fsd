<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 MD041 -->
There are six optimizations we can utilize:

1. Split the bundle when necessary
2. Minify and compress
3. Inline critical styles
4. Preload/prefetch non-critical styles in the background
5. Utilizing stacking contexts to minimize DOM

### Code splitting

Same as with JavaScript modules. This is largely handled by JavaScript build tools, such as Webpack or Vite, but we should stil write our CSS within small modules.

### Minification and compression

| Uncompressed | Minified | Gzip | Brotli |
| ------------- |--|--|--|
| 2413.4kb | 1967.4kb | 190.2kb | 46.2kb |

### Critical style extraction

There are two types of styles within an app:

- **Critical**: the app cannot render or used properly without
- **Non-critical**: popups, advanced graphic features, inactive pages, etc. prettttty buttons

Typically, this takes the form of:

```html
<!-- Non-optimized -->
<html>
    <head>
        <link rel="stylesheet" href="./desktop.css" />
    </head>
    <!-- ... -->
</html>

<!-- Optimized -->
<html>
    <head>
        <style>
            #root {
                /* Critical Styles */
            }
        </style>

        <!-- Two options for fetching non-critical styles -->
        <!-- media="print" only fires the request once the whole page has been rendered -->
        <link rel="stylesheet" href="./non-critical.css" media="print" onload="this.media='all'" />
        <link rel="preload" as="style" href="./non-critical.css" />
    </head>
    <!-- ... -->
</html>
```

### Preloading/fetching non-critical styles

[TBD]

### Stacking contexts

[TBD]
