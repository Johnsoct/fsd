<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD028 MD033 -->
## Global browser objects

The global browser objects we're covering in this document are all classes extending the `window` object.

- window: `window`
- document: `window.document` || `document`
- body: `window.document.body` || `document.body`
- head: `window.document.head` || `document.head`

### Hierarchy

#### HTMLElement

When manipulating the dom, we will typically be dealing with objects of the type "HTMLElement." "HTMLElement" is then extended to represent the individual HTML elements, such as "HTMLLIElement" or "HTMLButtonElement."

`HTMLElement` extends:

#### Element

`Element` contains the DOM API on it's `.prototype`, along with `HTMLDocument`. However, since `HTMLElement` extends `Element`, it has access to the DOM API. 

`Element` extends:

#### Node

`Node` provides tree-like properties (DOM tree). `TextNode` represents all displayed text nodes in the layout, and it is an extension of `Node`. However, unlike `HTMLElement` and `Element`, `Node` is, kinda, at the top of the hierarchy (it is not extending anything, everything else extends it). `Node` is used to extend `HTMLDocument`:

#### HTMLDocument

`HTMLDocument` exists from `Window`, which is provided by the browser, and it extends `Node`. `HTMLDocument` also has access to the DOM API on it's `.prototype`.

## DOM Element Queries

When the browser parses the page, it constructs a Hashmap of the elements. The DOM API uses this Hashmap to query elements, but some methods are more efficient than others (time complexity).

-	`getElementById`
-	`getElementByClassName`
-	`getElementsByTagName`
-	`querySelector`
-	`querySelectorAll`

#### `getElementById`

Because the browser stores all the elements in a Hashmap, querying by ID is a O(1) time complexity search (instanenous-ish) because it is querying by a key.

Although it's an anti-pattern to overuse IDs because of polution of global scope (ID must be unique throughout the entire document), querying elements by ID is the most performant method.

#### `getElementsByClassName`

Unlike `getElementById`, to get elements by their classname, the browser needs to traverse the entire DOM tree (using DFS + Hashmap -> scans all the elements and collects the ones with the correct class text).

The time complexity is linear, because the browser needs to read the entire DOM tree in the worst case, or O(N); however, browsers utilize Hashmaps and caching, which although is slower on the first query, it is much faster for every subsequent queries (as long as the DOM tree hasn't changed).

This is still a good query when you need to query for multiple elements and you're concerned about memory (`HTMLCollection` is made up of references not copies), but you need to utilize this efficiently because the read cost is high (i.e. if you're looping through, you're converting the read cost time complexity to quadratic time).

> [!IMPORTANT]
> Unlike other query selectors, `getElementsByClassName` returns a `HTMLCollection` which is a live collection of HTML element references (not clones) in the DOM. So, when you update the DOM, your HTMLCollection will also update, but the read cost of that is also O(N) because the browser needs to parse the tree again to verify the collection elements' positions.

#### `getElementsByTagName`

Identical to `getElementsByClassName` except it queries with HTML tag names instead of class names.

#### `querySelector`

Like `getElementById`, `querySelector` returns an `Element`. The time complexity is either O(1) or O(N) depending on the type of query we use (ID, tag, class name, complex queries).

In 99% of cases, this is your go to selector and it is the second most performant option behind `getElementById`, and thanks to caching and browser optimizations, it is comparable on repetitive runs. Read access is cheap.

> [!IMPORTANT]
> The downside of not returning a HTMLCollection (live collection) is you can store the result of `querySelector` which becomes stale after it is removed or updated in the DOM.

#### `querySelectorAll`

Unlike the rest of the query methods, `querySelectorAll` returns a `NodeList`. It is not a collection, but copies of the matching HTML objects; therefore, it does cost additional memory.

It's time complexity is like `querySelector`; and it's read cost is O(1) because we're simply reading a key on an object vs traversing the DOM tree again. Read access is cheap.

> [!IMPORTANT]
> The downside of not returning a HTMLCollection (live collection) is you can store the result of `querySelector` which becomes stale after it is removed or updated in the DOM.

### Adding/removing elements from the DOM

Unfortunately, all DOM API methods for adding elements has pretty high performance impacts because they all trigger reflows, but some are better than others.

-	`innerHTML`: extremely high
-	`insertAdjacentHTML`: extremely high
-	`insertAdjacentElement`: high
-	`appendChild`: high

Removing elements can be done with two methods of the same cost:

-	`el.remove()`
-	`el.innerHTML = ""`

### Use of `DocumentFragment`

When using vanilla JS/TS to create HTML elements, using a DocumentFragment (`<template>`) is a lightweight, in-memory HTMLElement method for:

-	Modifying a custom component/JS-created HTML element's content without causing a reflow
	-	DocumentFragments do not have a position in the page layout, but we can query a `<template>` by its `id` and use that to construct a custom element to the layout.
	-	Obviously, once it is appended to the page layout and has its own render object, then updating that element would cause reflow...
-	Reuse
-	Isolation from the main DOM tree
-	Utilizing HTML to create markup of components

#### Example of using `DocumentFragment` to append multiple objects to the DOM

```js
// Utilizing the DocumentFragment to append multiple children trigging one reflow
// vs appending each child one at a time, triggering many reflows
const fragment = new DocumentFragment()
const target = document.getElementById("target")

for (const datum of data) {
    const card = createNewCardElement(datum)

    fragment.appendChild(card)
}

target.appendChild(fragment)
```
