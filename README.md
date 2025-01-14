<!-- markdownlint-disable MD007 MD010 MD013 MD033 -->

# Frontend system design

[Slides](https://static.frontendmasters.com/resources/2024-05-29-systems-design/frontend-system-design-fundamentals.pdf)

There are three parts to most application designs:

1.	Backend
2.	API
3.	Frontend

The frontend system is comprised of four major design considerations, which we'll call **CFDC** (core frontend design considerations):

1.	API communication
2.	UI data management (state management)
3.	User interface interactions
4.	Asset management

# Important fundamentals

Before getting into CFDC, we need to cover some important fundamentals at a lower level:

1.	Rendering in the browser
2.	DOM API(s)
3.	Web APIs for complex UI Patterns
	1.	Observer API (intersection, mutation, and resize observers)

After, we'll get into:

1.	Virtualisation
2.	Application state design
	1.	Search / access optimization
	2.	Browser storage APIs
	3.	Memory offloading
3.	Networks
	1.	Intro to browser networking
	2.	Protocols
	3.	Talking to servers via long-polling, web-sockets, and SSE
	4.	Overview of REST vs GraphQL
4.	Web application performance

Let's get started!

## Rendering in the browser

### Reflow

Reflow is a sub-process of the process how HTML, CSS, and JavaScript are combined and used to display some shit on the page.

#### Process

1. HTML is converted into a DOM tree; CSS is converted into a CSSOM tree
2. The DOM and CSSOM are combined into a render tree
3. Reflow
4. Repaint

#### Reflow

Default pipeline (unoptimized):

1. JavaScript (DOM manipulations)
2. Style (CSS changes)
3. Layout (recalculating the layout)
4. Paint (displaying/updating the new layout on the page)
5. Composite

Optimized pipeline:

1. Paint
2. Composite

We want to minimize the number of DOM manipuations (via JavaScript) that cause the first three steps in the reflow process, and by utilizing CSS and DOM manipulations that create new stacking contexts, we're able to optimize the reflow steps.

**Example of triggering the initial pipeline**

This example triggers all the steps.

This causes the entire page layout to recalculate because margin affects page layout, so every element's position needs to be recalculated.
```css
@keyframes moving-down-slow {
    from {
        margin-top: 0;
    }
    to {
        margin-top: 500px;
    }
}
```

**Example of optimizing the reflow process**

This example does not trigger the "style" or "layout" steps.

Since transform moves the element out of the normal flow and into a new stacking context, the normal flow is not required to be recalculated when the element being transformed is... transformed.
```css
@keyframes moving-down-fast {
    from {
        transform: translateY(0px);
    }
    to {
        transform: translateY(500px);
    }
}
```

### Box Model

4 Layers (innermost to outtermost):

1. content-box
2. padding-box
3. border-box
4. margin-box

The box model supports two main properties:

1. Size
2. Type

#### Size

Size can be one of two values:

**Intrinsic**: the box content determines the spaces it occupies
**Restricted**: the box's size is governed by a set of rules:
    - CSS (width and height)
    - Constraint from its parent context or other boxes:
        - flex or grid layout systems
        - % of parent size
        - aspect-ratio if an image
        - Other siblings

#### Type

Type can be one of three values:

**Block** level: including, but not restricted by `display: block`
**Inline** level: `display: inline`
**Anonymous** box

##### Box type: block

- Takes 100% of parent context's width
- Height is equivalent to its content (intrinsic)
- Rendered from top to bottom
- Governed by **Block Context Formatting** (BCF)

###### Calculating the width of a block element
Depending on the `box-sizing` property value, the width calculation is different. When `box-sizing: content-box`, each layer of the box model needs to be calculated to get the accurate width of the element; however, `box-sizing: border-box` wraps the border, padding, and content layer into one layer.

`box-sizing: content-box`: `width = margin-left + border-left + padding-left + content-width + padding-right + border-right + margin-right`

`box-sizing: border-box`: `width = margin-left + content-width + margin-right`

###### HTML tags that are block type boxes (not an exhaustive list):

`address, article, aside, blockquote, canvas, div, figcaption, figure, footer, form, h1-h6, header, hr, li, main, nav, noscript, ol, p, pre, section, table, ul, video`

##### Box type: anonymous 

The only example I know of are empty lines rendered in the DOM (carriage returns?)

##### Box type: inline

- Rendered like a string, from left to right and top to bottom
- Governed by **Inline Formatting Context** (IFC)
- Generate inline-level boxes

###### Calculating the width of an inline element

- Inline elements do not respond to `width` and `height` properties (literally, it does not affect their size)
- Inline elements do not react to vertical margins
- Inline elements' padding does not alter their height

`width = margin-left + border-left + padding-left + content-width + padding-right + border-right + margin-right`

###### HTML tags that are inline type boxes (not an exhaustive list):

`a, acronym, abbr, br, button, i, img, input, object, q, small, span, strong, time, b, code, em, label, select, textarea`

### Browser Formatting Context

Pleaes look at pages 18-27 in the slides linked [above](#frontend-system-design).

Key ideas:

- **Isolation**: elements within a context are shielded from the rules of external contexts
- **Scalability**: introducing a new ruleset for elements is as simple as creating new **Contexts** (flex-box, grid, etc.)
- **Predictability**: with a strict rule set, the placement of elements is predictable

Please look at pages 29-39 in the slides linked [above](#frontend-system-design).

### Stacking context

Without CSS, all page layouts would operate on the X and Y axis, meaning everything would be placed on a single layer. However, when we apply CSS 3D transformations, absolute positioning, or any action that moves an element from the normal flow, we active an additional axies known as the **stacking context** or the Z axis.

Stacking contexts are an incredible browser feature:

- **Layering**: we need a way to represent layers in our layouts
- **Performance optimization**:
    - Elements removed from the normal flow are placed into a new stacking context
    - Modifications to every element within a separate stacking context do not impact any other elements within the normal flow
    - All CSS transformations are GPU accelerated, meaning the browser doesn't need to recalculate the DOM tree when such operations are performed. This minimizes the reflow cycle, and number of reflows as we update the DOM

### Browser Positioning System

**Normal flow**: top to bottom; right to left || left to right

Certain CSS properties alter an elements positioning on the page in a way that changes the normal flow of the DOM.

#### Position

Position determines a variant of an element's positioning on the page, relative to the browser window or an anchor element.

`position: static | fixed | relative | absolute | sticky`

If positioning is used wisely, we can achieve:

- **Isolation**: modifications made to elements positioned in this way will not affect other elements within the normal flow (i.e. avoids reflows)
- **Performance optimization**: positioning plays a key role in optimizing and minimizing updates to the DOM tree

##### Containing block

A containing block is the anchor to which `top, right, bottom, left` apply to an explicitly positioned element. By default, it's the browser viewport (window); however, there are two rules that take precedent:

1. If an element has `position: relative`, its closest **block-level** ancestor element is the containing block
1. If an element has `position: relative`, it becomes a containing block

##### Relative

- Element is positioned according to the normal flow of the document
    - `offset` is applied relative to itself
- `offset` does not affect the position of any other element; this, the space allocated for the element in the page layout remains the same as if the element's position was "static"
- Creates a new **stacking context** when the value of `z-index` is not "auto"

##### Absolute

- Element is removed from the normal document flow
- No space is reserved for the element in the page layout
- Element is positioned relative to its closest **positioned ancestor** if one exists; otherwise, it is placed relative to the browser viewport
- Final position is determined by `top, right, bottom, left`
- This positioning creats a new **stacking context** when the z-index value is not "auto"
    - Review to page 47-50 of the [slides](#frontend-system-design)
- 

### Browser graphics API: render object

DOM tree nodes are converted into `RenderObject`s so the browser can utilize GPU accelerated rendering. Render objects contain the necessary information to render in object, and nothing else.

However, by themselves, render objects aren't efficient ways at rendering layouts because it would require rending thousands of tiny little elements. This is where **render layers** come in.

### Browser graphics API: render layer

Render layers are created according to a browser's formatting contexts and stacking contexts, and when render objects are created for individual stacking contexts, those objects are stored within the Render Layer as a linked list in stack order.

A **render layer** is constructed when an element:

- Has explicit CSS properties:
    - position: relative | absolute
    - transform
- It's the root of the page (`<html />`)
- It is transparent
- Has a CSS filter
- Corresponds to a `<canvas>` element that has a 3D (WebGL) context or an accelerated 2D context
- Corresponds to a `<video>` element

However, the GPU is at rendering thousands upon thousands of things, not hundreds, so there's another layer that comes into play to utilize render layers.

### Browser graphics API: graphic layer

A **graphic layer** is constructed when:

- Render Layer has 3D or perspective transform CSS properties
- Layer is used by:
    - `<video>` element using accelerated video decoding
    - `<canvas>` with 3D/2D context
- Layer uses:
    - CSS animation for `opacity`
    - animated `web-kit transform`
- Layer uses accelerated CSS filters
- Layer has a descendant that is a **compositing layer**
- Layer has a sibling with a lower `z-index` which has a compositing layer (i.e., a layer that overlaps a composited layer and should be rendered on top of it)

So, a graphic layer, or graphic layers in cases where 3D acceleration is being utilized by a render layer, will contain all the necessary information to draw the rendering layers.

#### Caveats

Graphic layers are expensive objects to initialize because they use a lot of VRAM and CPU. Use them (3D acceleration, perspective transforms, opacity transformations, CSS filters, and composite layers) wisely.

## DOM API

### Global objects

window -> document -> body & head

`window`
`window.document` or `document`
`window.document.body` or `document.body`
`window.document.head` or `document.head`

### Class hierarchy

At the very bottom of the list, we have `HTMLElement`, which extends:

`Element`. `Element` contains the DOM API on it's `.prototype`, and it's the only class that contains the DOM API except for `HTMLDocument`. However, since `HTMLElement` extends `Element`, it has access to the DOM API. `Element` extends `Node`:

`Node` provides tree-like properties (DOM tree). `TextNode` represents all displayed text nodes on in the the layout, and it is an extension of `Node`. However, unlike `HTMLElement` and `Element`, `Node` is, kinda, at the top of the hierarchy (it is not extending anything, everything else extends it). `Node` is used to extend `HTMLDocument`:

`HTMLDocument` exists from `Window`, which is provided by the browser, and it extends `Node`. `HTMLDocument` also has access to the DOM API on it's `.prototype`.

### Queries

When the browser parses the page, it constructs a Hashmap of the elements.

The DOM API provides a variety of methods for querying for HTML elements in the document:

- `getElementById`
- `getElementByClassName`
- `getElementsByTagName`
- `querySelector`
- `querySelectorAll`

#### `getElemenyById`

Because the browser stores all the elements in a Hashmap, querying by ID is a O(1) time complexity search (instanenous-ish) because it simply is query a map with a specific ID.

Although it's an anti-pattern to overuse IDs because of polution of global scope, querying elements by ID is the most performant method.

#### `getElementsByClassName`

Unlike `getElementById`, to get elements by their classname, the browser needs to traverse the entire DOM tree (using DFS + Hashmap -> scans all the elements and collects the ones with the correct class text).

The time complexity is linear, because the browser needs to read the entire DOM tree in the worst case, or O(N); however, browsers utilize Hashmaps and caching, which although is slower on the first query, it is much faster for every subsequent queries. 

**One important note:**
Unlike other query selectors, `getElementsByClassName` returns a `HTMLCollection` which is a live collection of HTML element references (not clones) in the DOM. So, when you update the DOM, your HTMLCollection will also update, but the read cost of that is also O(N) because the browser needs to parse the tree again to verify the collection elements' positions.

This is still a good query when you need to query for multiple elements and you're concerned about memory (collection is made up of references not copies), but you need to utilize this efficiently because the read cost is high (i.e. if you're looping through, you're converting the read cost time complexity to quadratic time).

#### `getElementsByTagName`

Identical to `getElementsByClassName` except it queries with HTML tag names instead of class names.

#### `querySelector`

Like `getElementById`, `querySelector` returns an `Element` not a collection, which is much more efficient and performant. The time complexity is either O(1) or O(N) depending on the type of query we use (ID, tag, class name, complex queries).

In 99% of cases, this is your go to selector and it is the second most performant option behind `getElementById`, and thanks to caching and browser optimizations, it is comparable on repetitive runs. Read access is cheap.

**important note**
The downside of not returning a HTMLCollection (live collection) is you can have a value representing an `Element` that is stale because it was removed or updated in the DOM after you queried for it.

#### `querySelectorAll`

Unlike the rest of the query methods, `querySelectorAll` returns a `NodeList`. It is not a collection, but it is a copy of the HTML objects and therefore, does cost additional memory.

It's time complexity is like `querySelector`; and it's read cost is O(1) because we're simply reading a key on an object vs traversing the DOM tree again. Read access is cheap.

**important note**
The downside of not returning a HTMLCollection (live collection) is you can have a value representing an `Element` that is stale because it was removed or updated in the DOM after you queried for it.

### Adding/removing elements from the DOM

Unfortunately, all DOM API methods for adding elements has pretty high performance impacts because they all trigger reflows, but some are better than others.

- `innerHTML`: extremely high
- `insertAdjacentHTML`: extremely high
- `insertAdjacentElement`: high
- `appendChild`: high

Removing elements can be done with two methods of the same cost:

- `el.remove()`
- `el.innerHTML = ""`

### Use of `DocumentFragment`

When we're using vanilla JS/TS to create HTML elements, using a DocumentFragment (`<template>`) is a lightweight, in-memory HTMLElement method for:

- Modifying a custom component/JS-created HTML element's content without causing a reflow
    - DocumentFragments do not have a position in the page layout, but we can query a `<template>` by its `id` and use that to construct a custom element to the layout.
    - Obviously, once it is appended to the page layout and has its own render object, then updating that element would cause reflow...
- Reuse
- Isolation from the main DOM tree
- Utilizing HTML to create markup of components

## Web APIs

### Observer API

The observer API exists to replace that ole', slow, pain in the ass function, `element.getBoundingClientRect()`. Remember that one?

Unlike most APIs, the observer operates at the native level instead of the event level, which means it has access to many more and separate resources than most browser or web APIs. On average, the observer API is 50x faster than a vanilla implementation of `getBoundingClientRect`.

The observer API has three different parts:

1. Intersection (intersection of a root and target element)
2. Mutation
3. Resize

#### Intersection

The intersection observer watches a target element and triggers a callback when it comes in contact with a root element.

The intersection observer requires two things:

- callback: fn to execute on intersection
- options
    - root: the "window" we check the intersection against or the browser viewport if undefined
    - rootMargin: margin around the root
    - threshold: minimal intersection ratio required to trigger the callback

Then, you need to point your observer to your target with `.observe()`.

```typescript
const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {}
const observer = new IntersectionObserver(
    callback,
    {
        root: document.getElementById("#ScrollArea"),
        rootMargin: "0px",
        threshold: 0.1,
    }
)
const target = document.querySelector(".class")

observer.observe(target)
```

I'm often used in:

- Virtualization
- LAzy components
- Analytics
- Dynamic UI elements


#### Mutation

The mutation observer enables us to monitor changes in the DOM tree.

It takes one argument during instantiation:

- callback

It takes two arguments when calling `observe()`

- target: node we want to track changes from
- options:
    - subtree: monitor the entire tree under the target
    - childList: monitor only the direct children of the target
    - attributes: monitor for changes to the value of attributes on the target(s)
    - attributeFilter: filter which attributes to monitor
    - attributeOldValue: records the previous value of any attribute change if attributes is true
    - characterData: monitor the specified target for changes to the character data contained within the node
    - characterDataOldValue: records the previous value of any character data change if characterData is true

Options should be toggled wisely as each option increases the number of times the callback is triggered, which could lead to unnecessary performance hits if not required to satisfy functionality requirements (especially "subtree").

When a callback is triggered, the mutation observer returns a `MutationRecord`:

```ts
type MutationRecord = {
    type: "attributes" | "characterData" | "childList";
    target: Node;
    addedNodes: NodeList;
    removedNodes: NodeList;
    oldValue?: string;
}

function callback (mutations) {
    for (let mutation of mutations) {
        if (mutation.type === "characterData") {
            // ... your logic here
        }
        else if (...) {}
    }
}
```

I'm often used in:

- Rich text editors
- Drawing tools

**Important Note**
It's possible to cause infinite recursion by watching for mutations of an element that we're editing because the edit will cause a mutation on the edit, and on and on and on. It's best to update the element and then append it to the page, instead of appending it to the page and then updating it (which is also causing additional reflows).


#### Resize

The resize observer is used to watch for when a target element resizes.

There are four ways of "tracking" or reacting to resize events:

On the window:
1. "resize" event
2. CSS media queries

On an element:
1. CSS container query
2. Resize observer

However, the "resize" event is notariously the most greedy event to listen to because it fires on every single pixel change which hogs the CPU thread, and it can only be attached to the window. Don't use this.

CSS media and container queries are GREAT, but only if you don't need to execute JS/TS.

The resize observer is, on average, 10x faster than resize and can be attached to an element and execute JS/TS... When combined with CSS media queries, you can create very adaptive layouts.

During instantiation, it takes a single argument:

- callback

The callback accepts two arguments:

- entries
- observer

```ts
type ResizeObserverEntry {
    borderBoxSize: {
        blockSize: number,
        inlineSize: number,
    }[];
    contentBoxSize: {
        blockSize: number,
        inlineSize: number,
    }[];
    devicePixelContentBoxSize: {
        blockSize: number,
        inlineSize: number,
    }[];
    contentRect: DOMRectReadOnly;
    target: Element | SVGElement;
}

const callback = (entries) => {
    for (const entry of entries) {
        const [width, height] = [
            entry.borderBoxSize[0].inlineSize,
            entry.borderBoxSize[0].blockSize
        ]

        // your logic here
    }
}
```

When calling `.observe()`, it takes two arguments:

- target
- options
    - box: "content-box" | "border-box" | "device-pixel-content-box"

I'm often used in:

- Adaptive design
- Charting tools
- Drawing tools

**Important note**
The callback is still fired just like the "resize" event, but it's at the native level so it's utilizing more powerful and separate resources than the "resize" event. It's still a good idea to debounce your callback.

# Virtualization

Virtualization is a UI optimization technique for minimizing the number of DOM elements in the tree based to avoid increasing the cost of maintaining that tree and the resources the browser needs to do so. This is especially common in apps with infinite scrolling, but is pertinent to any application with an abnormally long DOM tree.

Formally, virtualization is maintaining data in memory while rendering only a limited subset, referred to as a **sliding window**.

There are three goals for this pattern:

1. Minimize the number of elements rendered in the DOM tree
2. Minimize the number of DOM mutations
3. Minimize CPU and memory usage required to maintain a DOM tree

Here are some rough guidelines as for when to reach for visualization:

- Mobile apps that are rendering large amounts of repetitive data
- Repetitive, memory-intense content in a scrollable area (news feeds, twitter feed, etc.)
- Loading 1000+ repetitive elements
- Whenever s rolling begins to feel sticky

Fortunately, desktop browsers have access to so much memory, virtualization is rarely a concern. In reality, avoiding the complexity is worth a lot more in most cases than the slight performance increases. Even if you need/want to fetch data in chunks, you can just append them all at once as a fragment to the DOM tree without being concerned about performance.

## Design

Typically, web-based Virtualization is designed with a top and bottom observer and a viewport between them. As a user scrolls down, the viewport triggers the next page of content, and on subsequent triggers via the bottom observer, the components/elements no longer visible above the current viewport are actually reused to generate the new content. By reusing already displayed elements, we're accomplishing goals 1, 2, and 3. When a user scrolls back up,  the process is reversed.

1. Implement and target your top and bottom observers
2. Register the callback that tracks the intersection with the top and bottom observers.
    i. Setting up intersection observers for the top and bottom observers
3. Select and prepare elements for recycling

### Recycling

Recycling involves maintaining an array of elements in memory, called **element pool**. This pool is used to recycle elements no longer in the viewport to avoid creating unnecessary elements, which triggers additional reflows and increases the computing and maintenance cost of the DOM tree. 

When the user scrolls the viewport and triggers the bottom observer, we're going to slice the element pool array in half and swap places so that item 1, 2, and 3... are the last items, etc.

The first step is to update how the elements are stored in memory.

- As we render the elements up until we hit our limit, store the element in our pool
- Once we hit our limit, slice our pool and half and swap the position of the halves

Once we have hit our pool limit and started swapping the halves of our pool:

- We need to move all our items displayed from our pool into a new stacking context with `position: absolute`
    - This also simplifies our positioning calculations
- We need to calculate the new Y positions for each item
- We need to calcualte the new Y position for the top observer

**Important note**
This method does not cause any reflow, but it does create a new stacking context where we will utilize GPU acceleration to position elements via CSS translateY.

#### Calculating new Y positions for each displayed item

When we hit our limit of the number of elements we'll store in our element pool, we halve the pool, swap the halves positions, and then **update** the content within the elements within the half we moved to the end of the pool array.

However, the new item at the beginning of the array can't rely on the previous element's Y position to calculate it's new Y position, so it is initialized to 0. Each subsequent item will use the previous item's Y position along with their height and margin to calcualte their new Y position.

Once we have an element's new Y position, we can use CSS transormations (`translateY`) to move it to the right place, and since it's within it's own stacking context, it won't affect the normal flow!

Finally, we need to move the top observer.

The top observer's top position will be the "first" element's Y position. The bottom observer's Y position will be the last pool element's Y position + its height and margin.

**Note**
I'm not convinced the observers need to move because if you're always initializing the "first" pool element's Y position to 0, the top observer SHOULD always be in a good spot (where it was initialized).

I was right. Moving the top observer just creates a ton of white space above the top observer as the elements keep moving further and further down the page.


When we execute recycling, we must update our start and end pointers.

# Application state design

Two types of frontend application state:

1. Data classes
2. Data properties

## Data classes

- App config
    - User preferences
        - theme
        - locale
        - language
        - font-size
        - etc
    - Accessibility settings
- UI Elements' State
    - Selected controls
    - Selected text formatting (Google Docs)
    - Show/hide state
    - Any state related to the current visual state of the page
    - Entered text, etc.
- Server data
    - Messages
    - Posts
    - Etc., data received from the backend

## Data properties

- Access level
- Read/write frequency
- Size

## General principles

In order of importance, we want to improve state design by:

1. Minimize access cost to our state
2. Minimize search cost
3. Minimize RAM usage

### Minimizing access cost to state

**Normalization** is the process of constructing data structures in a way that achieves the following goals:

1. Optimize access performance
2. Optimize storage structures
3. Increase developer readability and maintainability

#### Problem normalization helps avoid

As I have done many times in the past to simplify the mental bandwidth required to get the full picture of the a frontend's data structures, I have typically stored all data relevant to a thing in nested objects.

```ts
type Contact {
    name: string;
    address: string;
}

type Conversation {
    contact: Contact;
    messages: Message[];
    // ...
}
type User {
    name: string;
    address: string;
    contacts: Contact[];
    conversations: Conversations[];
    // ...
}
```

The problem with this is the access cost of values like "conversations," or worse, "messages" in "conversations," because the time complexity becomes:

- Access conversation - O(C)
- Access message - O(M)

**Access cost of message** - O(C) + O(M)

You're filtering conversations for the right conversation and then filtering messages for the right message. Although it's logically simple, it's very innefficient.

#### Normalization implementation

Review page 192 of the [Slides](https://static.frontendmasters.com/resources/2024-05-29-systems-design/frontend-system-design-fundamentals.pdf)

There are seven different "forms" or levels to normalization, but for the frontend, we're only concerned about the first two:

1. (1NF) Data is atomic && it has a primary key
2. (2NF) 1NF + non-primary keys depend on entity's primary key

```ts
// (Non-NF)
type User = {
    id: string
    name: string
    job: {
        id: string
        title: string
        department: string
    }
    location: {
        code: string
        name: string
    }
}

// (1NF)
type User  = {
    id: string // primary key
    name: string
    job_id: string // atomic  
    job_title: string  // atomic
    job_department: string // atomic  
    country_code: string // atomic  
    country_name: string // atomic  
}

// (2NF)
type User = {
    [id: string]: {
        name: string
        job_id: string
        country_id: string
    }
}

type Job = {
    [id: string]: {
        title: string
        department: string
    }
}

type Country = {
    [id: string]: {
        country_code: string
        country_name: string
    }
}

const users: User = {
    "1": {
        name: "Taylor",
        job_id: "UIE",
        country_id: "US",
    }
}

const jobs: { [k: string]: string } = {
    "UIE": "UI Engineer",
}

const department: { [k: string]: string } = {
    "UIE": "Engineering",
}

const user_jobs: { [k: string]: string } = {
    "1": "UIE",
}

const countries: { [k: string]: string } = {
    "US": "United States",
}
```

This allows us to use an O(1) time complexity (almost instant) to access any data directly with the key. We do not need to filter, etc.

# Networks

# Web application performance
