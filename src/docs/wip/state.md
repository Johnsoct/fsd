# Explicitly defined states

**Idea influenced by XState and Maya Shavin (@mayashavin) during Vue Nation 2025**

## Idea

Instead of having multiple individual state values (properties, variables, etc.), explicitly define unique states:

Email signup, ex.

Instead of having individual variables for email valid, email input, password valid, passowrd input, password matching, step, form valid, etc.

...

Create states:

1. EmailGood/ReadyForPassword
2. PasswordGood/ReadyForSubmit

where each state contains the conditions for whether that state is active or not.

## Goals

1. Explicitly define states
1. State should be predictable, deterministic, and traceable between transitions
    1. Each defined state should transition into the next state
        1. ?EmailGood's properties/conditions should be a part of PasswordGood?
        1. XState uses the a `PREV` property to declare the state said state is transitioning from, which implies the previous state's condition(s) is being added to the "CURRENT" state
    2. Only one defined state can be active at a time
1. Keep state logic isolated and reusable (XState's abstraction)
