class DomUtils {
    private static cache = new Map<string, Function[]>();

    public static getCustomElementById<T extends HTMLElement>(parent: NonElementParentNode, id: string, constructor: new() => T): T {
        let element = parent.getElementById(id)!;
        if (!(element instanceof constructor)) {
            window.customElements.upgrade(element);
        }
        return <T>element;
    }

    public static registerCustomElement<T extends HTMLElement>(element: { tagName: string, new(): T }): void {
        window.customElements.define(element.tagName, element);
    }

    public static toCustomElement<T extends HTMLElement>(node: Node, constructor: new() => T): T {
        if (!(node instanceof constructor)) {
            window.customElements.upgrade(node);
        }
        return <T>node;
    }

    public static querySelector<K extends keyof HTMLElementTagNameMap>(node: Node, selectors: K): HTMLElementTagNameMap[K] | null;
    public static querySelector<K extends keyof SVGElementTagNameMap>(node: Node, selectors: K): SVGElementTagNameMap[K] | null;
    public static querySelector<E extends Element = Element>(node: Node, selectors: string): E | null;
    public static querySelector(node: Node, selectors: string): Element | null {
        if (node instanceof Element || node instanceof DocumentFragment) {
            return node.querySelector(selectors);
        }
        let child: ChildNode | null = node.firstChild;
        while (child) {
            if (child instanceof Element) {
                let element = child.querySelector(selectors);
                if (element != null) {
                    return element;
                }
            }
            child = child.nextSibling;
        }
        return null;
    }

    public static loadScript(filename: string, callback: () => void) {
        if (DomUtils.cache.has(filename)) {
            let callbacks = DomUtils.cache.get(filename);
            if (callbacks && callbacks.length > 0) {
                callbacks.push(callback);
            } else {
                callback();
            }
            return;
        }
        let callbacks: Function[] = [callback];
        DomUtils.cache.set(filename, callbacks);

        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = filename;
        script.async = true;
        script.onload = function () {
            callbacks.forEach(value => value());
            callbacks.length = 0;
        };

        document.body.appendChild(script);
    }

    public static loadStylesheet(filename: string) {
        let head = document.getElementsByTagName('head')[0];

        let style = document.createElement('link');
        style.href = filename;
        style.type = 'text/css';
        style.rel = 'stylesheet';
        head.appendChild(style);
    }

    public static getParentNode(node: Node): NonElementParentNode | null {
        let parent = node.parentNode;
        while (parent) {
            if (parent instanceof Document || parent instanceof DocumentFragment || parent instanceof ShadowRoot) {
                return parent;
            }
            parent = parent.parentNode;
        }
        return null;
    }

    public static removeChildren(node: Node, predicate?: (node: Node) => boolean): void {
        let child;
        if (!predicate) {
            while (!!(child = node.lastChild)) {
                node.removeChild(child);
            }
        } else {
            let previous: Node | null = null;
            while (!!(child = (previous ? previous.previousSibling : node.lastChild))) {
                if (predicate(child)) {
                    node.removeChild(child);
                } else {
                    previous = child;
                }
            }
        }
    }

    public static forEachElement(parent: ParentNode, consumer: (element: Element) => void): void {
        let element = parent.firstElementChild;
        while (element) {
            consumer(element);
            element = element.nextElementSibling;
        }
    }

    public static traverseUpUntil(element: Element, test: (item: Element) => boolean, consumer?: (item: Element) => void): Element | null {
        let it: Element | null = element;
        while (it) {
            if (consumer) {
                consumer(it);
            }
            if (test(it)) {
                break;
            }
            if (it.assignedSlot) {
                it = it.assignedSlot;
            } else if (it.parentElement) {
                it = it.parentElement;
            } else if (it.parentNode instanceof ShadowRoot) {
                it = it.parentNode.host;
            } else {
                it = null;
            }
        }
        return it;
    }

    public static setInnerText(nodes: Iterable<Element>, text: string): void {
        for (const node of nodes) {
            if (node instanceof HTMLElement) {
                node.innerText = text;
            }
        }
    }

    public static setAttribute(element: Element, attribute: string, value: string | null) {
        if (value != null) {
            element.setAttribute(attribute, value);
        } else {
            element.removeAttribute(attribute);
        }
    }

    public static reflow(node: Element): void {
        node.clientHeight;
    }

    public static focus(element: HTMLElement) {
        if (DomUtils.isFocusable(element)) {
            element.focus();
            return;
        }
        const focusable = DomUtils.queryShadowRoot(element, it => DomUtils.isFocusable(it) ? true : null);
        if (focusable) {
            focusable.focus();
        } else {
            element.focus();
        }
    }

    public static shake(elements: HTMLElement[]): void {
        for (const element of elements) {
            element.classList.add('shake')
        }
        window.setTimeout(() => {
            for (const element of elements) {
                element.classList.remove('shake');
            }
        }, 1000);
    }

    public static getActiveElement(): Element | null {
        let element = document.activeElement;
        while (element != null && element.shadowRoot != null && element.shadowRoot.activeElement != null) {
            element = element.shadowRoot.activeElement;
        }
        return element;
    }

    public static firstInstance<T extends HTMLElement>(elements: Element[], constructor: { prototype: T; new(): T }): T | null {
        for (const element of elements) {
            if (element instanceof constructor) {
                return element;
            }
        }
        return null;
    }

    public static isDescendant(parent: Node, child: Node): boolean {
        let node = child.parentNode;
        while (node != null) {
            if (node == parent) {
                return true;
            }
            if (node.parentNode) {
                node = node.parentNode;
            } else if (node instanceof ShadowRoot) {
                node = node.host;
            } else {
                node = null;
            }
        }
        return false;
    }

    public static getChild(parent: Node, descedant: Node): Node | undefined {
        if (descedant == parent) {
            return undefined;
        }
        let prevNode = descedant;
        let node = descedant.parentNode;
        while (node != null && node != parent) {
            prevNode = node;
            node = node.parentNode;
        }
        return prevNode;
    }

    public static getIndex(parent: ParentNode, child: Element) {
        return [...parent.children].indexOf(child);
    }

    public static isHidden(element: HTMLElement): boolean {
        return element.hasAttribute("hidden")
            || (element.hasAttribute("aria-hidden") && element.getAttribute("aria-hidden") !== "false")

            // A quick and dirty way to check whether the element is hidden.
            // For a more fine-grained check we could use "window.getComputedStyle" but we don't because of bad performance.
            // If the element has visibility set to "hidden" or "collapse", display set to "none" or opacity set to "0" through CSS
            // we won't be able to catch it here. We accept it due to the huge performance benefits.
            || element.style.display === `none`
            || element.style.opacity === `0`
            || element.style.visibility === `hidden`
            || element.style.visibility === `collapse`;

        // If offsetParent is null we can assume that the element is hidden
        // https://stackoverflow.com/questions/306305/what-would-make-offsetparent-null
        //|| $elem.offsetParent == null;
    }

    public static isDisabled(element: Element): boolean {
        return element.hasAttribute("disabled")
            || (element.hasAttribute("aria-disabled") && element.getAttribute("aria-disabled") !== "false");
    }

    /**
     * Read more here: https://stackoverflow.com/questions/1599660/which-html-elements-can-receive-focus/1600194#1600194
     * Or here: https://stackoverflow.com/questions/18261595/how-to-check-if-a-dom-element-is-focusable
     */
    public static isFocusable(element: HTMLElement): boolean {
        // Discard elements that are removed from the tab order.
        if (element.getAttribute("tabindex") === "-1" || DomUtils.isHidden(element) || DomUtils.isDisabled(element)) {
            return false;
        }

        // At this point we know that the element can have focus (eg. won't be -1) if the tabindex attribute exists
        return element.hasAttribute("tabindex")
            || DomUtils.isAnchorElement(element)
            || DomUtils.isInputElement(element)
            || element instanceof HTMLIFrameElement;
    }

    private static isAnchorElement(element: HTMLElement): boolean {
        return (element instanceof HTMLAnchorElement || element instanceof HTMLAreaElement) && element.hasAttribute("href");
    }

    private static isInputElement(element: HTMLElement): boolean {
        return element instanceof HTMLButtonElement
            || element instanceof HTMLInputElement
            || element instanceof HTMLTextAreaElement
            || element instanceof HTMLSelectElement;
    }

    public static queryShadowRoot(root: ShadowRoot | HTMLElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number = 20): HTMLElement | null {
        if (root instanceof HTMLSlotElement) {
            return DomUtils.traverseSlot(root, filter, maxDepth, 0);
        }
        if (root instanceof HTMLElement && root.shadowRoot) {
            return DomUtils.traverseShadowRoot(root.shadowRoot, filter, maxDepth, 0);
        }
        return DomUtils.traverseShadowRoot(root, filter, maxDepth, 0);
    }

    private static traverseShadowRoot(root: ShadowRoot | HTMLElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number, depth: number): HTMLElement | null {
        if (depth >= maxDepth) {
            return null;
        }

        // Go through each child and continue the traversing if necessary
        // Even though the typing says that children can't be undefined, Edge 15 sometimes gives an undefined value.
        // Therefore we fallback to an empty array if it is undefined.
        const children = <HTMLElement[]>Array.from(root.children || []);
        for (const child of children) {
            const test = filter(child);
            if (test === false) {
                continue;
            }
            if (test === true) {
                return child;
            }

            let element;
            if (child.shadowRoot != null) {
                element = DomUtils.traverseShadowRoot(child.shadowRoot, filter, maxDepth, depth + 1);
            } else if (child.tagName === "SLOT") {
                element = DomUtils.traverseSlot(<HTMLSlotElement>child, filter, maxDepth, depth);
            } else {
                element = DomUtils.traverseShadowRoot(child, filter, maxDepth, depth + 1);
            }
            if (element) {
                return element;
            }
        }
        return null;
    }

    private static traverseSlot(slot: HTMLSlotElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number, depth: number): HTMLElement | null {
        // Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        const assignedNodes = slot.assignedNodes().filter(node => node.nodeType === Node.ELEMENT_NODE);
        if (assignedNodes.length > 0) {
            const nodeParent = assignedNodes[0].parentElement!;
            const element = DomUtils.traverseShadowRoot(nodeParent, filter, maxDepth, depth + 1);
            if (element) {
                return element;
            }
        }
        return null;
    };

    public static queryShadowRootAll(root: ShadowRoot | HTMLElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number = 20): HTMLElement[] {
        if (root instanceof HTMLSlotElement) {
            return DomUtils.traverseSlotAll(root, filter, maxDepth, 0);
        }
        if (root instanceof HTMLElement && root.shadowRoot) {
            return DomUtils.traverseShadowRootAll(root.shadowRoot, filter, maxDepth, 0);
        }
        return DomUtils.traverseShadowRootAll(root, filter, maxDepth, 0);
    }

    private static traverseShadowRootAll(root: ShadowRoot | HTMLElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number, depth: number): HTMLElement[] {
        const matches: HTMLElement[] = [];
        if (depth >= maxDepth) {
            return matches;
        }

        // Go through each child and continue the traversing if necessary
        // Even though the typing says that children can't be undefined, Edge 15 sometimes gives an undefined value.
        // Therefore we fallback to an empty array if it is undefined.
        const children = <HTMLElement[]>Array.from(root.children || []);
        for (const child of children) {
            const test = filter(child);
            if (test === false) {
                continue;
            }
            if (test === true) {
                matches.push(child);
            }

            if (child.shadowRoot != null) {
                matches.push(...DomUtils.traverseShadowRootAll(child.shadowRoot, filter, maxDepth, depth + 1));
            } else if (child.tagName === "SLOT") {
                matches.push(...DomUtils.traverseSlotAll(<HTMLSlotElement>child, filter, maxDepth, depth));
            } else {
                matches.push(...DomUtils.traverseShadowRootAll(child, filter, maxDepth, depth + 1));
            }
        }
        return matches;
    }

    private static traverseSlotAll(slot: HTMLSlotElement, filter: ((element: HTMLElement) => boolean | null), maxDepth: number, depth: number): HTMLElement[] {
        // Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        const assignedNodes = slot.assignedNodes().filter(node => node.nodeType === Node.ELEMENT_NODE);
        if (assignedNodes.length > 0) {
            const nodeParent = assignedNodes[0].parentElement!;
            return DomUtils.traverseShadowRootAll(nodeParent, filter, maxDepth, depth + 1);
        }
        return [];
    };

    public static cloneElement(fragment: DocumentFragment, deep = true): Element {
        return <Element>fragment.firstElementChild!.cloneNode(deep);
    }
}

export default DomUtils