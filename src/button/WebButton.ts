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
        return ['disabled', 'type'];
    }

    public set disabled(value: boolean) {
        this.toggleAttribute('disabled', value);
    }

    public get disabled(): boolean {
        return this.hasAttribute('disabled');
    }

    public set type(value: string) {
        this.setAttribute('type', value);
    }

    public get type(): string {
        return this.getAttribute('type') || 'button';
    }

    public connectedCallback(): void {
        this._slot.addEventListener('click', Functions.bindOnce(this.onSlotClick, this));
        this.addEventListener('click', Functions.bindOnce(this.onClick, this));

        this.updateType(this.getAttribute('type'));
        this.updateDisabled(this.getAttribute('disabled'));
    }

    public disconnectedCallback(): void {
        this.removeEventListener('click', Functions.bindOnce(this.onClick, this));
        this._slot.removeEventListener('click', Functions.bindOnce(this.onSlotClick, this));
    }

    public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
        switch (name) {
            case 'disabled':
                this.updateDisabled(newValue);
                break;
            case 'type':
                this.updateType(newValue);
        }
    }

    private updateType(type: string | null) {
        this._button.type = type || 'button';
    }

    private updateDisabled(disabled: string | null): void {
        if (disabled != null) {
            this._button.setAttribute('disabled', disabled || '');
        } else {
            this._button.removeAttribute('disabled');
        }
    }

    private onSlotClick(e: Event) {
        if (DomUtils.isDisabled(this._button)) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    private onClick(e: Event) {
        if (!DomUtils.isDisabled(this._button) && this.hasAttribute('data-action')) {
            const action = this.getAttribute('data-action');
            if (action) {
                const event = new CustomEvent('web:action', {
                    detail: {type: action},
                    cancelable: true,
                    bubbles: true
                });
                if (!this.dispatchEvent(event)) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }
    }

    public static register(): void {
        DomUtils.registerCustomElement(WebButton);
    }
}