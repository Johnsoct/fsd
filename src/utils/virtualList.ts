// Types
import { Message } from "./mockDB"
// Helpers
import MockDB from "./mockDB"
// Components
import MessageTemplate from "./createMessageTemplate"

interface VirtualList {
}

const DB = await new MockDB().initDB()

export default class Virtualization implements VirtualList {
    data: Message[];
    DB: MockDB;
    elementPool: Element[];
    readonly _limit: number;
    readonly nodeLimit: number;
    _page: number;
    root: Element | null;

    constructor(root, props) {
        this.data = []
        this._limit = 10
        this.root = root
        this.nodeLimit = this._limit * 2
        this.elementPool = []
        this._page = 1
    }

    private backwardCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                this._page = this._page - 1 || 0
                this.getMessages(this._limit, this._page)
            }
        })
    }

    private createMessageEl(message: Message): Element {
        // NOTE: Utilizing .firstElementChild allows the clone node to behave like a native Element
        const template = MessageTemplate.content.firstElementChild!.cloneNode(true) as Element
        const avatarEl = template.querySelector(".Message__avatar")
        const messageEl = template.querySelector(".Message__content")
        const personEl = template.querySelector(".Message__author")

        avatarEl!.textContent = message.offset.toString()
        messageEl!.textContent = message.message
        personEl!.textContent = message.speaker

        return template
    }

    private forwardCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                this._page = this._page + 1 || 0
                this.getMessages(this._limit, this._page)
            }
        })
    }

    private getOffset(limit = this._limit, page = this._page): number {
        return (limit * page) - limit
    }

    private getMessages(limit = this._limit, page: number): Promise<void> {
        return DB
            .getMessages(limit, this.getOffset(limit, page))
            .then((messages: Message[]) => {
                const fragment = new DocumentFragment()

                if (!messages.length) {
                    const liEl = document.createElement("li")
                    const message = document.createTextNode("You're at the end")

                    liEl.appendChild(message)
                    fragment.appendChild(liEl)
                }
                else {
                    messages.forEach((message) => {
                        const messageEl = this.createMessageEl(message)

                        // TODO: Recycling elements after nodeLimit
                        // TODO: Use IndexedDB to store data without duplicates and in order
                        //data.push(message)
                        if (this.elementPool.length < this.nodeLimit) {
                            this.elementPool.push(messageEl)
                        }
                        fragment.appendChild(messageEl)
                    })
                }

                if (this.root) {
                    this.root.appendChild(fragment)
                }

                //console.log(elementPool, _page, data)
            })
    }

    // TODO: Calculate position of each element
    render() {

    }

    // BUG: intersection observers firing on load
    private setObservers() {
        // Intersection Observers
        const options = {
            root: document.querySelector(".Conversation__viewport"),
            threshold: 1,
        }

        const bottomIntersectionObserver = new IntersectionObserver(this.forwardCallback, options)
        const topIntersectionObserver = new IntersectionObserver(this.backwardCallback, options)
        // BUG: The firstEL is always in view when this is set, which triggers the callback
        const firstEl = this.elementPool[this.getOffset(this._limit, this._page)]
        const lastEl = this.elementPool[this.elementPool.length - 1]

        console.log("%o", firstEl)
        console.log("%O", lastEl)

        // BUG: outdated observers never stop observing; how to keep track?
        bottomIntersectionObserver.observe(lastEl)
        topIntersectionObserver.observe(firstEl)
    }
}


