import { EditorView } from "codemirror";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export type Color = string;
export type TagStyle = { color?: Color, fontStyle?: string, fontWeight?: string, textDecoration?: string };

export default interface Theme {
    dark?: boolean,
    editor: {
        backgroundColor?: Color,
        foregroundColor?: Color,
        borderColor?: Color,
        itemHighlightColor?: Color,
        caretColor?: Color,
    }
    syntax: {
        comment?: TagStyle
        lineComment?: TagStyle,
        blockComment?: TagStyle,
        docComment?: TagStyle,
        name?: TagStyle,
        variableName?: TagStyle
        typeName?: TagStyle,
        tagName?: TagStyle,
        propertyName?: TagStyle,
        attributeName?: TagStyle,
        className?: TagStyle
        labelName?: TagStyle,
        namespace?: TagStyle,
        macroName?: TagStyle
        literal?: TagStyle,
        string?: TagStyle,
        docString?: TagStyle,
        character?: TagStyle,
        attributeValue?: TagStyle,
        number?: TagStyle,
        integer?: TagStyle,
        float?: TagStyle,
        bool?: TagStyle,
        regexp?: TagStyle
        escape?: TagStyle,
        url?: TagStyle,
        keyword?: TagStyle,
        self?: TagStyle
        null?: TagStyle
        atom?: TagStyle,
        unit?: TagStyle,
        modifier?: TagStyle,
        operatorKeyword?: TagStyle,
        controlKeyword?: TagStyle,
        definitionKeyword?: TagStyle,
        moduleKeyword?: TagStyle,
        operator?: TagStyle,
        derefOperator?: TagStyle,
        arithmeticOperator?: TagStyle,
        logicOperator?: TagStyle
        bitwiseOperator?: TagStyle
        compareOperator?: TagStyle
        updateOperator?: TagStyle
        definitionOperator?: TagStyle
        typeOperator?: TagStyle
        controlOperator?: TagStyle
        punctuation?: TagStyle
        separator?: TagStyle
        bracket?: TagStyle
        angleBracket?: TagStyle,
        squareBracket?: TagStyle
        paren?: TagStyle
        brace?: TagStyle
        content?: TagStyle
        heading?: TagStyle
        heading1?: TagStyle,
        heading2?: TagStyle,
        heading3?: TagStyle,
        heading4?: TagStyle,
        heading5?: TagStyle,
        heading6?: TagStyle,
        contentSeparator?: TagStyle,
        list?: TagStyle,
        quote?: TagStyle,
        emphasis?: TagStyle,
        strong?: TagStyle,
        link?: TagStyle,
        monospace?: TagStyle,
        strikethrough?: TagStyle,
        inserted?: TagStyle
        deleted?: TagStyle
        changed?: TagStyle
        invalid?: TagStyle,
        meta?: TagStyle
        documentMeta?: TagStyle
        annotation?: TagStyle
        processingInstruction?: TagStyle
    }
}

function camelCaseToSnakeCase(value: string, separator: string = "_") {
    return value.replace(/[A-Z]/g, m => separator + m.toLowerCase());
}

export function themeToHighlightStyle(theme: Theme) {
    return HighlightStyle.define(Object.entries(theme.syntax).map(([key, value]) => ({
        tag: tags[key], ...value
    })));
}

export function applyTheme(theme: Theme) {
    Object.entries(theme.editor).map(([key, value]) => {
        const name = '--theme-editor-' + camelCaseToSnakeCase(key, '-');
        console.log("setting property: ", name, value);
        document.body.style.setProperty(name, value);
    });
}

export function convertTheme(theme: Theme) {
    const themeMap = {
        "&": {
            backgroundColor: "backgroundColor",
            foregroundColor: "color",
            borderColor: "borderColor",
        },
        "&.cm-content": {
            caretColor: "caretColor"
        },
        "&.cm-focused .cm-cursor": {
            caretColor: "borderLeftColor"
        },
        "&.cm-focused .cm-selectionBackground, ::selection": {
            itemHighlightColor: "backgroundColor",
        },
        "&.cm-panels": {
            backgroundColor: "backgroundColor"
        }

    };

    const mapEntries = <T, U>(o: object, f: ([string, T]) => [string, U]) => Object.fromEntries(Object.entries(o).map(f));

    return EditorView.theme(mapEntries(themeMap, ([name, map]) => [
        name,
        mapEntries(map, ([key, value]) => [
            themeMap[key], value
        ])
    ]), { dark: theme.dark ?? false });
}
