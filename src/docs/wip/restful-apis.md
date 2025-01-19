# Why REST APIs?

- Uniform interface
- Client-Server
- Stateless
- Cacheable
- Layered system
- Code on Demand (optional)

# Rules

- URIs should be built around nouns, not verbs like "get"
- Error codes
    - 200s: success
    - 400s: Error in request
    - 500s: Error in server
- Server errors should implement a retry mechanism as long as the request is idempotent (most POST are not idempotent)

> [!INFO] Idempotent
> Making multiple of the exact same request has the same effect.
