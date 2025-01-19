<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 MD041 -->
Examples of use cases for different methods of communication with a server

| Request | Mobile | Desktop | function |
|--|--|--|--|
| getShoppingOrders | SSE | long-polling, SSE | getShoppingOrders(timestamp: number, count: number, token): Order |
| getNewMessages | SSE | short-polling, SSE | getNewMessages(timestamp: number, count: number, token): Message |
| sendMessage | HTTP POST | HTTP POST | sendMessage(message, token): Message  |

### Fetching new entities as they "come in"

#### Long/short polling

Polling is simply making a request on a set interval.

> [!INFO] Short polling
> Refers to an interval around five seconds, or less than the set time a TCP socket closes from inactivity or timeout

> [!INFO] Long polling
> Refers to an interval greater than or equal to the set time a TCP socket closes.

```ts
setInterval(() => {
    fetch(api, params).then(getEntity)
}, timeout)
```

##### When to use it

Desktop applications when some delay is acceptable (i.e. you don't need realtime updates), such as loading new group posts.

##### When to avoid it

Mobile applications

##### Problems

1. Speed (technically)
    1. DNS request (double handshake)
    2. Establishing TCP (triple handshake)
    3. HTTP request (double handshake)
2. Inefficient network usage
    1. When utilizing HTTP/1.1, headers are not compressed and can easily add 50kb to every request
3. Energy consumption
    1. A TCP connection creates a TCP socket, which stays open as long as required; however, this means long/short polling will reopen or continue to utilize an open TCP socket, and on mobile devices, with limited resources and battery, it's a significant power draw.
    2. TCP uses the "duplex" network module on mobile devices
4. Latency over mobile networks
    1. TCP sockets requre reinitialization when they're closed, which happens when a mobile device disconnects from one network tower and reconnects to another
        1. Server has to maintain a copy of the state (RESTful APIs are suppose to be stateless)
        2. Reconnection needs to be implemented on the client
        3. New TCP connection requires another triple handshake

##### Pros

1. Easy and cheap to implement
2. No additional infrastructure is needed
3. 99.99% of servers support it

##### Cons

1. Battery innefficient (high CPU usage due to open TCP connection and transmitter usage)
2. Network and data inefficient (header overhead)
3. HTTP/1.1 requires request headers to be sent with every request
4. Latency can degrade very quickly on mobile networks

#### Serve sent events (SSE)

SSE is when the client simply listens and responds to the server.

##### When to use it

1. Desktop and mobile applications when you must receive data with minimum latency
2. When web sockets aren't worth the infrastructure cost and some latency is acceptable
3. Large text-data streaming

##### When to avoid it

Simple use cases; just use long polling

##### Pros

1. Duplex communication is only used when establishing the initial TCP connection
2. Battery efficient (mono network module)
3. It doesn't send junk data (unnecessary headers)
4. Reconnection is **handled automatically**
5. Easy to horizontally scale since servers don't need to know the state
6. Since SSE is HTTP 2, it can re-use an existing TCP socket
7. Fast

##### Cons

1. Read-only; you can't push data to the server
2. Only string data is supported; you will need to parse the server payload
    1. Does not work with byte data

#### Web sockets

Web sockets are upgraded HTTP 1.1 connections (i.e. TCP connections).

They work like so:

1. Client sends a handshake request with UPGRADE headers
2. The servers responds with a successful request
3. Browser upgrades the protocol to **Web-Sockets**
4. Client and server has a *bi-directional* communication to send binary packages over its TCP socket

Although they extend from HTTP 1.1, they are different from HTTP requests:

1. HTTP is used only for the initial handshake
2. A pure TCP connection is used after the handshake
3. TCP allows establishing ~65K connections with one socket

##### When to use it

Real-time communication environments:

- Working with machine sensors and controls
- Online gaming
- Trading
- Precise location tracking

##### When to avoid it

When real-time communication isn't required or the infrastructure cost is to high for your product, team, or budget.

##### Pros

1. Web sockets provide almost real-time communication
2. "Unlimited" number of connections

##### Cons

1. Infrastructure cost is HUGE (time, effort, and money)
2. Reconnection is not implemented
3. Web sockets are stateful (therefore, the backend needs to keep a copy of the state in case reconnection is required or all state is lost)
4. Computing resource inefficiency
    1. Needs to maintain a constant TCP connection
    2. Uses duplex antenna
    3. Drains energy and utilizes the CPU

