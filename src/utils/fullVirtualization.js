// Helpers
import MockDB from "./mockDB.js"
// Components
import MessageTemplate from "./createMessageTemplate.js"

const bottomObserver = document.querySelector(".BottomObserver")
const data = []
const DB = new MockDB()
const limit = 5
const messageTemplateEl = MessageTemplate
const topObserver = document.querySelector(".TopObserver")
const viewportEl = document.querySelector(".Conversation__messages")
const nodeLimit = 20
let elementPool = []
let page = 1

function createMessageEl(message) {
    const template = messageTemplateEl.content.cloneNode(true)
    const messageEl = template.querySelector(".Message__content")
    const personEl = template.querySelector(".Message__author")

    messageEl.textContent = message.message
    personEl.textContent = message.speaker

    return template
}

function getOffset(limit, page) {
    return (limit * page) - limit
}

DB
    .initDB()
    .then(() => {

        DB
            .getMessages(limit, getOffset(limit, page))
            .then((messages) => {
                const fragment = new DocumentFragment()

                data.push(messages)

                messages.forEach((message) => {
                    const messageEl = createMessageEl(message)

                    elementPool.push(messageEl)
                    fragment.appendChild(messageEl)
                })

                viewportEl.appendChild(fragment)
            })
    })

