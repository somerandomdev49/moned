import {basicSetup} from "codemirror";
import {EditorView, Panel, showPanel, keymap} from "@codemirror/view";
import {EditorState, Compartment, Facet, Extension} from "@codemirror/state";
import {indentWithTab} from "@codemirror/commands";

import {cpp} from "@codemirror/lang-cpp";
import {javascript} from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python";

import * as fuzzysort from "fuzzysort";
// import { go } from "fuzzysort";
// const fuzzysort = { go };

const languages = {
    "C++": cpp,
    "Javascript": javascript,
    "Python": python
};

const compartments = {
    language: new Compartment,
    indent: new Compartment,
};

enum IndentType { Tabs = "Tabs", Spaces = "Spaces" };

const compartmentDefaults = {
    language: {
        get() { return languages[this.name](); },
        name: "Javascript"
    },
    indent: {
        get() { return EditorState.tabSize.of(this.tab) },
        size: 4,
        type: IndentType.Spaces
    }
}

type OptionCallback = (invocation: CommandPaletteInvocation, from: Command) => any;
type InputOptionCallback<T> = (invocation: CommandPaletteInvocation, from: Command, value: T) => any;

interface CommandPaletteInvocation {
    confirm: boolean;
    cancel: boolean;
    payload: any;
}

type CommandView = (value: string) => CommandViewEntry[];

interface Command {
    select(invocation: CommandPaletteInvocation): CommandView | null;
    id(): any;
    parent?: Command;
}

interface CommandViewEntry {
    command: Command;
    text: string | HTMLElement | null;
}

const listCommandView = (commands: {[name: string]: Command}) => (value: string) => {
    if(value.trim() == '') return Object.entries(commands).map(([text, command]) => ({ command, text }));
    const results = fuzzysort.go(value, Object.entries(commands).map(([name, option]) => ({ name, option })), {
        key: "name"
    });
    return results.map(x => ({ command: x.obj.option, text: x.obj.name }));
};

interface InputCommandOptions<V> {
    conversion?: (value: string) => V,
    text?: (value: V) => string,
    default?: V,
};

const inputCommandView = <V>(callback: (invocation: CommandPaletteInvocation, value: V) => any, options: InputCommandOptions<V>, command: Command) =>
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

class InputCommand<V> implements Command {
    constructor(
        public callback: InputOptionCallback<V>,
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

class ListCommand implements Command {
    constructor(public commands: {[name: string]: Command}) {
        Object.values(commands).forEach(x => x.parent = this);
    }

    id() { return this; }
    select() {
        return listCommandView(this.commands);
    }
}

class ButtonCommand implements Command {
    constructor(public callback: OptionCallback) { }

    id() { return this; }

    select(invocation: CommandPaletteInvocation) {
        this.callback(invocation, this);
        return null;
    }
}

interface CommandPaletteHooks {
    onConfirm?: (payload: any) => void;
    onCancel?: (payload: any) => void;
}

class CommandPalette {
    private rootElement: HTMLDivElement;
    private inputElement: HTMLInputElement;
    private listElement: HTMLDivElement;
    private hooks: WeakMap<Command, CommandPaletteHooks>;

    constructor(public parent: HTMLElement) {
        this.hooks = new WeakMap();
    }

    private _open() {
        this.parent.style.display = "block";
        this.rootElement = this.parent.appendChild(document.createElement("div"));
        this.inputElement = this.rootElement.appendChild(document.createElement("input"));
        this.listElement = this.rootElement.appendChild(document.createElement("div"));
        this.rootElement.classList.add("command-palette");
        this.inputElement.classList.add("command-palette-input");
        this.listElement.classList.add("command-palette-list");
    }

    private close() {
        this.parent.style.display = "none";
        this.rootElement.remove();
        editor.focus();
    }

    private select(command: Command, invocation: CommandPaletteInvocation) {
        const view = command.select(invocation);
        if(view == null) {
            // console.log("view returned null!", invocation);
            let hooks = this.hooks.get(command.id());
            while(hooks === undefined) {
                // console.log("hooks not found for ", command);
                if(!command.parent) { hooks = {}; break; }
                command = command.parent;
                hooks = this.hooks.get(command.id());
            }
            // console.log(command.id(), this.hooks.has(command.id()));
            if(invocation.confirm && hooks.onConfirm) hooks.onConfirm(invocation.payload);
            else if(hooks.onCancel) hooks.onCancel(invocation.payload);
            return this.close();
        }
        const rerender = () => {
            while(this.listElement.firstChild) {
                this.listElement.removeChild(this.listElement.firstChild);
            }
            const entries = view(this.inputElement.value);
            for(const entry of entries) {
                // console.log(entry);
                if(entry == null || entry.text == null) continue;

                const elem = this.listElement.appendChild(document.createElement("span"));
                if(entry.text instanceof HTMLElement) elem.appendChild(entry.text); // WARNING: SAFETY
                else elem.textContent = entry.text;

                elem.onclick = () => {
                    this.inputElement.value = "";
                    this.select(entry.command, invocation);
                };
            }
        };
        this.inputElement.oninput = rerender;
        rerender();
    }

    open(command: Command) {
        // console.log("opening", command, this.hooks.has(command.id()));
        const invocation = {
            confirm: false,
            cancel: false,
            payload: undefined,
        };

        this._open();
        this.select(command, invocation);
    }

    addHooks(command: Command, options: CommandPaletteHooks) {
        // console.log("adding hooks for", command, options);
        this.hooks.set(command.id(), options);
    }
}

const commandPalette = new CommandPalette(document.getElementById("modal")!);

const commandRefs: {
    editor: { tabSize?: Command, language?: Command }
} = { editor: {} }

const commands = 
    new ListCommand({
        "Tab Size": (commandRefs.editor.tabSize = new ListCommand({
            "Tabs": new InputCommand<number>((invocation, _command, size) => {
                invocation.confirm = true;
                invocation.payload = { type: IndentType.Tabs, size };
            }, { text: x => `Tabs: ${x}`, default: 4 }),
            "Spaces": new InputCommand<number>((invocation, _command, size) => {
                invocation.confirm = true;
                invocation.payload = { type: IndentType.Spaces, size };
            }, { text: x => `Spaces: ${x}`, default: 4 })
        })),
        "Language": (commandRefs.editor.language = new ListCommand(
            Object.fromEntries(Object.entries(languages).map(([name, value]) => [
                name, new ButtonCommand((invocation, _command) => {
                    invocation.confirm = true;
                    invocation.payload = { name, language: value };
                })
            ]))
        ))
    });

let state = EditorState.create({
    extensions: [
        ...Object.entries(compartments).map(
            ([key, value]) => value.of(compartmentDefaults[key].get())
        ),
        showPanel.of(createBottomPanel),
        keymap.of([indentWithTab]),
        keymap.of([
            { key: "Mod-Q", run: (target: EditorView) => {
                commandPalette.open(commands);
                return true;
            } }
        ]),
        basicSetup,
    ], 
});

let editor = new EditorView({
    state,
    parent: document.body
});

function createBottomPanel(view: EditorView): Panel {
    const dom = document.createElement("div");
    dom.classList.add("bottom-panel");

    {
        const select = dom.appendChild(document.createElement("span"));
        select.textContent = compartmentDefaults.language.name;

        commandPalette.addHooks(commandRefs.editor.language!, {
            onConfirm(payload: { name: string, language: () => Extension }) {
                select.textContent = payload.name;
                view.dispatch({
                    effects: compartments.language.reconfigure(payload.language())
                });
            }
        })
        select.onclick = () => commandPalette.open(commandRefs.editor.language!);
    }

    {
        const tabSize = dom.appendChild(document.createElement("span"));
        tabSize.textContent = `${compartmentDefaults.indent.type}: ${compartmentDefaults.indent.size}`;

        commandPalette.addHooks(commandRefs.editor.tabSize!, {
            onConfirm(payload: { type: IndentType, size: number }) {
                // console.log(`Setting tab size: ${payload.type} ${payload.size}`);
                tabSize.textContent = `${payload.type} ${payload.size}`;
                view.dispatch({
                    effects: compartments.indent.reconfigure(EditorState.tabSize.of(payload.size))
                });
            }
        });

        tabSize.onclick = () => commandPalette.open(commandRefs.editor.tabSize!);
    }

    return { dom };
}
