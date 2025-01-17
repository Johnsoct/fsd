<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 -->

<script setup>
import DocHeading from "../../components/doc-heading.vue"
</script>

# Virtualization

<DocHeading />

Virtualization is a UI optimization technique for minimizing the number of DOM elements in the tree based to avoid increasing the cost of maintaining that tree and the resources the browser needs to do so. This is especially common in apps with infinite scrolling, but is pertinent to any application with an abnormally long DOM tree.

Formally, virtualization is maintaining data in memory while rendering only a limited subset, referred to as a **sliding window**.

There are three goals for this pattern:

1.	Minimize the number of elements rendered in the DOM tree
2.	Minimize the number of DOM mutations
3.	Minimize CPU and memory usage required to maintain a DOM tree

Here are some rough guidelines as for when to reach for visualization:

-	Mobile apps that are rendering large amounts of repetitive data
-	Repetitive, memory-intense content in a scrollable area (news feeds, twitter feed, etc.)
-	Loading 1000+ repetitive elements
-	Whenever s rolling begins to feel sticky

Fortunately, desktop browsers have access to so much memory, virtualization is rarely a concern. In reality, avoiding the complexity is worth a lot more in most cases than the slight performance increases. Even if you need/want to fetch data in chunks, you can just append them all at once as a fragment to the DOM tree without being concerned about performance.

## Design

Typically, web-based Virtualization is designed with a top and bottom observer and a viewport between them. As a user scrolls down, the viewport triggers the next page of content, and on subsequent triggers via the bottom observer, the components/elements no longer visible above the current viewport are actually reused to generate the new content. By reusing already displayed elements, we're accomplishing goals 1, 2, and 3. When a user scrolls back up, the process is reversed.

1.	Implement and target your top and bottom observers
2.	Register the callback that tracks the intersection with the top and bottom observers. i. Setting up intersection observers for the top and bottom observers
3.	Select and prepare elements for recycling

### Recycling

Recycling involves maintaining an array of elements in memory, called **element pool**. This pool is used to recycle elements no longer in the viewport to avoid creating unnecessary elements, which triggers additional reflows and increases the computing and maintenance cost of the DOM tree.

When the user scrolls the viewport and triggers the bottom observer, we're going to slice the element pool array in half and swap places so that item 1, 2, and 3... are the last items, etc.

The first step is to update how the elements are stored in memory.

-	As we render the elements up until we hit our limit, store the element in our pool
-	Once we hit our limit, slice our pool and half and swap the position of the halves

Once we have hit our pool limit and started swapping the halves of our pool:

-	We need to move all our items displayed from our pool into a new stacking context with `position: absolute`
	-	This also simplifies our positioning calculations
-	We need to calculate the new Y positions for each item
-	We need to calcualte the new Y position for the top observer

**Important note** This method does not cause any reflow, but it does create a new stacking context where we will utilize GPU acceleration to position elements via CSS translateY.

#### Calculating new Y positions for each displayed item

When we hit our limit of the number of elements we'll store in our element pool, we halve the pool, swap the halves positions, and then **update** the content within the elements within the half we moved to the end of the pool array.

However, the new item at the beginning of the array can't rely on the previous element's Y position to calculate it's new Y position, so it is initialized to 0. Each subsequent item will use the previous item's Y position along with their height and margin to calcualte their new Y position.

Once we have an element's new Y position, we can use CSS transormations (`translateY`) to move it to the right place, and since it's within it's own stacking context, it won't affect the normal flow!

Finally, we need to move the top observer.

The top observer's top position will be the "first" element's Y position. The bottom observer's Y position will be the last pool element's Y position + its height and margin.

**Note** I'm not convinced the observers need to move because if you're always initializing the "first" pool element's Y position to 0, the top observer SHOULD always be in a good spot (where it was initialized).

I was right. Moving the top observer just creates a ton of white space above the top observer as the elements keep moving further and further down the page.

When we execute recycling, we must update our start and end pointers.
