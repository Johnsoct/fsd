// Types
import {
    Message,
    VirtualizationProps
} from "../../types/virtualization"

// TODO: this.data isn't actually being used to recycling information
export default class Virtualizationer {
    data: Map<number, Message>;
    direction: string;
    elementPool: HTMLElement[];
    readonly html: string;
    _page: number;
    props: VirtualizationProps;
    requestLimit: number;
    root: Element | null;

    constructor(root: Element | null, props: VirtualizationProps) {
        this.data = new Map()
        this.direction = "down"
        this.elementPool = []
        this.html = `
            <div id="TopObserver">Top Observer</div>
            <ul id="VirtualList"></ul>
            <div id="BottomObserver">Bottom Observer</div>
        `.trim()
        this.props = { ...props }
        this.requestLimit = this.props.nodeLimit / 2
        this.root = root
        this._page = 0

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

    private backwardCallback() {
        // WARN: this feels hacky
        // NOTE: because we keep two pages of data displayed at any given time besides on load
        // when we hit the top observer, we need to go back two pages when our last direction
        // was down
        if (this.direction === "down") {
            this._page = this._page - 2
        }
        else {
            this._page--
        }

        this.getData(this.requestLimit, this._page, "up")

        this.direction = "up"
    }

    private createNode(message: Message): HTMLElement {
        // Create a new element with message
        return this.props.getTemplate(message)
    }

    private forwardCallback() {
        // WARN: this feels hacky
        // NOTE: because we keep two pages of data displayed at any given time besides on load
        // when we hit the bottom observer, we need to go up two pages when our last direction
        // was up
        if (this.direction === "up") {
            this._page = this._page + 2
        }
        else {
            this._page++
        }

        this.getData(this.requestLimit, this._page, "down")

        this.direction = "down"
    }

    private getBottomObserver(): HTMLElement {
        return document.getElementById("BottomObserver") as HTMLElement
    }

    private getTopObserver(): HTMLElement {
        // I believe it's safe to assume this doesn't return null because
        // to get here, you have to call this.render (this fn is also private)
        return document.getElementById("TopObserver") as HTMLElement
    }

    private getVirtualListContainer() {
        return document.getElementById("VirtualList")
    }

    private async getData(limit = this.requestLimit, page: number, direction: string): Promise<void> {
        return this.props.getData(limit, page).then((messages: Message[]) => {
            const listContainer = this.getVirtualListContainer()

            // NOTE: Since we're updating elementPool one index at a time, we need to handle the incoming
            // messages one at a time, and if they're in standard order, they end up in reversed order
            // after the updates
            if (direction === "up") {
                messages.reverse()
            }

            messages.forEach((message) => {
                this.updateData(message)
                this.updateElementPool(message, direction)
            })

            //console.dir("Data:", this.data)
            // console.dir("Element pool:", this.elementPool)

            if (listContainer) {
                if (listContainer.childNodes.length < this.props.nodeLimit) {
                    const fragment = new DocumentFragment()
                    this.elementPool.forEach((el) => fragment.appendChild(el))
                    listContainer.appendChild(fragment)
                }
            }
            else {
                console.log(`"this.root" was null; could not append fragment`)
            }

            this.updateElementsPosition(direction)
            this.updateTopObserverPosition()
            this.updateBottomObserverPosition()
        })
    }

    private intersectionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            const id = entry.target.id

            if (entry.isIntersecting) {
                if (id === "TopObserver" && this._page > 0) {
                    void this.backwardCallback()
                }

                if (id === "BottomObserver") {
                    void this.forwardCallback()
                }
            }
        })
    }

    private initializeObservers() {
        const options = {
            root: this.root,
            threshold: 1,
        }
        const observer = new IntersectionObserver(this.intersectionCallback.bind(this), options)

        // NOTE: By observing the top first, we avoid triggering the top callback when the observer
        // initializes due to the bottom observer's callback increasing the page count
        observer.observe(this.getTopObserver())
        observer.observe(this.getBottomObserver())
    }

    render() {
        if (this.root) {
            this.root.innerHTML = this.html
            this.initializeObservers()
        }
    }

    private recyclePoolElement(message: Message, direction: string): void {
        if (direction === "down") {
            const el = this.elementPool[0]

            this.updateNode(el, message)

            this.elementPool = [...this.elementPool.slice(1), el]
        }
        else {
            const el = this.elementPool.at(-1)

            if (el) {
                this.updateNode(el, message)

                this.elementPool = [el, ...this.elementPool.slice(0, -1)]
            }
            else {
                console.log("element not found at `this.elementPool.at(-1)` within recyclePoolElement()")
            }
        }
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

    private updateData(message: Message) {
        // TODO: Use IndexedDB to store data without duplicates and in order
        this.data.set(message.offset, message)
    }

    private updateElementPool(message: Message, direction: string): void {
        if (this.elementPool.length < this.props.nodeLimit) {
            this.addElementToPool(message)
        }
        else {
            this.recyclePoolElement(message, direction)
        }
    }

    private calculateElementPositionDownwards(el: HTMLElement, prevEl: HTMLElement) {
        const prevHeight = prevEl?.clientHeight || 0
        const prevY = Number(prevEl?.getAttribute("data-offset")) || 0
        const yPos = (prevHeight + prevY).toString()

        el.setAttribute("data-offset", yPos)
        el.style.transform = `translateY(${yPos}px)`
    }

    private calculateElementPositionUpwards(el: HTMLElement, prevEl: HTMLElement) {
        const prevY = Number(prevEl?.getAttribute("data-offset")) || 0
        const newY = (prevY - el.clientHeight).toString()

        el.setAttribute("data-offset", newY)
        el.style.transform = `translateY(${newY}px)`
    }

    private updateElementsPosition(direction: string): void {
        // NOTE: only update the most recently updated items
        // WARN: this function can't be called outside of getData, becauase it assumes it
        // is immediately following items being added to `this.elementPool`
        if (direction === "down") {
            this.elementPool.forEach((el, index) => {
                if (index >= (this.elementPool.length - 1 - this.requestLimit)) {
                    this.calculateElementPositionDownwards(el, this.elementPool[index - 1])
                }
            })
        }
        else {
            this.elementPool.reverse().forEach((el, index) => {
                // Need to address elementPool in reverse... 
                if (index > this.requestLimit - 1) {
                    this.calculateElementPositionUpwards(el, this.elementPool[index - 1])
                }
            })
            this.elementPool.reverse()
        }
    }

    private updateNode(el: HTMLElement, message: Message): void {
        // Create a new element with message
        this.props.updateTemplate(el, message)
    }

    private updateTopObserverPosition() {
        if (!this.elementPool.length) {
            console.log("updateBottomObserverPosition is being called while elementPool is empty")
        }
        else {
            const el = document.getElementById("TopObserver")

            if (el) {
                console.log(this.elementPool)
                const firstY = Number((this.elementPool[0] as HTMLElement).getAttribute("data-offset")) || 0
                // const height = el.clientHeight

                el.style.transform = `translateY(${firstY}px)`
            }
        }
    }
}
