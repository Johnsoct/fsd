---
next:
    text: APIs 
    link: /docs/apis
prev:
    text: Fundamentals
    link: /docs/fundamentals
---

<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD030 MD033 -->

<script setup>
import DocHeading from "../../components/doc-heading.vue"
</script>

# Application State

[[toc]]

<hr>

In this module, we'll cover:

-	Search / access optimization
-	Intentional use of specific browser storage APIs
-	Memory offloading

## Two types of frontend application state

1.	Data classes
2.	Data properties

### Data classes

Data classes are more concrete values. They'll represent the contents of your data structures.

-   User configuration settings
	-	User preferences
		-	theme
		-	locale
		-	language
		-	font-size
		-	etc
	-	Accessibility settings
-	UI Elements' State
	-	Selected controls
	-	Selected text formatting (Google Docs)
	-	Show/hide state
	-	Any state related to the current visual state of the page
	-	Entered text, etc.
-	Server data
	-	Messages
	-	Posts
	-	Etc., data received from the backend

### Data properties

Data properties are more abstract values to consider when structuring your state.

-	Access level
-	Read/write frequency
-	Size

## General guidelines for approaching state design 

In order of importance, we want to design our state to:

1.	Minimize access cost to our state
2.	Minimize search cost
3.	Minimize RAM usage

### Minimizing access cost to state

**Normalization** is the process of constructing data structures in a way that achieves the following goals:

1.	Optimize access performance
2.	Optimize storage structures
3.	Increase developer readability and maintainability

**Important note**:

It is impossible to avoid time complexities greater than O(1), but the goal is to reduce those cases as much as possible.

#### The problem normalization prevents

As I have done many times in the past to simplify the mental bandwidth required to get the full picture of the a frontend's data structures, I have typically stored all data relevant to an entity in nested objects.

```ts
type Contact {
    address: string;
    id: string;
    name: string;
}

type Message {
    id: string;
    message: string;
    timestamp: Date;
}

type Conversation {
    contact: Contact;
    id: string;
    messages: Message[];
}

type User {
    contacts: Contact[];
    conversations: Conversation[];
    id: string;
    name: string;
    // ...
}
```

The problem with this is the access cost of values like "conversations," or worse, "messages" in "conversations," because the time complexity becomes:

-	Access cost of GET'ing a specific conversation - O(N)
-	Access cost of GET'ing a specific message - O(N) + O(N^2) = quadratic

##### Explanation

You're filtering conversations for the right conversation and then filtering messages for the right message. Although it's logically simple, it's very innefficient.

#### Normalization implementation

[Database normalization](https://en.wikipedia.org/wiki/Database_normalization)

Review page 192 of the [Slides](https://static.frontendmasters.com/resources/2024-05-29-systems-design/frontend-system-design-fundamentals.pdf)

There are seven different "forms" or levels to normalization, but for the frontend, we're only concerned about the first two:

1.	(1NF) Data is atomic && it has a primary key
    1. i.e. A property of an object should not be a complex data type
2.	(2NF) 1NF + non-primary keys depend on their respective entity's primary key

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

This allows us to use an O(1) time complexity (almost instant) to access any data directly with the key. We do not need to filter or loop over values within an entity.

#### Browser storage options

| Type | Indexed DB | Local storage | Session storage |
| -- | :--: | :--: | :--: |
| Storage capacity | unlimited | 5mb | 5mb|
| Indexing | Yes | No | No |
| Advanced search | Yes | No | No |
| Data types | number, date, string, binary, array | string | string |
| Blocking thread | No | Yes | Yes |
| Asynchronous | Yes | No | No |

### Minimizing search cost (ex. Facebook Messenger)

Given that any user could have multiple conversations with thousands of messages each, there needs to be a cheap way to search for messages within all those conversations.

Instead of filtering through every conversation and every message (quadratic time), we can store messages as an **inverted index table**.

```ts
type MessagesBefore = {
    id: string
    content: string
    timestamp: number
}

type MessagesOptimizedForSearch = {
    [k: string]: [string, number][]
}

const message = {
    "hello": [[1, 1000]],
    "hey": [[2, 2000]],
}

// Utilizing the IndexDB API, we can store indexes of the composite keys, which is effectively this if JavaScript allowed it
const message = {
    ["h", "he", "hel", "hell", "hello"]: [[1, 1000]],
}
```

Now, instead of searching through each message's content property, we can store the content, and every composite of the content, as a key which allows us index access to messages. The value of a message will be tuple representing the message id and timestamp.

## Summary

1. Know your scale - optimize accordingly
2. Always start with how you structure your data
3. Use normal forms to optimize access cost
4. Use indexes if in-app search is required
5. Offload data to hard-drive when it's needed (IndexDB, browser storage)
6. Pick a suitable storage
