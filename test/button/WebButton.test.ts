import WebButton from "button/WebButton";
import puppeteer from "puppeteer";
import path from "path";
import { toMatchImageSnapshot } from "jest-image-snapshot";

expect.extend({ toMatchImageSnapshot });

describe("WebButton", () => {
    it("should be rendered", async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent('<web-button id="element">Hello, world!</web-button>')
        await page.addScriptTag({path: path.resolve(__dirname, '../../build/webcomponents-style-98.js')});
        await page.addScriptTag({path: path.resolve(__dirname, '../../build/webcomponents.js')});
        const button = await page.waitForSelector("#element");
        const screenshot = await button.screenshot({
            type: 'png'
        });
        await page.close();
        await browser.close();

        expect(screenshot).toMatchImageSnapshot()
    });
});