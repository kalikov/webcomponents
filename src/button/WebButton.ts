import WebControl from "WebControl";
import Template from "Template";
import DomUtils from "DomUtils";
import Functions from "Functions";

export default class WebButton extends WebControl implements ConnectionAware, AttributeChangeAware {
    public static readonly tagName = 'web-button';

    private readonly _button: HTMLButtonElement;
    private readonly _slot: HTMLSlotElement;

    constructor() {
        super(Template.compile(require("button/markup").default, WebControl.resolveStyle("button")));

        this._button = <HTMLButtonElement>this._root.getElementById('button');
        this._slot = <HTMLSlotElement>this._root.getElementById('slot');
    }

    static get observedAttributes() {
        return ['disabled', 'skeleton', 'type'];
    }

    public set disabled(value: boolean) {
        this.toggleAttribute('disabled', value);
    }

    public get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    public set skeleton(value: boolean) {
        this.toggleAttribute('skeleton', value);
    }

    public get skeleton(): boolean {
        return this.hasAttribute('skeleton');
    }

    public set type(value: string) {
        this.setAttribute('type', value);
    }

    public get type(): string {
        return this.getAttribute('type') || 'button';
    }

    public connectedCallback(): void {
        this._slot.addEventListener('click', Functions.bindOnce(this.onSlotClick, this));

        this.updateType(this.getAttribute('type'));
        this.updateDisabled(this.getAttribute('disabled'), this.hasAttribute('skeleton'));
    }

    public disconnectedCallback(): void {
        this._slot.removeEventListener('click', Functions.bindOnce(this.onSlotClick, this));
    }

    public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        switch (name) {
            case 'disabled':
                this.updateDisabled(newValue, this.hasAttribute('skeleton'));
                break;
            case 'skeleton':
                this.updateDisabled(this.getAttribute('disabled'), newValue != null);
                break;
            case 'type':
                this.updateType(newValue);
        }
    }

    private updateType(type: string | null) {
        this._button.type = type || 'button';
    }

    private updateDisabled(disabled: string | null, skeleton: boolean): void {
        if (disabled != null || skeleton) {
            this._button.setAttribute('disabled', disabled || '');
        } else {
            this._button.removeAttribute('disabled');
        }
    }

    private onSlotClick(e: Event) {
        if (DomUtils.isDisabled(this._button) || this.classList.contains('skeleton')) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    public static register(): void {
        DomUtils.registerCustomElement(WebButton);
    }
}