// Helpers
import MockDB from "./mockDB.js"
// Components
import MessageTemplate from "./createMessageTemplate.js"

const bottomObserver = document.querySelector(".BottomObserver")
const data = []
const DB = new MockDB()
const _limit = 5
const topObserver = document.querySelector(".TopObserver")
const viewportEl = document.querySelector(".Conversation__messages")
const nodeLimit = _limit * 2
const elementPool = []
let _page = 1

function createMessageEl(message) {
    const template = MessageTemplate.content.cloneNode(true)
    console.log(template)
    console.log(MessageTemplate.content)
    const messageEl = template.querySelector(".Message__content")
    const personEl = template.querySelector(".Message__author")

    messageEl.textContent = message.message
    personEl.textContent = message.speaker

    return template
}

function getOffset(limit = _limit, page = _page): number {
    return (limit * page) - limit
}

function getMessages(limit = _limit, page): Promise<void> {
    return DB
        .getMessages(limit, getOffset(limit, page))
        .then((messages) => {
            const fragment = new DocumentFragment()

            messages.forEach((message) => {
                const messageEl = createMessageEl(message)

                // TODO: don't push data we've already pushed
                // TODO: Recycling elements after nodeLimit
                data.push(message)
                // BUG: adding empty DocumentFragment's
                elementPool.push(messageEl)
                fragment.appendChild(messageEl)
            })

            viewportEl.appendChild(fragment)

            _page = page || 1

            // console.dir(data, elementPool, _page)
        })
}

// Initialization
// BUG: intersection observers firing on load
// TODO: intersection observers should observe current first and last elements
DB
    .initDB()
    .then(() => {
        getMessages(_limit, _page).then(() => {
            // console.log(elementPool)
            // Intersection Observers
            const backwardCallback = (entries: IntersectionObserverEntry, observer: IntersectionObserver) => {
                getMessages(_limit, _page - 1)
            }
            const forwardCallback = (entries: IntersectionObserverEntry, observer: IntersectionObserver) => {
                getMessages(_limit, _page + 1)
            }
            const options = {
                root: document.querySelector(".Conversation__viewport"),
                threshold: 1,
            }

            const bottomIntersectionObserver = new IntersectionObserver(forwardCallback, options)
            const topIntersectionObserver = new IntersectionObserver(backwardCallback, options)
            const firstEl = elementPool[getOffset(_limit, _page)]
            const lastEl = elementPool[elementPool.length - 1]

            // console.dir(firstEl, lastEl)

            bottomIntersectionObserver.observe(lastEl)
            topIntersectionObserver.observe(firstEl)
        })
    })

