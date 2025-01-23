1. Contained scrolling window
2. Absolute positioned elements
    1. Custom Y values
3. Top and bottom observer
    1. Callback
        1. Store data in IndexedDB
    2. Moving the top observer
4. Get and update the DOM
    1. Fragment
    1. Create new element
    1. Append to fragment
    1. Add to element pool
    1. Appent fragment to scrolling window




# Recyling

- Changing an elements Y position to appear in X order
- Updating the elements innerHTML content (text content) once in new position

## State immediately before

[ element 1 ]
[ element 2 ]
[ element 3 ]
[ element 4 ]

## Desired state after

[ element 3 ]
[ element 4 ]
[ element 1 ] with different data
[ element 2 ] with different data
