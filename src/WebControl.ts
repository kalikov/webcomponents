import Template from "Template";

export default abstract class WebControl extends HTMLElement {
    protected readonly _root: ShadowRoot;

    private readonly _hideCallbacks: (() => void)[] = [];

    constructor(template: Template, init?: { delegatesFocus: boolean }) {
        super();
        const shadowRootInit: ShadowRootInit = {mode: 'open'};
        if (init) {
            Object.assign(shadowRootInit, init);
        }
        this._root = this.attachShadow(shadowRootInit);
        this._root.appendChild(template.create());
    }

    protected static resolveStyle(name: string): string | undefined {
        if (!__webcomponents_style__) {
            console.warn(`WebComponents style is not imported while resolving "${name}"`)
            return undefined;
        }
        return __webcomponents_style__.resolve(name)
    }

    // protected subscribe(state: State, callback: () => void): PageSubscription {
    //     state.subscribe(callback);
    //     const subscription = () => state.unsubscribe(callback);
    //     this._hideCallbacks.push(subscription);
    //     return subscription;
    // }
    //
    // protected unsubscribe(subscription: PageSubscription) {
    //     const index = this._hideCallbacks.indexOf(subscription);
    //     if (index >= 0) {
    //         subscription();
    //         this._hideCallbacks.splice(index, 1);
    //     }
    // }
    //
    // protected unsubscribeAll(): void {
    //     let callback = this._hideCallbacks.pop();
    //     while (callback) {
    //         callback();
    //         callback = this._hideCallbacks.pop();
    //     }
    // }
}