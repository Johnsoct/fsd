<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD028 MD030 MD033 MD041 -->
## Observer API

The observer API exists to replace that ole', slow, pain in the ass function, `element.getBoundingClientRect()`. Remember that one?

The problem with `getBoundingClientRect()` was it ran on the main thread and listened to the `resize` event. The Observer API is callback-based, and only fires on when a target element's dimensions cross certain thresholds or the intersection between it and another element changes by a specified amount.

Unlike most APIs, the observer operates at the native level instead of the event level, which means it has access to many more and separate resources than most browser or web APIs. On average, the observer API is 50x faster than a vanilla implementation of `getBoundingClientRect`.

The observer API has three different parts:

1.	Intersection
2.	Mutation
3.	Resize

### Intersection

The intersection observer watches a target element and triggers a callback when it comes in contact with a root element.

The intersection observer accepts two arguments:

-	callback: fn to execute on intersection
-	options (optional)
	-	root: the "window" we check the intersection against or the browser viewport if undefined
	-	rootMargin: margin around the root
	-	threshold: minimal intersection ratio required to trigger the callback

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

<br>

I'm often used in:

-	Virtualization
-	Lazy components
-	Analytics
-   Ad placement calculations
-	Dynamic UI elements

### Mutation

The mutation observer enables us to monitor changes in the DOM tree.

It takes one argument during instantiation:

-	callback

It takes two arguments when calling `observe()`

-	target: node we want to track changes from
-	options:
	-	subtree: monitor the entire tree under the target
	-	childList: monitor only the direct children of the target
	-	attributes: monitor for changes to the value of attributes on the target(s)
	-	attributeFilter: filter which attributes to monitor
	-	attributeOldValue: records the previous value of any attribute change if attributes is true
	-	characterData: monitor the specified target for changes to the character data contained within the node
	-	characterDataOldValue: records the previous value of any character data change if characterData is true

Options should be toggled wisely as each option increases the number of times the callback is triggered, which could lead to unnecessary performance hits if not required to satisfy functionality requirements (especially "subtree").

When a callback is triggered, the mutation observer returns a `MutationRecord`:

```ts
type MutationRecord = {
    addedNodes: NodeList;
    oldValue?: string;
    removedNodes: NodeList;
    target: Node;
    type: "attributes" | "characterData" | "childList";
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

<br>

I'm often used in:

-	Rich text editors
-	Drawing tools

> [!IMPORTANT]
> It's possible to cause infinite recursion by watching for mutations of an element that we're editing because the edit will cause a mutation on the edit, and on and on and on. It's best to update the element and then append it to the page, instead of appending it to the page and then updating it (which is also causing additional reflows).

### Resize

The resize observer is used to watch for when a target element resizes.

There are four ways of "tracking" or reacting to resize events:

On the window:

1.	"resize" event
2.	CSS media queries

On an element:

1.	CSS container query
2.	Resize observer

#### How to choose a method

However, the "resize" event is notariously the most greedy event to listen to because it fires on every single pixel change which hogs the CPU thread, and it can only be attached to the window. Don't use this.

CSS media and container queries are GREAT, but only if you don't need to execute JS/TS.

The resize observer is, on average, 10x faster than resize and can be attached to an element and execute JS/TS... When combined with CSS media queries, you can create very adaptive layouts.

#### Resize

During instantiation, it takes a single argument:

-	callback

The callback accepts two arguments:

-	entries
-	observer

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
    contentRect: DOMRectReadOnly;
    devicePixelContentBoxSize: {
        blockSize: number,
        inlineSize: number,
    }[];
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

<br>

When calling `.observe()`, it takes two arguments:

-	target
-	options
	-	box: "content-box" | "border-box" | "device-pixel-content-box"

I'm often used in:

-	Adaptive design
-	Charting tools
-	Drawing tools

> [!IMPORTANT]
> The callback is still fired just like the "resize" event, but it's at the native level so it's utilizing more powerful and separate resources than the "resize" event (not the main browser thread). It's still a good idea to debounce your callback.
