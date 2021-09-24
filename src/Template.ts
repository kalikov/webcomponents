export default class Template {
    public static compile(markup: string, stylesheet?: string): Template {
        const template = document.createElement('template');
        if (stylesheet) {
            template.innerHTML = `<style>${stylesheet}</style>${markup}`;
        } else {
            template.innerHTML = markup;
        }
        return new Template(template);
    }

    private readonly _template: HTMLTemplateElement;

    private constructor(template: HTMLTemplateElement) {
        this._template = template;
    }

    public get content(): DocumentFragment {
        return this._template.content;
    }

    public create(): Node {
        return this._template.content.cloneNode(true);
    }
}