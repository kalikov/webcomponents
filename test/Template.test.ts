import Template from "Template";

describe("Template", () => {
    test("should be created from markup", () => {
        const template = Template.compile("foobar");
        const element = document.createElement('div');
        element.appendChild(template.create())
        expect(element.innerHTML).toBe("foobar")
    });

    test("should be created from markup and style", () => {
        const template = Template.compile("foobar", ".class {}");
        const element = document.createElement('div');
        element.appendChild(template.create())
        expect(element.innerHTML).toBe("<style>.class {}</style>foobar")
    });
});