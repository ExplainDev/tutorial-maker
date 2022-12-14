import React, { useEffect, useRef, useState } from "react";
import { BoldExtension, MarkdownExtension, CodeExtension } from "remirror/extensions";
import { Rnd } from "react-rnd";
import { Remirror, useRemirror } from "@remirror/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useXarrow } from "react-xarrows";

import "./Text.css";
import { DEFAULT_EDITOR_TEXT_WIDTH } from "../constants";

interface TextProps {
  background?: string;
  centerPos: Coordinates;
  content?: string;
  editorId?: number;
  fontSize: number;
  foreground?: string;
  handleOnMouseEnter?: (id: number) => void;
  handleOnMouseLeave?: (id: number) => void;
  highlight?: boolean;
  id: number;
  main?: boolean;
  onClick?: (id: number) => void;
  range?: monaco.Range;
  rotate?: number;
  rounded?: boolean;
  visible?: boolean;
  width?: string;
  zIndex?: number;
  focus?: boolean;
}

const DEFAULT_TEXT_MAX_WIDTH = "95%";
const DEFAULT_TEXT_MIN_HEIGHT = 45;
const DEFAULT_TEXT_MIN_WIDTH = 50;
const DEFAULT_TEXT_DRAG_GRID: [number, number] = [1, 1];
const DEFAULT_TEXT_VERTICAL_OFFSET = 50;

function Text({
  centerPos,
  content,
  editorId,
  fontSize,
  handleOnMouseEnter,
  handleOnMouseLeave,
  highlight = false,
  id,
  focus,
  onClick,
  range,
  main,
  visible = true,
  foreground = "black",
  background = "transparent",
  rotate,
  rounded,
  width = DEFAULT_EDITOR_TEXT_WIDTH,
  zIndex,
}: TextProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [editable, setEditable] = useState<boolean>(false);
  const [position, setPosition] = useState<Coordinates>({ x: centerPos.x, y: centerPos.y });
  const [isHighlighted, setIsHighlighted] = useState<boolean>(highlight);
  const [isDragable, setIsDragable] = useState<boolean>(true);

  const updateXarrow = useXarrow();

  const [size, setSize] = useState<Size | { height: string; width: string }>({
    height: "auto",
    width,
  });
  const { manager, state, setState } = useRemirror({
    extensions: () => [new MarkdownExtension({}), new CodeExtension(), new BoldExtension()],
    stringHandler: "markdown",
    selection: "all",
    content,
  });

  useEffect(() => {
    function centerText() {
      if (!wrapperRef.current) return;
      const { offsetWidth } = wrapperRef.current;
      setPosition({
        x: centerPos.x - (offsetWidth !== undefined ? offsetWidth / 2 : 0),
        y: DEFAULT_TEXT_VERTICAL_OFFSET,
      });
    }

    centerText();
  }, [setPosition, centerPos]);

  return (
    <Rnd
      position={position}
      size={size}
      maxWidth={DEFAULT_TEXT_MAX_WIDTH}
      minHeight={DEFAULT_TEXT_MIN_HEIGHT}
      minWidth={DEFAULT_TEXT_MIN_WIDTH}
      dragGrid={DEFAULT_TEXT_DRAG_GRID}
      enableUserSelectHack={true}
      style={{
        textAlign: "center",
        visibility: visible ? "visible" : "hidden",
        outline: isHighlighted || highlight ? "1px solid black" : "0",
        zIndex,
      }}
      // dragHandleClassName="text-dragbar"
      resizeHandleStyles={{
        top: {},
        topLeft: {},
        left: {},
        bottom: {},
        right: {},
      }}
      resizeHandleClasses={{}}
      disableDragging={!isDragable}
      cancel={"text-explanation-wrapper "}
      id="text-rnd"
      onDragStop={(e, d) => {
        setPosition({ x: d.x, y: d.y });
        updateXarrow();
      }}
      onDrag={updateXarrow}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
        updateXarrow();
      }}
      onResize={updateXarrow}
    >
      <div
        id={`text-${id}`}
        className={`text-explanation-wrapper relative ${main ? "main-text" : ""} text-${id} ${rounded ? "rounded-lg" : ""}`}
        onMouseEnter={() => {
          setIsHighlighted(true);

          if (!handleOnMouseEnter) return;

          handleOnMouseEnter(id);
        }}
        onMouseLeave={() => {
          setIsHighlighted(false);

          if (!handleOnMouseLeave) return;

          handleOnMouseLeave(id);
        }}
        ref={wrapperRef}
        onDoubleClick={(event) => {
          setEditable(true);
        }}
        style={{
          userSelect: editable ? "initial" : "none",
          fontSize: `${fontSize}px`,
          color: foreground ?? "black",
          backgroundColor: background || "transparent",
        }}
        onBlur={() => {
          setEditable(false);
          setIsDragable(true);
        }}
        onClick={(e) => {
          if (!onClick) return;
          e.stopPropagation();
          setIsDragable(false);
          onClick(id);
        }}
        tabIndex={id}
      >
        <Remirror
          manager={manager}
          classNames={["explanation-text", "z-50", "overflow-y-hidden", "remirror-theme", "p-2"]}
          editable={true}
          state={state}
          onChange={(parameter) => {
            setState(parameter.state);
          }}
          autoFocus={focus}
          supportedLocales={["es", "en"]}
        />
      </div>
    </Rnd>
  );
}

export default Text;
