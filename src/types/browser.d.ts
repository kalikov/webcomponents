interface ConnectionAware {
    connectedCallback(): void;

    disconnectedCallback(): void;
}

interface AttributeChangeAware {
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
}