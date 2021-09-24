import button from "button/style";

const mapping = new Map();
mapping.set("button", button);

export default {
    resolve: function (name) {
        return mapping.get(name);
    }
}