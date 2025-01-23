// Types
import { Message } from "../../types/virtualization"
// Helpers
import MessageTemplate from "../dom/createMessageTemplate"
import MockDB from "../mockDB"
import Virtualizationer from "./virtualizationer"

const DB = await new MockDB().initDB()
const root = document.querySelector(".Conversation__VirtualList")

function getTemplate(message: Message): HTMLElement {
    // NOTE: Utilizing .firstElementChild allows the clone node to behave like a native Element
    const template = MessageTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement

    updateTemplate(template, message)

    return template
}

function updateTemplate(template: HTMLElement, message: Message): void {
    const avatarEl = template.querySelector(".Message__avatar")
    const messageEl = template.querySelector(".Message__content")
    const personEl = template.querySelector(".Message__author")

    avatarEl!.textContent = message.offset.toString()
    messageEl!.textContent = message.message
    personEl!.textContent = message.speaker

    template.setAttribute("data-index", message.offset.toString())
}

const _VL = new Virtualizationer(root, {
    getData: DB.getMessages,
    getTemplate,
    nodeLimit: 20,
    updateTemplate,
})

_VL.render()
