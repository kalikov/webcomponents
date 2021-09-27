import WebButton from "button/WebButton";
import puppeteer, {Browser, Page} from "puppeteer";
import path from "path";
import {toMatchImageSnapshot} from "jest-image-snapshot";

expect.extend({toMatchImageSnapshot});

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

    test("should be in normal state", async () => {
        await page.setContent('<web-button id="element">Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.waitForSelector("#element");
        const screenshot = await button.screenshot({
            type: 'png'
        });
        expect(screenshot).toMatchImageSnapshot();
    });

    test("should be in disabled state", async () => {
        await page.setContent('<web-button id="element" disabled>Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.waitForSelector("#element");
        const screenshot = await button.screenshot({
            type: 'png'
        });
        expect(screenshot).toMatchImageSnapshot();
    });

    test("should be in focused state", async () => {
        await page.setContent('<web-button id="element">Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.waitForSelector("#element");
        await button.focus();
        const screenshot = await button.screenshot({
            type: 'png'
        });
        expect(screenshot).toMatchImageSnapshot();
    });

    test("should be in pressed state", async () => {
        await page.setContent('<web-button id="element">Hello, world!</web-button>')
        await addScripts(page);
        const button = await page.waitForSelector("#element");
        button.click({delay: 10000});
        const screenshot = await button.screenshot({
            type: 'png'
        });
        expect(screenshot).toMatchImageSnapshot();
    });
});

async function addScripts(page: Page) {
    await page.addScriptTag({path: path.resolve(__dirname, '../../build/webcomponents-style-98.js')});
    await page.addScriptTag({path: path.resolve(__dirname, '../../build/webcomponents.js')});
}