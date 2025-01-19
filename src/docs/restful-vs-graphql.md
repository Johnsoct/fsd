<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD033 MD041 -->
### GraphQL

When properly configured and well supported, it provides a seamless, intuitive developer experience.

#### When to use

Medium to large application without a widely used public API; has a large budget and team size; is utilizing isomorphic types, unconcerned about bundle size, and has a complex API model.

GraphQL is really meant for complex apps because it can really reduce the complexity between the server and the client by creating an **internal implementation** layer where different APIs utilizing different protocols can be implemented with the same interface(s) regardless of what API and where you're calling said API from.

#### When not to use

- Small applications
- Widely used public API
- Limited budget or small team size
- Not utilizing isomorphic data types between client and server
- Bundle size is critical
- Simple API model

#### Pros

Reduces complexity between the server and client in complex applications by introducing reusable interfaces for a variety of transfer protocols.

#### Cons

1. Increased bundle size (1.5mb)
2. Additional client libraries (it's never just GraphQL)
3. Additional client caching layer, which is very difficult and fickle
4. Additional state manager to ensure GraphQL client is syncing state between the client and the server
