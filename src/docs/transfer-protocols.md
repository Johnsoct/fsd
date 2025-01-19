## Introduction to transport protocols (UDP, TCP)

> [!INFO] UDP
> **User datagram protocol**
>
> Ideal for speed; server does not validate client received response
>
> 1. Client makes a request to a server
> 2. Server responds with response to request

> [!INFO] TCP --> HTTP/1.1, HTTP/2, SSE, web sockets
> **Transmission control protocol**
>
> Slower than UDP but ensures data validity from the server to the client.
>
> TCP connections are always a 5-step process beginning with a mandatory "triple handshake"
> 1. Client makes a synchronous request to send a request to a server
> 2. Server responds synchronously it's ready
> 3. Client sends an acknowledgement
>
> TCP socket is opened
>
> 4. Client sends a request
> 5. Server responds with response to request

### Choosing the right protocol

Read [networking performance optimizations](./performance#choosing-the-right-protocol) to help choose between HTTP/1.1, HTTP/2, HTTP/3, SSE, web sockets, webRTC, and QUIK.

