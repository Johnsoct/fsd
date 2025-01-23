// Types
import {
    Message,
    VirtualizationProps
} from "../../types/virtualization"

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
        this.getData(this.requestLimit, this._page)
    }

    private createNode(message: Message): HTMLElement {
        // Create a new element with message
        return this.props.getTemplate(message)
    }

    private forwardCallback() {
        this._page++
        this.getData(this.requestLimit, this._page)
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

    private async getData(limit = this.requestLimit, page: number): Promise<void> {
        return this.props.getData(limit, page).then((messages: Message[]) => {
            const fragment = new DocumentFragment()
            const listContainer = this.getVirtualListContainer()

            messages.forEach((message) => {
                this.updateData(message)
                this.updateElementPool(message)

            })
            console.dir("Data:", this.data)
            // console.dir("Element pool:", this.elementPool)

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

    private intersectionCallback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
        entries.forEach((entry) => {
            console.log("Intersection", entry)

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

    private updateData(message: Message) {
        // TODO: Use IndexedDB to store data without duplicates and in order
        this.data.set(message.offset, message)
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
