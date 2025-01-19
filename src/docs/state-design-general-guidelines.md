<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD030 MD033 MD041 -->
In order of importance, we want to design our state to:

1.	Minimize access cost to our state
2.	Minimize search cost
3.	Minimize RAM usage

### Minimizing access cost to state

> [!INFO] Normalization
> The process of constructing data structures in a way that achieves the following goals:
>
> 1.	Optimize access performance
> 2.	Optimize storage structures
> 3.	Increase developer readability and maintainability

> [!IMPORTANT]
> It is impossible to avoid time complexities greater than O(1), but the goal is to reduce those cases as much as possible.

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
-	Access cost of GET'ing a specific message - O(N) * O(N) = O(N^2)

##### Explanation

You're filtering conversations for the right conversation and then filtering messages for the right message. Although it's logically simple, it's very innefficient.

```ts
const message = user.conversations.forEach((conversation) => {
    if (conversation.contact === "Tom") {
        conversation.messages.forEach((message) => {
            if (message.message.includes("Hey, asshole! I know you slept with my wife!")) {
                return conversation
            }
        })
    })
})
```

#### Normalization implementation

[Database normalization](https://en.wikipedia.org/wiki/Database_normalization)

Review page 192 of the [Slides](https://static.frontendmasters.com/resources/2024-05-29-systems-design/frontend-system-design-fundamentals.pdf)

There are seven different "forms" or levels to normalization, but for the frontend, we're only concerned about the first two:

1.	(1NF) Data is atomic && it has a primary key
    1. i.e. A property value of an object should not be a complex data type
2.	(2NF) 1NF + non-primary keys depend on their respective entity's primary key

```ts
// (Non-NF)
type User = {
    country: {
        code: string
        name: string
    }
    id: string
    job: {
        id: string
        title: string
        department: string
    }
    name: string
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

// With the ID of a user, Job is instant access because it can be accessed by key
type Job = {
    [id: string]: {
        title: string
        department: string
    }
}

// With the ID of a user, Country is instant access because it can be accessed by key
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

const jobs: Job = {
    "UIE": {
        department: "Engineering",
        title: "UI Engineer",
    },
}

const countries: Country = {
    "US": {
        country_code: "US",
        country_name: "United States",
    },
}

// Utilizing a combination of a user key and job key, we can create a map to quickly find 
// the jobs of known users
const user_jobs: { [k: string]: string } = {
    "1": "UIE",
}

// Utilizing a combination of a user key and country key, we can create a map to quickly find 
// the countries of known users
const user_countries: { [k: string]: string } = {
    "1": "US",
}
```

This allows us to use an O(1) time complexity (almost instant) to access any data directly with an object key. We do not need to filter or loop over values within an entity once we have a user ID.

#### Browser storage options

| Type | Indexed DB | Local storage | Session storage |
| -- | :--: | :--: | :--: |
| Storage capacity | unlimited | 5mb | 5mb|
| Indexing | Yes | No | No |
| Advanced search | Yes | No | No |
| Data types | number, date, string, binary, array | string | string |
| Blocking thread | No | Yes | Yes |
| Asynchronous | Yes | No | No |

> [!INFO] IndexedDB API
> A low-level API for client-side storage of significant amounts of structured (normalized) data, including files or blobs. This API uses indexes to enabled high-performant searches.
>
> IndexedDB is a transactional database system, like a SQL-based relational database management system (RDBMS); however, unlike SQL-based RDBMSes with fixed-column tables, IndexedDB is a POJO database, which lets you store and retrieve objects indexed with a key.

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

Now, instead of searching through each message's content property, we can store the content, and every composite of the content, as a key which allows us index access to messages. The value of a message will be a tuple representing the message id and timestamp.

### Minimize RAM usage

Browser storage APIs, including IndexedDB, allow us to offload data stored in memory (variables) to a user's hard drive (metaphorically, through the browser).

Normally, this probably isn't a big concern; however, if performance is important to your business model (or you have a large number of mobile device users), then it's important to utilize these APIs to offset your state into a more resource-abundant storage solution.

If you need frequent access to this data, then the IndexedDB is a great option. If you only need occassional access, local or session storage are better options.
