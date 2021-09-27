import WebButton from "button/WebButton";
import puppeteer, {Browser, ElementHandle, Page} from "puppeteer";
import path from "path";

describe("WebButton", () => {
    let browser: Browser;
    let page: Page;
    beforeAll(async () => {
        browser = await puppeteer.launch();
    });
    afterAll(async () => {
        await browser.close();
    });
    beforeEach(async () => {
        page = await browser.newPage();
    });
    afterEach(async () => {
        await page.close();
    });

    test("should trigger action on root click", async () => {
        await page.setContent('<web-button id="element" data-action="test">Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.$<HTMLElement>("#element");
        await evaluateAndExpectInnerTextToBe(button, 'test');
    });

    test("should trigger action on button click", async () => {
        await page.setContent('<web-button id="element" data-action="test">Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.$<HTMLElement>("#element");
        const shadowButton = await button.evaluateHandle<ElementHandle<HTMLButtonElement>>(node => node.shadowRoot.getElementById('button'));
        await evaluateAndExpectInnerTextToBe(shadowButton, 'test');
    });

    test("should trigger action on contents click", async () => {
        await page.setContent('<web-button id="element" data-action="test"><span id="span">Hello, world!</span></web-button>')
        await addScripts(page);
        const span = await page.$<HTMLSpanElement>("#span");
        await evaluateAndExpectInnerTextToBe(span, 'test');
    });

    test("should not trigger action on disabled root click", async () => {
        await page.setContent('<web-button id="element" data-action="test" disabled>Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.$<HTMLElement>("#element");
        await evaluateAndExpectInnerTextToBe(button, '');
    });

    test("should not trigger action on disabled button click", async () => {
        await page.setContent('<web-button id="element" data-action="test" disabled>Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.$<HTMLElement>("#element");
        const shadowButton = await button.evaluateHandle<ElementHandle<HTMLButtonElement>>(node => node.shadowRoot.getElementById('button'));
        await evaluateAndExpectInnerTextToBe(shadowButton, '');
    });

    test("should not trigger action on disabled contents click", async () => {
        await page.setContent('<web-button id="element" data-action="test" disabled><span id="span">Hello, world!</span></web-button>')
        await addScripts(page);
        const span = await page.$<HTMLSpanElement>("#span");
        await evaluateAndExpectInnerTextToBe(span, '');
    });

    async function evaluateAndExpectInnerTextToBe(element: ElementHandle<HTMLElement>, text: string) {
        await element.evaluate(it => it.click());
        const catcher = await page.$<HTMLElement>("#catcher");
        expect(await catcher.evaluate(node => node.innerText)).toBe(text);
    }
});

async function addScripts(page: Page) {
    await page.addScriptTag({path: path.resolve(__dirname, '../../build/webcomponents.js')});
    await page.addScriptTag({path: path.resolve(__dirname, './WebActionCatcher.js')});
}