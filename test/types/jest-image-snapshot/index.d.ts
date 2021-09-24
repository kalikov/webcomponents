declare module 'jest-image-snapshot' {
    function toMatchImageSnapshot<T>(): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult>;
}