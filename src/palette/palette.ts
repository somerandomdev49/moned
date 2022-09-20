import { EditorView } from "codemirror";
import { Command, CommandPaletteInvocation } from "./command";

export interface CommandPaletteHooks {
    onConfirm?: (payload: any) => void;
    onCancel?: (payload: any) => void;
}

export default class CommandPalette {
    private rootElement: HTMLDivElement;
    private inputElement: HTMLInputElement;
    private listElement: HTMLDivElement;
    private closeElement: HTMLDivElement;
    private hooks: WeakMap<Command, CommandPaletteHooks>;

    constructor(public parent: HTMLElement, public editor: () => EditorView) {
        this.hooks = new WeakMap();
    }

    private _open() {
        this.parent.style.display = "block";
        this.closeElement = this.parent.appendChild(document.createElement("div"));
        this.rootElement = this.parent.appendChild(document.createElement("div"));
        this.inputElement = this.rootElement.appendChild(document.createElement("input"));
        this.listElement = this.rootElement.appendChild(document.createElement("div"));
        this.rootElement.classList.add("command-palette");
        this.inputElement.classList.add("command-palette-input");
        this.listElement.classList.add("command-palette-list");
        this.closeElement.classList.add("command-palette-close");
        this.closeElement.onclick = () => {
            this.close();
        };
    }

    private close() {
        this.parent.style.display = "none";
        this.rootElement.remove();
        this.closeElement.remove();
        this.editor().focus();
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
