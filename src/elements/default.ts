import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export const DEFAULT_MONACO_EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  codeLens: false,
  contextmenu: false,
  folding: false,
  glyphMargin: false,
  guides: {
    indentation: false,
  },
  hideCursorInOverviewRuler: true,
  hover: {
    enabled: false,
    sticky: true,
  },
  inlayHints: {
    enabled: false,
  },
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  links: false,
  minimap: {
    enabled: false,
  },

  wordWrapColumn: 80,
  occurrencesHighlight: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  parameterHints: {
    enabled: false,
  },
  quickSuggestions: {
    comments: false,
    other: false,
    strings: false,
  },
  lightbulb: {
    enabled: false,
  },
  renderControlCharacters: false,
  renderLineHighlight: "none",
  renderLineHighlightOnlyWhenFocus: false,
  renderWhitespace: "none",
  scrollbar: {
    horizontal: "hidden",
    useShadows: false,
    vertical: "hidden",
  },
  scrollBeyondLastColumn: 0,
  scrollBeyondLastLine: false,
  selectionHighlight: false,

  "semanticHighlighting.enabled": false,
  smartSelect: {
    selectLeadingAndTrailingWhitespace: false,
  },
  suggest: {
    snippetsPreventQuickSuggestions: false,
  },
  wordBasedSuggestions: false,
  wordWrap: "on",
  wrappingStrategy: "simple",
};
