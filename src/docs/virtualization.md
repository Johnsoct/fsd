<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD028 MD033 MD041 -->
> [!INFO] Virtualization
> Virtualization is a UI optimization technique for minimizing the number of DOM elements in the tree to avoid increasing the cost of maintaining said tree and the resources the browser needs to do so. This is accomplished by maintaining data in memory while using only a portion of said data to render a limited subset of components, referred to as a **sliding window**. In other words, if you have 100 tweets in memory, you'd only render a subset of 20 at any given time.

There are three goals for this pattern:

1.	Minimize the number of elements rendered in the DOM tree
2.	Minimize the number of DOM mutations
3.	Minimize CPU and memory usage required to maintain the DOM tree

Here are some rough guidelines as for when to reach for visualization:

-	Mobile apps rendering large amounts of repetitive data
-	Repetitive, memory-intense content in a scrollable area (news feeds, twitter feed, etc.)
-	Loading 1000+ repetitive elements
-	Whenever scrolling begins to feel sticky

Fortunately, desktop browsers have access to so much memory, virtualization is rarely a concern. In reality, avoiding the complexity is worth a lot more in most cases than the slight performance increases. Unless you'll be frequently updating the DOM while rendering hundreds or thousands of repetitive elements,  you can just fetch data in chunks then append them all at once as a fragment without being concerned about performance.

### Design

Typically, web-based Virtualization is designed with a top and bottom observer and a viewport between them. As a user scrolls, the viewport triggers the next subset of content, which recycles the components/elements no longer visible above or below the current viewport by reusing the elements but with the new content. By reusing already displayed elements, we're accomplishing goals 1, 2, and 3. When a user scrolls back up, the process is reversed.

1. GET paginated data; store initial data in memory (local state, browser storage, IndexDB, etc.)
1. Store new data in memory for every subsequent fetch
1. Configure the intersection observer and target (`.observer()`) your top and bottom observers
1. Select and prepare elements for recycling

### Recycling

Recycling involves maintaining an array of elements in memory, called an **element pool**. This pool is used to recycle elements no longer in the viewport to avoid creating unnecessary elements, which would trigger additional reflows and increases the computing and maintenance cost of the DOM tree.

> [!INFO] Element Pool
> An array of elements stored in memory used for recycling during virtualization.

#### Steps

1. Append elements to our element pool until we hit our display limit
2. Once we hit our limit, slice our element pool in half and swap the positions of the halves
3. Update our start and end pointer values
4. Move all our items displayed from our pool into a new stacking context with `position: absolute`, simplifying our positioning calculations
5. Calculate the new Y positions for each item
6. Calcualte the new Y position for the top observer

##### Splitting the element pool
```ts
// Even example
let elementPool = [1, 2, 3, 4, 5, 6]

const frontHalf = elementPool.slice(0, pool.length / 2) // 1, 2, 3
const backHalf = elementPool.slice(elementPool.length / 2) // 4, 5, 6

elementPool = [ ...backHalf, ...frontHalf ] // [4, 5, 6, 1, 2, 3]

// Odd example
let elementPool = [1, 2, 3, 4, 5]

const frontHalf = elementPool.slice(0, pool.length / 2) // 1, 2
const backHalf = elementPool.slice(elementPool.length / 2) // 3, 4, 5

elementPool = [ ...backHalf, ...frontHalf ] // [3, 4, 5, 1, 2]
```


> [!IMPORTANT]
> This method does not cause any reflow, but it does create a new stacking context where we will utilize GPU acceleration to position elements via CSS translateY.

##### Calculating new Y positions for each displayed item

When we hit our limit of the number of elements we'll store in our element pool, we halve the pool, swap the halves positions, and then **update** the content within the elements of the half we moved to the end of the pool array.

However, the first time we do this, the new item at the beginning of the array can't rely on the previous element's Y position to calculate it's new Y position, so it is initialized to 0. Each subsequent item will use the previous item's Y position along with their height and margin to calcualte their new Y position.

`yPosition = calc(previousElYPos + height + margin`

Once we have an element's new Y position, we can use CSS transormations (`translateY`) to move it to the right place, and since it's within it's own stacking context, it won't affect the normal flow!

##### Calculating the new Y position for the top observer

The top observer's top position will be the "first" element's Y position minus its height and margin.

`topYPosition = calc(elementPool[0].yPosition - height - margin)`

The bottom observer's Y position will be the last pool element's Y position plus its height and margin.

`bottomYPosition = calc(elementPool[elementPool.length - 1) + height + margin`

> [!INFO]
> I'm not convinced the observers need to move because if you're always initializing the "first" pool element's Y position to 0, the top observer SHOULD always be in a good spot (where it was initialized).

I was right. Moving the top observer just creates a ton of white space above the top observer as the elements keep moving further and further down the page.
