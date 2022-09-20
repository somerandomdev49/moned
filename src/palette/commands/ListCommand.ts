import * as fuzzysort from "fuzzysort";
import { Command } from "../command";

export const listCommandView = (commands: {[name: string]: Command}) => (value: string) => {
    if(value.trim() == '') return Object.entries(commands).map(([text, command]) => ({ command, text }));
    const results = fuzzysort.go(value, Object.entries(commands).map(([name, option]) => ({ name, option })), {
        key: "name"
    });
    return results.map(x => ({ command: x.obj.option, text: x.obj.name }));
};


export default class ListCommand implements Command {
    constructor(public commands: {[name: string]: Command}) {
        Object.values(commands).forEach(x => x.parent = this);
    }

    id() { return this; }
    select() {
        return listCommandView(this.commands);
    }
}
