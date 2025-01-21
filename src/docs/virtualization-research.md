# Full implementation

> [!INFO] Baseline
> Vitepress header, test chat application interface, 5 loaded items from mockDB via fake promise, no intersection observers implemented
>
> **commit**: 8ac8d31116fe8b80385edff97d82fa56efd285f4

At "baseline," here's the information I gleamed from the browser:

## Layers

1. #document
2. #14 (scrollbar)
3. Chat application .Conversation__viewport
4. header.VPNav
5. #16 (Vitepress header)

All I care about is anything directly related to my test application, which is #3.

| Detail   | Value    |
|--------------- | --------------- |
| Size   | 673 x 720   |
| Compositing reason   | Overlaps other composited content   |
| Memory estimate   | 1.9MB   |
| Paint count   | 1   |
| Slow scroll regions | 7x Touch Event Handler (all <label> elements) |

## Lighthouse

I'm ignoring most of everything because it's not relevant.

| Metric   | Value    |
|--------------- | --------------- |
| JavaScript execution time (full-virtualization.js)   | 0.2s (309ms CPU time, 162ms script evaluation, 5ms script parse)   |
| Total DOM Elements   | 117   |
| Maximum DOM Depth   | 19   |
| Maximum Child Elements (.Conversation__messages)   | 10   |

