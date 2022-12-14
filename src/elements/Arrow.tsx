import React from "react";
import Xarrow, { xarrowPropsType } from "react-xarrows";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  DEFAULT_ARROW_COLOR,
  DEFAULT_ARROW_CURVENESS,
  DEFAULT_ARROW_DASHNESS,
  DEFAULT_ARROW_HEAD_SIZE,
  DEFAULT_ARROW_SHOW_HEAD,
  DEFAULT_ARROW_SHOW_TAIL,
  DEFAULT_ARROW_STROKE_WIDTH,
  DEFAULT_ARROW_TAIL_SHAPE,
  DEFAULT_ARROW_TAIL_SIZE,
} from "../constants";

interface ArrowProps extends xarrowPropsType {
  anchorAt?: "start" | "end";
  color?: string;
  curveness?: number;
  dashness?: boolean;
  editorId?: number;
  end: string;
  highlight?: boolean;
  id: number;
  onBlur?: () => void;
  onClick: (id: number) => void;
  path?: "smooth" | "grid" | "straight";
  range: monaco.Range;
  start: string;
  strokeWidth?: number;
  visible?: boolean;
  headSize?: number;
  opacity?: number;
}

function Arrow(props: Omit<ArrowProps, "start">) {
  return (
    <>
      <Xarrow
        start={
          props.anchorAt === "end"
            ? `editor-${props.editorId}-end-${props.range.endLineNumber}${props.range.endColumn}`
            : `editor-${props.editorId}-start-${props.range.startLineNumber}${props.range.startColumn}`
        }
        startAnchor={["top", "bottom"]}
        endAnchor={["left", "right", "top", "bottom"]}
        end={props.end}
        key={props.id}
        headSize={props.headSize ?? DEFAULT_ARROW_HEAD_SIZE}
        tailShape={props.tailShape ?? DEFAULT_ARROW_TAIL_SHAPE}
        color={props.color ?? DEFAULT_ARROW_COLOR}
        curveness={props.curveness ?? DEFAULT_ARROW_CURVENESS}
        strokeWidth={props.strokeWidth ?? DEFAULT_ARROW_STROKE_WIDTH}
        dashness={props.dashness ?? DEFAULT_ARROW_DASHNESS}
        showHead={props.showHead ?? DEFAULT_ARROW_SHOW_HEAD}
        showTail={props.showTail ?? DEFAULT_ARROW_SHOW_TAIL}
        tailSize={props.tailSize ?? DEFAULT_ARROW_TAIL_SIZE}
        passProps={{
          opacity: props.opacity?.toString(),
          onClickCapture: () => {
            props.onClick(props.id);
          },
          width: "1",
        }}
        path={props.path}
      />
    </>
  );
}

export default Arrow;
