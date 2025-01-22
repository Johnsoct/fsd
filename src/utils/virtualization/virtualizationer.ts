// Types
import {
    Message,
    VirtualizationProps
} from "../../types/virtualization"
// Helpers
import MockDB from "../mockDB"

export default class Virtualizationer {
    data: Message[];
    DB: MockDB;
    elementPool: HTMLElement[];
    readonly html: string;
    readonly _limit: number;
    readonly nodeLimit: number;
    _page: number;
    props: VirtualizationProps;
    root: Element | null;

    constructor(root: Element | null, props: VirtualizationProps) {
        this.data = []
        this.elementPool = []
        this.html = `
            <div id="TopObserver">Top Observer</div>
            <ul id="VirtualList"></ul>
            <div id="BottomObserver">Bottom Observer</div>
        `.trim()
        this.props = { ...props }
        this.root = root
        this._page = 1

        if (root === null) {
            console.log("%cRoot was null; aborting construction of VirtualList", "color: white; background-color: red; padding: 4px;")
            return
        }
    }

    private addElementToPool(message: Message): HTMLElement {
        const element = this.createNode(message)
        // Store a new element for recycling
        this.elementPool.push(element)

        return element
    }

    private backwardCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                this._page = this._page - 1 || 0
                this.getMessages(this.props.nodeLimit, this._page)
            }
        })
    }

    private createNode(message: Message): HTMLElement {
        // Create a new element with message
        return this.props.getTemplate(message)
    }

    private forwardCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            console.log(entry)
            if (entry.isIntersecting) {
                this._page = this._page + 1 || 0
                this.getMessages(this.props.nodeLimit, this._page)
            }
        })
    }

    private getVirtualListContainer() {
        return document.getElementById("VirtualList")
    }

    private getMessages(limit = this.props.nodeLimit, page: number): Promise<void> {
        return this.props.getData(limit, page).then((messages: Message[]) => {
            const fragment = new DocumentFragment()
            const listContainer = this.getVirtualListContainer()

            messages.forEach((message) => {
                // Store the new message in our "cache" / DB
                // TODO: Use IndexedDB to store data without duplicates and in order
                this.data.push(message)
                this.updateElementPool(message)

                // console.dir("Data:", this.data)
            })
            console.dir("Element pool:", this.elementPool)

            this.elementPool.forEach((el) => fragment.appendChild(el))

            if (listContainer) {
                listContainer.appendChild(fragment)
                this.updateElementsPosition()
                this.updateTopObserverPosition()
                this.updateBottomObserverPosition()
            }
            else {
                console.log(`"this.root" was null; could not append fragment`)
            }
        })
    }

    // BUG: intersection observers firing on load
    private initializeObservers() {
        // Intersection Observers
        const options = {
            root: document.querySelector(".Conversation__viewport"),
            threshold: 1,
        }

        const bottomIntersectionObserver = new IntersectionObserver(this.forwardCallback, options)
        const topIntersectionObserver = new IntersectionObserver(this.backwardCallback, options)
        // BUG: The firstEL is always in view when this is set, which triggers the callback
        const firstEl = this.elementPool[this.props.nodeLimit, this._page]
        const lastEl = this.elementPool[this.elementPool.length - 1]

        console.log("%o", firstEl)
        console.log("%O", lastEl)

        // BUG: outdated observers never stop observing; how to keep track?
        bottomIntersectionObserver.observe(lastEl)
        topIntersectionObserver.observe(firstEl)
    }

    render() {
        if (this.root) {
            this.root.innerHTML = this.html
            // this.initializeObservers()
            this.getMessages(this.props.nodeLimit, this._page)
        }
    }

    private recyclePoolElement(message: Message): HTMLElement {
        // TODO: Recycling the elements in elementPool by updating their
        // internals vs replacing the element in the DOM

        // TODO: get existing element in pool
        // TODO: update node's content
        // this.props.updateTemplate(message)
    }

    private updateBottomObserverPosition() {
        if (!this.elementPool.length) {
            console.log("updateBottomObserverPosition is being called while elementPool is empty")
        }
        else {
            const el = document.getElementById("BottomObserver")

            if (el) {
                const prevHeight = (this.elementPool.at(-1) as HTMLElement).clientHeight
                const prevY = Number((this.elementPool.at(-1) as HTMLElement).getAttribute("data-offset"))

                el.style.transform = `translateY(${prevY + prevHeight}px)`
            }
        }
    }

    private updateTopObserverPosition() {
        if (!this.elementPool.length) {
            console.log("updateBottomObserverPosition is being called while elementPool is empty")
        }
        else {
            const el = document.getElementById("TopObserver")

            if (el) {
                const firstY = Number((this.elementPool[0] as HTMLElement).getAttribute("data-offset")) || 0
                // const height = el.clientHeight

                el.style.transform = `translateY(${firstY}px)`
            }
        }
    }

    private updateElementPool(message: Message): HTMLElement {
        let element: HTMLElement

        // If we're not at our nodeLimit in elementPool:
        if (this.elementPool.length < this.props.nodeLimit) {
            element = this.addElementToPool(message)
        }
        else {
            element = this.recyclePoolElement(message)
        }

        return element
    }

    private updateElementsPosition(): void {
        this.elementPool.forEach((el, index) => {
            const prevHeight = this.elementPool[index - 1]?.clientHeight || 0
            const prevY = Number(this.elementPool[index - 1]?.getAttribute("data-offset")) || 0
            const yPos = (prevHeight + prevY).toString()

            el.setAttribute("data-offset", yPos)
            el.style.transform = `translateY(${yPos}px)`
        })
    }
}
