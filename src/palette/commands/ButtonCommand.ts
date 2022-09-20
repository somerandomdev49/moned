import { Command, CommandCallback, CommandPaletteInvocation } from "../command";

export default class ButtonCommand implements Command {
    constructor(public callback: CommandCallback) { }

    id() { return this; }

    select(invocation: CommandPaletteInvocation) {
        this.callback(invocation, this);
        return null;
    }
}
