import React, { useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import { useXarrow } from "react-xarrows";

import { DEFAULT_MONACO_EDITOR_OPTIONS } from "./default";

import "./Editor.css";
import {
  DEFAULT_EDITOR_FONT_FAMILY,
  DEFAULT_EDITOR_FONT_SIZE,
  DEFAULT_EDITOR_LANGUAGE,
  DEFAULT_EDITOR_LAST_CHANGE_TIMEOUT,
  DEFAULT_EDITOR_LINE_HEIGHT,
  DEFAULT_EDITOR_LINE_NUMBERS,
  DEFAULT_EDITOR_MAX_WIDTH,
  DEFAULT_EDITOR_MIN_SELECTION,
  DEFAULT_EDITOR_TAB_SIZE,
} from "../constants";

interface EditorProps {
  canvasSize: Size;
  centerPos: Coordinates;
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  handleChangeCursorPosition: (lineNumber: number, column: number) => void;
  handleExplainEditor: (editorId: number, source: string, language: string) => Promise<void>;
  handleExplainSelection: (
    editorId: number,
    source: string,
    language: string,
    selection: string,
    range: monaco.Range,
    onDelete: () => void
  ) => Promise<void>;
  handleHoverRange: (range?: monaco.Range) => void;
  handleOnMouseLeave?: () => void;
  highlight?: boolean;
  highlightRange?: monaco.Range;
  language?: string;
  id: number;
  lineHeight?: number;
  lineNumbers?: boolean;
  selection?: string;
  rows?: number;
  columns?: number;
  onClick: (id: number) => void;
  placeholder?: string;
  tabSize?: number;
  zIndex?: number | string;
}

const DEFAULT_EDITOR_PADDING = 20;
const DEFAULT_EDITOR_DRAG_GRID: [number, number] = [1, 1];
const DEFAULT_EDITOR_TOOLTIP_OFFSET: number = 10;
const DEFAULT_EDITOR_LAST_COLUMNS_PADDING = 2;
const DEFAULT_EDITOR_ONMOUNT_TIMEOUT = 1;
const DEFAULT_EDITOR_SELECTION_RANGE_CLASSNAME = "range-decorator";
const DEFAULT_EDITOR_HIGHLIGHT_RANGE_CLASSNAME = "highlight-range";
const DEFAULT_EDITOR_HIGHLIGHT_CLASSNAME = "highlight-editor";
const DEFAULT_EDITOR_SELECTION_RANGE_BEFORE_CLASSNAME = "before";

const lengthOfLongestLine = (str: string) => {
  return Math.max(...str.split("\n").map((line) => line.length));
};

const countLines = (str: string) => str.split("\n").length;

const toMonacoLanguage = (language: string) => {
  switch (language) {
    case "javascript":
      return "typescript";
    case "bash":
      return "shell";
    default:
      return language;
  }
};

function Editor({
  canvasSize,
  centerPos,
  content = "",
  fontFamily = DEFAULT_EDITOR_FONT_FAMILY,
  fontSize = DEFAULT_EDITOR_FONT_SIZE,
  handleChangeCursorPosition,
  handleExplainEditor,
  handleExplainSelection,
  handleHoverRange,
  handleOnMouseLeave,
  highlight = false,
  id,
  highlightRange,
  language = DEFAULT_EDITOR_LANGUAGE,
  lineHeight = DEFAULT_EDITOR_LINE_HEIGHT,
  lineNumbers = DEFAULT_EDITOR_LINE_NUMBERS,
  onClick,
  selection = "",
  rows,
  columns,
  placeholder,
  tabSize = DEFAULT_EDITOR_TAB_SIZE,
  zIndex = "auto",
}: React.PropsWithChildren<EditorProps>) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [source, setSource] = useState<string>(content);
  const [fontWidth, setFontWidth] = useState<number>(fontSize / 1.4);
  const [selectionPosition, setSelectionPosition] = useState<Coordinates>({ x: 0, y: 0 });
  const [monacoSelection, setMonacoSelection] = useState<monaco.Selection>();
  const [, setCodeWrapperSize] = useState<Size>({
    height: lineHeight * 1 + DEFAULT_EDITOR_PADDING * 2,
    width: DEFAULT_EDITOR_PADDING * 4,
  });
  const [selectedRanges, setSelectedRanges] = useState<monaco.Range[]>();
  const [editorLineCount, setEditorLineCount] = useState<number>(countLines(source));
  const [currentHighlightedDecorator, setCurrentHighlightedDecorator] = useState<string>();
  const [size, setSize] = useState<Size>({
    height: fontSize * lineHeight * editorLineCount + DEFAULT_EDITOR_PADDING * 2 + 2,
    width: (lengthOfLongestLine(source) * fontSize) / 1.4,
  });
  const [position, setPosition] = useState<Coordinates>({
    x: Math.round(centerPos.x - size.width / 2),
    y: Math.round(centerPos.y - size.height / 2),
  });
  const [lastChangeTimeout, setLastChangeTimeout] = useState<NodeJS.Timeout>();
  const [decoratorHandles, setDecoratorHandles] = useState<Record<string, monaco.Range>>({});
  const [contentWidgets, setContentWidgets] = useState<monaco.editor.IContentWidget[]>([]);
  const [isPlaceholerVisible, setIsPlaceholderVisible] = useState<boolean>(placeholder ? true : false);

  const updateXarrow = useXarrow();

  useEffect(() => {
    if (highlightRange) {
      const decoratorsInRange = editorRef.current
        ?.getDecorationsInRange(highlightRange)
        ?.filter((decorators) => decorators.options.className?.includes(DEFAULT_EDITOR_SELECTION_RANGE_CLASSNAME));

      if (decoratorsInRange?.length) {
        const highlightDecorator = editorRef.current?.deltaDecorations(
          [],
          [
            {
              range: highlightRange,
              options: { className: `${DEFAULT_EDITOR_HIGHLIGHT_RANGE_CLASSNAME}` },
            },
          ]
        );
        if (highlightDecorator) setCurrentHighlightedDecorator(highlightDecorator[0]);
      }
    } else if (currentHighlightedDecorator) {
      editorRef.current?.deltaDecorations([currentHighlightedDecorator], []);
      setCurrentHighlightedDecorator(undefined);
    }
    // eslint-disable-next-line
  }, [highlightRange]);

  useEffect(() => {
    // @ts-ignore
    const lineCount = editorRef.current?._modelData.viewModel.getLineCount();
    setEditorLineCount(lineCount);
    const fontWidth =
      // @ts-ignore
      editorRef.current?._modelData.viewModel.coordinatesConverter._lines.fontInfo.typicalHalfwidthCharacterWidth; // @ts-ignore
    setFontWidth(fontWidth);
  }, [fontSize]);

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) {
    if (selection) {
      const results = editor.getModel()?.findMatches(selection, true, false, true, null, true, 1);

      if (results?.length)
        editor.deltaDecorations(
          [],
          [
            {
              range: results[0].range,
              options: { className: "decorator", inlineClassName: "selection-range " },
            },
          ]
        );
    }

    // editorRef.current?.onMouseMove(onMouseMoveMonaco);
    editor.onDidChangeCursorPosition((event: monaco.editor.ICursorPositionChangedEvent) => {
      handleChangeCursorPosition(event.position.lineNumber, event.position.column);
    });

    editor.onDidChangeCursorSelection((event) => {
      const selection = getValueInSelectionRange(event.selection);

      if (!selection || selection.length < 2) return resetSelection();

      const { startColumn, startLineNumber } = event.selection;

      setSelectionPosition({
        x: startColumn * fontWidth,
        y: fontSize * lineHeight * startLineNumber,
      });
      setIsSelected(true);
      setMonacoSelection(event.selection);
    });

    if (handleOnMouseLeave) {
      editor.onMouseLeave(() => {
        handleOnMouseLeave();
      });
    }

    setTimeout(() => {
      // @ts-ignore
      const lineCount = rows ?? editor._modelData.viewModel.getLineCount();
      setEditorLineCount(lineCount);
      setVisible(true);
      // @ts-ignore
      // @ts-ignore
      const fontWidth = editor._modelData.viewModel.coordinatesConverter._lines.fontInfo.typicalHalfwidthCharacterWidth;
      setFontWidth(fontWidth);
      // @ts-ignore

      const cols = columns ?? lengthOfLongestLine(source) + DEFAULT_EDITOR_LAST_COLUMNS_PADDING;

      const height = fontSize * lineHeight * lineCount + DEFAULT_EDITOR_PADDING * 2;
      const width = cols * fontWidth + DEFAULT_EDITOR_PADDING * 2;

      setSize({
        height,
        width,
      });

      if (size.width >= canvasSize.width * DEFAULT_EDITOR_MAX_WIDTH - 1) {
        setPosition({
          x: Math.round(centerPos.x - (canvasSize.width / 2) * DEFAULT_EDITOR_MAX_WIDTH),
          y: Math.round(centerPos.y - height / 2),
        });
      } else {
        setPosition({
          x: Math.round(centerPos.x - width / 2),
          y: Math.round(centerPos.y - height / 2),
        });
      }
    }, DEFAULT_EDITOR_ONMOUNT_TIMEOUT);

    // here is the editor instance
    // you can store it in `useRef` for further usage

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    editorRef.current = editor;
  }

  editorRef.current?.onMouseMove((event: monaco.editor.IEditorMouseEvent) => {
    if (!event.target.range) return;

    const { range } = event.target;

    const decoratorsInRange = editorRef.current
      ?.getDecorationsInRange(range)
      ?.filter((decoration) => decoration.options.className?.includes("decorator"));

    if (decoratorsInRange?.length) {
      handleHoverRange(decoratorsInRange[0].range);
    } else {
      handleHoverRange(undefined);
    }
  });

  function fitSize() {
    // const longestLine = lengthOfLongestLine(source);
    // const wordWrapColumn = DEFAULT_MONACO_EDITOR_OPTIONS.wordWrapColumn ?? 80;

    // const availableWidth = canvas.width * DEFAULT_EDITOR_MAX_WIDTH;
    let newWidth: number = (lengthOfLongestLine(source) + 2) * fontWidth + DEFAULT_EDITOR_PADDING * 2;

    // @ts-ignore
    const lineCount = editorRef.current?._modelData.viewModel.getLineCount();

    const height = fontSize * lineHeight * lineCount + DEFAULT_EDITOR_PADDING * 2;

    setSize({
      height,
      width: newWidth,
    });
  }

  function getValueInSelectionRange(range: monaco.IRange) {
    return editorRef.current?.getModel()?.getValueInRange(range);
  }

  function resetSelection() {
    setIsSelected(false);
    setMonacoSelection(undefined);
  }

  function handleEditorOnChange(value?: string) {
    if (lastChangeTimeout) {
      clearTimeout(lastChangeTimeout);
    }

    const newSource = value ?? "";
    setSource(newSource);
    setCodeWrapperSize({
      height: lineHeight * countLines(source) + DEFAULT_EDITOR_PADDING * 2,
      width: fontSize * lengthOfLongestLine(source) + DEFAULT_EDITOR_PADDING * 2,
    });
    // @ts-expect-error
    setEditorLineCount(editorRef.current._modelData.viewModel.getLineCount());

    if (newSource.trim() === "" || newSource.length < 3) return;

    const timeout = setTimeout(async () => {
      handleExplainEditor(id, newSource, language);
    }, DEFAULT_EDITOR_LAST_CHANGE_TIMEOUT);

    setLastChangeTimeout(timeout);
  }

  editorRef.current?.onDidChangeModelContent((e) => {
    contentWidgets.map((widget) => editorRef.current?.layoutContentWidget(widget));
  });

  // function rangeIntersectDecorators(range: monaco.Range): boolean {
  //   const decorators = editorRef.current?.getDecorationsInRange(range);

  //   const intersections = decorators
  //     ?.filter((decorator) => decorator.options.className?.includes("decorator"))
  //     .map((decorator) => decorator.id);

  //   if (intersections) {
  //     const newDecorators = editorRef.current?.deltaDecorations(intersections, []);
  //     setDecorators(newDecorators);
  //   }
  //   return false;
  // }

  editorRef.current?.onDidBlurEditorText((e) => {
    if (source === "" && placeholder) {
      setIsPlaceholderVisible(true);
    }
  });

  async function handleOnClickExplain() {
    if (!monacoSelection || !handleExplainSelection) return;
    const selection = getValueInSelectionRange(monacoSelection);

    if (!selection || selection.trim().length < DEFAULT_EDITOR_MIN_SELECTION) return;

    const beforeContentClassName = `${DEFAULT_EDITOR_SELECTION_RANGE_BEFORE_CLASSNAME}-${monacoSelection.startLineNumber}${monacoSelection.startColumn}`;
    const newDecorator = editorRef.current?.deltaDecorations(
      [],
      [
        {
          range: monacoSelection,
          options: {
            className: DEFAULT_EDITOR_SELECTION_RANGE_CLASSNAME,
            beforeContentClassName,
          },
        },
      ]
    );

    const arrowAnchorStart: monaco.editor.IContentWidget = {
      getId: function () {
        return `editor-${id}-start-${monacoSelection.startLineNumber}${monacoSelection.startColumn}`;
      },
      getDomNode: function () {
        const element = document.createElement("div");
        element.style.height = lineHeight * fontSize + "px";
        element.id = `editor-${id}-start-${monacoSelection.startLineNumber}${monacoSelection.startColumn}`;
        return element;
      },
      getPosition: function () {
        return {
          position: {
            lineNumber: monacoSelection.startLineNumber,
            column: monacoSelection.startColumn,
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        };
      },
    };
    editorRef.current?.addContentWidget(arrowAnchorStart);

    const arrowAnchorEnd: monaco.editor.IContentWidget = {
      getId: function () {
        return `editor-${id}-end-${monacoSelection.startLineNumber}${monacoSelection.startColumn}`;
      },
      getDomNode: function () {
        const element = document.createElement("div");
        element.style.height = lineHeight * fontSize + "px";
        element.id = `editor-${id}-end-${monacoSelection.endLineNumber}${monacoSelection.endColumn}`;
        return element;
      },
      getPosition: function () {
        return {
          position: {
            lineNumber: monacoSelection.endLineNumber,
            column: monacoSelection.endColumn,
          },
          preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
        };
      },
    };

    editorRef.current?.addContentWidget(arrowAnchorEnd);

    setContentWidgets([...contentWidgets, arrowAnchorStart, arrowAnchorEnd]);
    if (newDecorator) {
      const handle = newDecorator[0];

      setDecoratorHandles({ ...decoratorHandles, [handle]: monacoSelection });

      await handleExplainSelection(id, source, language, selection, monacoSelection, () => {
        editorRef.current?.deltaDecorations(newDecorator, []);

        const highlighDecorators = editorRef.current
          ?.getModel()
          ?.getAllDecorations()
          .filter((decoration) => decoration.options.className?.includes(DEFAULT_EDITOR_HIGHLIGHT_RANGE_CLASSNAME));

        if (highlighDecorators) editorRef.current?.deltaDecorations([...highlighDecorators.map((d) => d.id)], []);

        setCurrentHighlightedDecorator(undefined);
        setContentWidgets([...contentWidgets.slice(0, -2)]);
      });

      editorRef.current?.setSelection(new monaco.Selection(0, 0, 0, 0));
    }
    if (selectedRanges) {
      setSelectedRanges([...selectedRanges, monacoSelection]);
    } else {
      setSelectedRanges([monacoSelection]);
    }
    resetSelection();
  }

  function onDoubleClickDragbar() {
    fitSize();
  }

  return (
    <Rnd
      bounds="parent"
      style={{
        opacity: visible ? "1" : "0",
      }}
      position={position}
      size={{
        width: size.width,
        height: size.height,
      }}
      dragGrid={DEFAULT_EDITOR_DRAG_GRID}
      minWidth={DEFAULT_EDITOR_PADDING * 10}
      minHeight={DEFAULT_EDITOR_PADDING * 3}
      maxWidth={`${DEFAULT_EDITOR_MAX_WIDTH * 100}%`}
      dragHandleClassName="dragbar"
      className={`code-wrapper rounded ${highlight ? DEFAULT_EDITOR_HIGHLIGHT_CLASSNAME : ""}`}
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
      }}
      onDrag={updateXarrow}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      onResize={updateXarrow}
      id={`editor-${id}`}
    >
      <div
        style={{ width: "100%", height: `${DEFAULT_EDITOR_PADDING}px`, background: "transparent" }}
        className="dragbar"
        onDoubleClick={onDoubleClickDragbar}
        onClickCapture={(e) => {
          if (!onClick) return;
          e.stopPropagation();
          onClick(id);
        }}
      ></div>
      <div
        style={{
          bottom: `${DEFAULT_EDITOR_PADDING}px`,
          top: `${DEFAULT_EDITOR_PADDING}px`,
          left: `${DEFAULT_EDITOR_PADDING}px`,
          right: `${DEFAULT_EDITOR_PADDING}px`,
          position: "absolute",
        }}
        onClick={(e) => {
          if (!onClick) return;
          e.stopPropagation();
          onClick(id);
        }}
      >
        <MonacoEditor
          language={toMonacoLanguage(language)}
          value={source}
          theme="vs-dark"
          className="editor"
          options={{
            ...DEFAULT_MONACO_EDITOR_OPTIONS,
            fontSize,
            fontFamily,
            lineNumbers: lineNumbers ? "on" : "off",
            lineHeight: fontSize * lineHeight,
            tabSize,
          }}
          onChange={handleEditorOnChange}
          onMount={handleEditorDidMount}
        />
        {isPlaceholerVisible && source === "" && (
          <div
            className="placeholder absolute top-0 left-0 bottom-0 right-0 select-none"
            style={{
              fontSize,
            }}
            onClick={() => {
              setIsPlaceholderVisible(false);
              editorRef.current?.focus();
            }}
          >
            {placeholder}
          </div>
        )}

        {isSelected && (
          <span
            className="tooltip absolute d-inline-block"
            style={{
              top: selectionPosition?.y - DEFAULT_EDITOR_PADDING * 2 - DEFAULT_EDITOR_TOOLTIP_OFFSET,
              left: selectionPosition?.x - DEFAULT_EDITOR_PADDING,
            }}
          >
            <button className="border-1 rounded bg-gray-50 text-black py-1 px-2" onClickCapture={handleOnClickExplain}>
              Explain code
            </button>
          </span>
        )}
      </div>
    </Rnd>
  );
}

export default Editor;
