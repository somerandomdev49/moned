import {basicSetup} from "codemirror";
import {EditorView, Panel, showPanel, keymap} from "@codemirror/view";
import {EditorState, Compartment, Facet, Extension} from "@codemirror/state";
import {indentWithTab} from "@codemirror/commands";

import {cpp} from "@codemirror/lang-cpp";
import {javascript} from "@codemirror/lang-javascript";
import {python} from "@codemirror/lang-python";

import CommandPalette from "./palette/palette";
import { Command } from "./palette/command";
import InputCommand from "./palette/commands/InputCommand";
import ButtonCommand from "./palette/commands/ButtonCommand";
import ListCommand from "./palette/commands/ListCommand";
import Theme, { applyTheme, convertTheme, themeToHighlightStyle } from "./styling/Theme";
import { syntaxHighlighting } from "@codemirror/language";

import oneDarkTheme from "./styling/themes/one-dark";

const languages = {
    "C++": cpp,
    "Javascript": javascript,
    "Python": python
};

const compartments = Object.fromEntries(["language", "indent", "theme", "_syntax"].map(x => [x, new Compartment]));

enum IndentType { Tabs = "Tabs", Spaces = "Spaces" };

const defaultTheme: Theme = {
    dark: false,
    editor: {
        backgroundColor: "#f5f5f5",
        foregroundColor: "black",
        borderColor: "#ddd",
        itemHighlightColor: "rgba(0, 0, 0, 0.1)",
        caretColor: "black",
    },
    syntax: {}
};

const themes: { [key: string]: Theme } = {
    "Default Light": defaultTheme,
    "One Dark": oneDarkTheme
};

const compartmentDefaults = {
    language: {
        get() { return languages[this.name](); },
        name: "Javascript"
    },
    indent: {
        get() { return EditorState.tabSize.of(this.tab); },
        size: 4,
        type: IndentType.Spaces
    },
    theme: {
        get() { return convertTheme(themes[this.theme]); },
        theme: "Default Light"
    },
    _syntax: {
        get() {
            return syntaxHighlighting(themeToHighlightStyle(themes[compartmentDefaults.theme.theme]));
        }
    }
}

applyTheme(themes[compartmentDefaults.theme.theme]);

const commandRefs: {
    editor: { tabSize?: Command, language?: Command, theme?: Command }
} = { editor: {} }

const htmlFromStringUNSAFE = (html: string) => {
    const elem = document.createElement('template');
    elem.outerHTML = html;
    return elem;
};

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
        )),
        "Theme": (commandRefs.editor.theme = new ListCommand(
            Object.fromEntries(Object.entries(themes).map(([name, _theme]) => [
                name, new ButtonCommand((invocation, _command) => {
                    invocation.confirm = true;
                    invocation.payload = name;
                })
            ]))
        ))
    });

const commandPalette = new CommandPalette(
    document.getElementById("modal")!,
    () => editor
);

let state = EditorState.create({
    extensions: [
        ...Object.entries(compartments).map(
            ([key, value]) => value.of(compartmentDefaults[key].get())
        ),
        showPanel.of(createBottomPanel),
        keymap.of([indentWithTab]),
        keymap.of([
            { key: "Mod-Q", run: (_target: EditorView) => {
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
        const button = dom.appendChild(document.createElement("span"));
        button.textContent = "☰";
        button.onclick = () => commandPalette.open(commands);
    }

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
        }); 
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

    {
        const theme = dom.appendChild(document.createElement("span"));
        theme.textContent = compartmentDefaults.theme.theme;

        commandPalette.addHooks(commandRefs.editor.theme!, {
            onConfirm(payload: string) {
                theme.textContent = payload;
                console.log("applying theme: ", payload, themes[payload]);
                applyTheme(themes[payload]);
                view.dispatch({
                    effects: compartments.theme.reconfigure(convertTheme(themes[payload])),
                });
                view.dispatch({
                    effects: compartments._syntax.reconfigure(syntaxHighlighting(themeToHighlightStyle(themes[payload])))
                });
            }
        });

        theme.onclick = () => commandPalette.open(commandRefs.editor.theme!);
    }

    return { dom };
}
