export type CommandCallback = (invocation: CommandPaletteInvocation, from: Command) => any;

export interface CommandPaletteInvocation {
    confirm: boolean;
    cancel: boolean;
    payload: any;
}

export type CommandView = (value: string) => CommandViewEntry[];

export interface Command {
    select(invocation: CommandPaletteInvocation): CommandView | null;
    id(): any;
    parent?: Command;
}

export interface CommandViewEntry {
    command: Command;
    text: string | HTMLElement | null;
}
