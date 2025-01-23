type GetDataFn = (limit?: number, page?: number) => Promise<Message[] | []>;
type GetTemplateFn = (message: Message) => HTMLElement;
type UpdateTemplateFn = (template: HTMLElement, message: Message) => void;

export interface Message {
    message: string;
    offset: number;
    speaker: string;
}

export interface VirtualizationProps {
    getData: GetDataFn;
    getTemplate: GetTemplateFn;
    nodeLimit: number;
    updateTemplate: UpdateTemplateFn;
}

