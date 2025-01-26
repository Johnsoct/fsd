// Types
import {
    Message,
    VirtualizationProps
} from "../../types/virtualization"

// TODO: this.data isn't actually being used to recycling information
// BUG: new items aren't starting at the scroll position (bottom); they're replacing what's at the bottom
export default class Virtualizationer {
    data: Map<number, Message>;
    elementPool: HTMLElement[];
    readonly html: string;
    _page: number;
    props: VirtualizationProps;
    requestLimit: number;
    root: Element | null;

    constructor(root: Element | null, props: VirtualizationProps) {
        this.data = new Map()
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
        this._page--
        this.getData(this.requestLimit, this._page, "up")
    }

    private createNode(message: Message): HTMLElement {
        // Create a new element with message
        return this.props.getTemplate(message)
    }

    private forwardCallback() {
        this._page++
        this.getData(this.requestLimit, this._page, "down")
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

            messages.forEach((message) => {
                this.updateData(message)
                this.updateElementPool(message)
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

    private recyclePoolElement(message: Message): void {
        const el = this.elementPool[0]

        this.updateNode(el, message)

        this.elementPool = [...this.elementPool.slice(1), el]
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

    private updateElementPool(message: Message): void {
        if (this.elementPool.length < this.props.nodeLimit) {
            this.addElementToPool(message)
        }
        else {
            this.recyclePoolElement(message)
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

    // BUG: doesn't take direction into consideration (currently only goes forward)
    private updateElementsPosition(direction: string): void {
        // NOTE: only update the most recently updated items
        // WARN: this function can't be called outside of getData, becauase it assumes it
        // is immediately following items being added to `this.elementsPool`
        this.elementPool.forEach((el, index) => {
            if (direction === "down") {
                if (index >= (this.elementPool.length - 1 - this.requestLimit)) {
                    this.calculateElementPositionDownwards(el, this.elementPool[index - 1])
                }
            }
            else {
                // Need to address elementsPool in reverse... 
                if (index < this.requestLimit) {
                    this.calculateElementPositionUpwards(el, this.elementPool[index + 1])
                }
            }
        })
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
                const firstY = Number((this.elementPool[0] as HTMLElement).getAttribute("data-offset")) || 0
                // const height = el.clientHeight

                el.style.transform = `translateY(${firstY}px)`
            }
        }
    }
}
