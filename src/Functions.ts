export default class Functions {
    private static readonly boundsKey = '__appBounds';

    public static bindOnce<T extends CallableFunction>(callback: T, thisArg: ThisParameterType<T> & object): any/*OmitThisParameter<T>*/ {
        let bound = null;
        if (Functions.boundsKey in thisArg) {
            bound = (<any>thisArg)[Functions.boundsKey].get(callback);
        } else {
            (<any>thisArg)[Functions.boundsKey] = new Map();
        }
        if (!bound) {
            bound = callback.bind(thisArg);
            (<any>thisArg)[Functions.boundsKey].set(callback, bound);
        }
        return bound;
    }
}