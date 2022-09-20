import Theme from "../Theme";

const chalky = "#e5c07b",
      coral = "#e06c75",
      cyan = "#56b6c2",
      invalid = "#ffffff",
      ivory = "#abb2bf",
      stone = "#7d8799", // Brightened compared to original to increase contrast
      malibu = "#61afef",
      sage = "#98c379",
      whiskey = "#d19a66",
      violet = "#c678dd",
      darkBackground = "#21252b",
      highlightBackground = "#2c313a",
      background = "#282c34",
      tooltipBackground = "#353a42",
      selection = "#3E4451",
      cursor = "#528bff";

/// The editor theme styles for One Dark.
const oneDarkTheme: Theme = {
    dark: true,
    editor: {
        foregroundColor: ivory,
        backgroundColor: background,
        caretColor: cursor,
        itemHighlightColor: selection,
        borderColor: selection
    },
    syntax: {
        keyword: { color: violet},
        name: { color: coral },
        deleted: { color: coral },
        character: { color: coral },
        propertyName: { color: coral },
        macroName: { color: coral },
        // .function(t.variableName), t.labelName],color: malibu},
        // .color, t.constant(t.name), t.standard(t.name)],color: whiskey},
        // .definition(t.name), t.separator],color: ivory},
        typeName: { color: chalky },
        className: { color: chalky },
        number: { color: chalky },
        changed: { color: chalky },
        annotation: { color: chalky },
        modifier: { color: chalky },
        self: { color: chalky },
        namespace: { color: chalky },
        operator: { color: cyan },
        operatorKeyword: { color: cyan },
        url: { color: cyan },
        escape: { color: cyan },
        regexp: { color: cyan },
        link: { color: cyan },
        meta: { color: stone},
        comment: { color: stone},
        strong: { fontWeight: "bold" },
        emphasis: { fontStyle: "italic" },
        strikethrough: { textDecoration: "line-through" },
        heading: { fontWeight: "bold", color: coral },
        atom: { color: whiskey },
        bool: { color: whiskey },
        processingInstruction: { color: sage },
        string: { color: sage },
        inserted: { color: sage },
        invalid: { color: invalid },
    }

// ".cm-panels": {backgroundColor: darkBackground, color: ivory},
// ".cm-panels.cm-panels-top": {borderBottom: "2px solid black"},
// ".cm-panels.cm-panels-bottom": {borderTop: "2px solid black"},

// ".cm-searchMatch": {
//   backgroundColor: "#72a1ff59",
//   outline: "1px solid #457dff"
// },
// ".cm-searchMatch.cm-searchMatch-selected": {
//   backgroundColor: "#6199ff2f"
// },

// ".cm-activeLine": {backgroundColor: "#6699ff0b"},
// ".cm-selectionMatch": {backgroundColor: "#aafe661a"},

// "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
//   backgroundColor: "#bad0f847",
//   outline: "1px solid #515a6b"
// },

// ".cm-gutters": {
//   backgroundColor: background,
//   color: stone,
//   border: "none"
// },

// ".cm-activeLineGutter": {
//   backgroundColor: highlightBackground
// },

// ".cm-foldPlaceholder": {
//   backgroundColor: "transparent",
//   border: "none",
//   color: "#ddd"
// },

// ".cm-tooltip": {
//   border: "none",
//   backgroundColor: tooltipBackground
// },
// ".cm-tooltip .cm-tooltip-arrow:before": {
//   borderTopColor: "transparent",
//   borderBottomColor: "transparent"
// },
// ".cm-tooltip .cm-tooltip-arrow:after": {
//   borderTopColor: tooltipBackground,
//   borderBottomColor: tooltipBackground
// },
// ".cm-tooltip-autocomplete": {
//   "& > ul > li[aria-selected]": {
//     backgroundColor: highlightBackground,
//     color: ivory
//   }
// }
};

export default oneDarkTheme;