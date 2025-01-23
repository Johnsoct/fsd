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
    const hydratedTemplate = updateTemplate(template, message)

    return hydratedTemplate
}

function updateTemplate(template: HTMLElement, message: Message): HTMLElement {
    const hydratedTemplate = template.cloneNode(true) as HTMLElement
    const avatarEl = hydratedTemplate.querySelector(".Message__avatar")
    const messageEl = hydratedTemplate.querySelector(".Message__content")
    const personEl = hydratedTemplate.querySelector(".Message__author")

    avatarEl!.textContent = message.offset.toString()
    messageEl!.textContent = message.message
    personEl!.textContent = message.speaker

    hydratedTemplate.setAttribute("data-offset", message.offset.toString())

    return hydratedTemplate
}

const _VL = new Virtualizationer(root, {
    getData: DB.getMessages,
    getTemplate,
    nodeLimit: 20,
    updateTemplate,
})

_VL.render()
