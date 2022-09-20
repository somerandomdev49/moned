import { Command, CommandPaletteInvocation, CommandViewEntry } from "../command";

export type InputCommandCallback<T> = (invocation: CommandPaletteInvocation, from: Command, value: T) => any;

export interface InputCommandOptions<V> {
    conversion?: (value: string) => V,
    text?: (value: V) => string,
    default?: V,
};

export const inputCommandView = <V>(callback: (invocation: CommandPaletteInvocation, value: V) => any, options: InputCommandOptions<V>, command: Command) =>
    (value: string): CommandViewEntry[] => [{
        text: value.trim() != ''
            ? (options.text ? options.text(options.conversion ? options.conversion(value) : (value as V)) : value)
            : options.default
            ? (options.text ? options.text(options.default) : options.default as string)
            : '',
        command: new (class implements Command {
            parent = command;
            id() { return command.id(); }
            select(invocation: CommandPaletteInvocation) {
                callback(
                    invocation,
                    value.trim() != '' || !options.default
                        ? options.conversion ? options.conversion(value) : value as V
                        : options.default
                    );
                return null;
            }
        })()
}];

export default class InputCommand<V> implements Command {
    constructor(
        public callback: InputCommandCallback<V>,
        public options: InputCommandOptions<V> = {}
    ) { }

    id() { return this; }

    select() {
        return inputCommandView((invocation: CommandPaletteInvocation, value: V) => {
            console.log("InputCommand callback called: ", value);
            this.callback(invocation, this, value);
        }, this.options, this);
    }
}
