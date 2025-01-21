---
head: [
    [
        "script",
        {
            defer: true,
            type: "module",
            src: "../utils/fullVirtualization",
        },
    ]
]
---

<!-- markdownlint-disable MD007 MD010 MD013 MD024 MD028 MD033 MD041 -->

<style>
.BottomObserver {
    align-items: center;
    background-color: brown;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    position: absolute;
    width: 100%;
}

.TopObserver {
    align-items: center;
    background-color: blueviolet;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    position: absolute;
    width: 100%;
}

.Conversation {
    display: flex;
    flex-direction: column;
}

.Conversation__avatar {
    background-color: grey;
    border-radius: 50%;
    height: 40px;
    width: 40px;
}

.Conversation__button {
    background-color: green;
    font-size: 24px;
    height: 40px;
    padding: 0 1rem;
}

.Conversation__contact {
    color: black;
}

.Conversation__header {
    align-items: center;
    background-color: lightgrey;
    display: flex;
    justify-content: space-between;
    padding: 1rem;
}

.Conversation__inputs {
    align-items: center;
    display: flex;
}

ul.Conversation__messages {
    background-color: lightgrey;
    margin: 0;
    padding: 0;
}

.Conversation__input {
    background-color: lightgrey;
    color: black;
    flex-grow: 1;
    height: 40px;
    margin-right: 1rem;
    padding: 0.5rem;
}

.Conversation__input::placeholder {
    color: black;
    margin-left: 1rem;
}

.Conversation__viewport {
    contain: layout;
    height: 400px;
    margin: 1rem 0;
    overflow-y: auto;
    /* Creates a new stacking context */
    position: relative;
}

.Message {
    align-items: center;
    background-color: lightgrey;
    display: flex;
    margin-bottom: 1rem;
    padding: 1rem;
}

.Message:last-child {
    margin-bottom: 0;
}

.Message__avatar {
    background-color: grey;
    border-radius: 50%;
    height: 40px;
    margin-right: 1rem;
    min-width: 40px;
}

.Message__author {
    color: black;
    flex-basis: 150px;
    margin-right: 1rem
}

.Message__content {
    color: black;
    flex-grow: 1;
    text-align: right;
}
</style>

<div class="Conversation">
    <div class="Conversation__header">
        <div class="Conversation__avatar"></div>
        <label class="Conversation__contact">Person B</label>
    </div>
    <div class="Conversation__viewport">
        <div class="TopObserver">
            <label>Top Observer</label>
        </div>
        <ul class="Conversation__messages"></ul>
        <div class="BottomObserver">
            <label>Bottom Observer</label>
        </div>
    </div>
    <div class="Conversation__inputs">
        <input
            class="Conversation__input"
            placeholder="Send a message..."
            type="text"
        />
        <button class="Conversation__button">📨</button>
    </div>
</div>
