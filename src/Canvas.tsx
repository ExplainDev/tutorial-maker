import React, { useEffect, useRef, useState } from "react";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";

import "remirror/styles/all.css";
import {
  DEFAULT_ARROW_COLOR,
  DEFAULT_ARROW_DASHNESS,
  DEFAULT_ARROW_OPACITY,
  DEFAULT_ARROW_PATH,
  DEFAULT_ARROW_SHOW_HEAD,
  DEFAULT_ARROW_SHOW_TAIL,
  DEFAULT_ARROW_STROKE_WIDTH,
  DEFAULT_CANVAS_BACKGROUND,
  DEFAULT_CANVAS_HEIGHT,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_EDITOR_FONT_SIZE,
  DEFAULT_SETTINGS,
  DEFAULT_TEXT_BACKGROUND,
  DEFAULT_TEXT_FONT_SIZE,
  DEFAULT_TEXT_FOREGROUND,
  DEFAULT_TEXT_LARGE_FONT_SIZE,
  DEFAULT_TEXT_PLACEHOLDER,
} from "./constants";
import Text from "./elements/Text";
import Editor from "./elements/Editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import Sidebar from "./Sidebar";
import Header from "./Header";

import NotFound from "./NotFound";
import Loading from "./Loading";
import { explain } from "./http/explain";

import "./Canvas.css";
import { Xwrapper } from "react-xarrows";
import Arrow from "./elements/Arrow";
import { AuthError, RateLimitError } from "./exceptions";
import { LoginWallModal } from "./modals/LoginWallModal";
import { hasSeenOnboarding, setHasSeenOnboarding } from "./storage/onboarding";
import { OnboardingModal } from "./modals/OnboardingModal";

interface CanvasProps {
  new?: boolean;
}

function Canvas(props: CanvasProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [error] = useState(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [notFound] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const [centerPos, setCenterPos] = useState<Coordinates>({
    x: DEFAULT_CANVAS_WIDTH / 2,
    y: DEFAULT_CANVAS_HEIGHT / 2,
  });
  const [highlightRange] = useState<monaco.Range>();
  const [canvasElements, setCanvasElements] = useState<Array<CanvasElement>>();
  const [selectedElement, setSelectedElement] = useState<CanvasElement>();
  const stateRef = useRef<Array<CanvasElement>>();
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    background: DEFAULT_CANVAS_BACKGROUND,
    height: DEFAULT_CANVAS_HEIGHT,
    width: DEFAULT_CANVAS_WIDTH,
  });
  const { getData: getVisitorData } = useVisitorData();
  const [isOpenModalLogin, setIsOpenModalLogin] = useState<boolean>(false);
  const [isOpenModalOnboarding, setIsOpenModalOnboarding] = useState<boolean>(!hasSeenOnboarding());

  useEffect(() => {
    setCenterPos({
      x: canvasSettings.width / 2,
      y: canvasSettings.height / 2,
    });
  }, [canvasSettings]);

  useEffect(() => {
    if (props.new) {
      setIsLoaded(true);
      setCanvasElements([
        {
          type: "editor",
          id: 1,
          key: 1,
          visible: true,
          zIndex: 0,
          language: DEFAULT_SETTINGS.editor.language || "plaintext",
          fontSize: DEFAULT_EDITOR_FONT_SIZE,
          element: (
            <Editor
              id={1}
              canvasSize={{
                height: canvasSettings.height,
                width: canvasSettings.width,
              }}
              centerPos={centerPos}
              placeholder={"// Enter your code here"}
              handleExplainEditor={handleExplainEditor}
              handleExplainSelection={handleExplainSelection}
              handleHoverRange={handleHoverRange}
              handleChangeCursorPosition={handleChangeCursorPosition}
              handleOnMouseLeave={handleOnMouseLeaveEditor}
              onClick={handleOnClickElement}
              rows={6}
              columns={55}
              key={1}
            />
          ),
        },
        {
          element: (
            <Text
              content={DEFAULT_TEXT_PLACEHOLDER}
              fontSize={DEFAULT_TEXT_LARGE_FONT_SIZE}
              centerPos={centerPos}
              key={2}
              visible={true}
              handleOnMouseEnter={handleOnMouseEnterText}
              handleOnMouseLeave={handleOnMouseLeaveText}
              id={2}
              onClick={handleOnClickElement}
              main={true}
              background={DEFAULT_TEXT_BACKGROUND}
              foreground={DEFAULT_TEXT_FOREGROUND}
              width={"80%"}
            />
          ),
          id: 2,
          key: 2,
          visible: true,
          type: "text",
          editorId: 1,
          fontSize: DEFAULT_TEXT_LARGE_FONT_SIZE,
          foreground: DEFAULT_TEXT_FOREGROUND,
          background: DEFAULT_TEXT_BACKGROUND,
        },
      ]);
    }

    // eslint-disable-next-line
  }, [props.new]);

  useEffect(() => {
    if (!stateRef.current || selectedElement) return;

    const unhighlightedItems: CanvasElement[] = stateRef.current.map((element) => {
      element.element = React.cloneElement(element.element, { ...element.element.props, highlight: false });

      return element;
    });

    setCanvasElements(unhighlightedItems);
  }, [selectedElement]);

  stateRef.current = canvasElements;

  async function handleExplainEditor(editorId: number, source: string, language: string) {
    if (!stateRef.current) return;

    setLoadingExplanation(true);

    try {
      const visitorData = await getVisitorData();
      const res = await explain({
        source,
        language,
        mode: "full",
        followupQuestions: false,
        visitorId: visitorData?.visitorId,
      });

      const textElement = stateRef.current.find((element) => {
        return element.type === "text" && element.range === undefined && element.editorId === editorId;
      });
      if (!textElement) return;
      const textElementPos = stateRef.current.findIndex((element) => element.id === textElement?.id);

      const nextId = getNextId();

      setCanvasElements([
        ...stateRef.current.slice(0, textElementPos),
        {
          ...textElement,
          onDelete: (id) => handleOnDeleteElement(id),
          element: (
            <Text
              content={res.answer}
              fontSize={DEFAULT_TEXT_LARGE_FONT_SIZE}
              centerPos={centerPos}
              key={nextId}
              visible={true}
              handleOnMouseEnter={handleOnMouseEnterText}
              handleOnMouseLeave={handleOnMouseLeaveText}
              id={nextId}
              onClick={handleOnClickElement}
              main={true}
              foreground={DEFAULT_TEXT_FOREGROUND}
              background={DEFAULT_TEXT_BACKGROUND}
              editorId={editorId}
            />
          ),
          id: nextId,
          key: nextId,
          main: true,
          visible: true,
          type: "text",
          editorId,
          fontSize: DEFAULT_TEXT_LARGE_FONT_SIZE,
          foreground: DEFAULT_TEXT_FOREGROUND,
          background: DEFAULT_TEXT_BACKGROUND,
        },
        ...stateRef.current.slice(textElementPos + 1),
      ]);
    } catch (error) {
      if (error instanceof AuthError) {
        setIsOpenModalLogin(true);
      } else if (error instanceof RateLimitError) {
        alert(error.message);
      }
    }
    setLoadingExplanation(false);
  }

  async function handleExplainSelection(
    editorId: number,
    source: string,
    language: string,
    selection: string,
    range: monaco.Range,
    onDelete: () => void
  ) {
    if (!stateRef.current) return;

    setLoadingExplanation(true);

    try {
      const visitorData = await getVisitorData();

      const res = await explain({ source, language, mode: "selection", selection, visitorId: visitorData?.visitorId });

      const newId = getNextId();
      setCanvasElements([
        ...stateRef.current,
        {
          element: (
            <Text
              content={res.answer}
              fontSize={DEFAULT_TEXT_FONT_SIZE}
              centerPos={centerPos}
              key={newId}
              visible={true}
              handleOnMouseEnter={handleOnMouseEnterText}
              handleOnMouseLeave={handleOnMouseLeaveText}
              id={newId}
              onClick={handleOnClickElement}
              range={range}
              background={DEFAULT_TEXT_BACKGROUND}
              foreground={DEFAULT_TEXT_FOREGROUND}
              editorId={editorId}
            />
          ),
          id: newId,
          key: newId,
          visible: true,
          type: "text",
          editorId: editorId,
          fontSize: DEFAULT_TEXT_FONT_SIZE,
          range,
          arrowId: newId + 1,
          foreground: DEFAULT_TEXT_FOREGROUND,
          background: DEFAULT_TEXT_BACKGROUND,
          onDelete: (id) => {
            onDelete();
            handleOnDeleteElement(id);
          },
        },
        {
          element: (
            <Arrow
              anchorAt="start"
              startAnchor={["left", "right", "top", "bottom"]}
              endAnchor={["left", "right", "top", "bottom"]}
              end={`text-${newId}`}
              key={newId + 1}
              onClick={handleOnClickElement}
              id={newId + 1}
              range={range}
              tailShape="circle"
              path={DEFAULT_ARROW_PATH}
              showTail={DEFAULT_ARROW_SHOW_TAIL}
              showHead={DEFAULT_ARROW_SHOW_HEAD}
              color={DEFAULT_ARROW_COLOR}
              strokeWidth={DEFAULT_ARROW_STROKE_WIDTH}
              opacity={DEFAULT_ARROW_OPACITY}
              editorId={editorId}
            />
          ),
          id: newId + 1,
          key: newId + 1,
          type: "arrow",
          visible: true,
          color: DEFAULT_ARROW_COLOR,
          strokeWidth: DEFAULT_ARROW_STROKE_WIDTH,
          dashness: DEFAULT_ARROW_DASHNESS,
          onDelete: (id) => {
            onDelete();
            handleOnDeleteElement(id);
          },
          anchorAt: "start",
          opacity: DEFAULT_ARROW_OPACITY,
          path: DEFAULT_ARROW_PATH,
          editorId,
        },
      ]);
    } catch (error) {
      if (error instanceof AuthError) {
        setIsOpenModalLogin(true);
      } else if (error instanceof RateLimitError) {
        alert(error.message);
      }
    }
    setLoadingExplanation(false);
  }

  function getNextId() {
    if (!stateRef.current) return 1;

    return Math.max(...stateRef.current.map((ele) => ele.id)) + 1;
  }

  const handleChangeCursorPosition = (lineNumber: number, column: number) => {
    // if (!stateRef.current) return;
    // let newTextElements: TextElement[] = [];
    // const textElements: TextElement[] = stateRef.current.filter((ele) => ele.type === "text") as TextElement[];
    // for (const textElement of textElements) {
    //   if (textElement.range?.containsPosition({ lineNumber, column })) {
    //     if (textElement.pinned) {
    //       textElement.pinned = false;
    //       textElement.visible = false;
    //       textElement.element = React.cloneElement(textElement.element, { visible: false });
    //     } else {
    //       textElement.pinned = true;
    //       textElement.visible = true;
    //       textElement.element = React.cloneElement(textElement.element, { visible: true });
    //     }
    //   }
    //   newTextElements.push(textElement);
    // }
    // setCanvasElements([...newTextElements]);
  };

  async function handleHoverRange(range?: monaco.Range) {
    // if (!stateRef.current) return;
    // let newTextElements: TextElement[] = [];
    // const textElements: TextElement[] = stateRef.current.filter((ele) => ele.type === "text") as TextElement[];
    // for (const textElement of textElements) {
    //   if (range && textElement.range?.containsRange(range)) {
    //     textElement.element = React.cloneElement(textElement.element, { ...textElement.element.props, highlight: true });
    //   } else {
    //     textElement.element = React.cloneElement(textElement.element, { ...textElement.element.props, highlight: false });
    //   }
    //   newTextElements.push(textElement);
    // }
    // setCanvasElements([...newTextElements]);
  }

  function handleOnClickElement(id: number) {
    const clickedElement = getElementById(id);
    setSelectedElement(clickedElement);
  }

  function handleOnDeleteElement(id: number) {
    if (!stateRef.current) return;

    const targetElement = getElementById(id);

    if (!targetElement || !targetElement.onDelete) return;

    const elementPos = stateRef.current.findIndex((element) => element.id === targetElement.id);

    // first, remove the element that we don't want anymore
    let newElements: CanvasElement[] = [...stateRef.current.slice(0, elementPos), ...stateRef.current.slice(elementPos + 1)];
    switch (targetElement.type) {
      case "arrow": {
        // unlink text elements this arrow and ranges
        newElements = newElements.map((element) => {
          if (element.type === "text" && element.arrowId === targetElement.id) {
            element.arrowId = undefined;
            element.range = undefined;
          }

          return element;
        });
        break;
      }
      case "text": {
        // remove all arrows
        newElements = newElements.filter((element) => !(element.type === "arrow" && element.id === targetElement.arrowId));
        break;
      }
      case "editor": {
        newElements = newElements
          .filter((element) => {
            // remove all arrows linked to editor
            return !(element.type === "arrow" && element.editorId === targetElement.id);
          })
          .map((element) => {
            // unlink text elements

            if (element.type === "text" && element.arrowId === targetElement.id) {
              element.arrowId = undefined;
              element.range = undefined;
            }

            return element;
          });
      }
    }

    setCanvasElements(newElements);
    setSelectedElement(undefined);
    //unhighlightElements();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getTextElementsByEditorId(id: number, range?: monaco.Range) {
    if (!stateRef.current) return;

    const textElements: TextElement[] = stateRef.current.filter((ele) => ele.type === "text") as TextElement[];

    let matchedElements: TextElement[];

    if (range) {
      matchedElements = textElements.filter((ele) => ele.editorId === id && ele.range === range);
    } else {
      matchedElements = textElements.filter((ele) => ele.editorId === id);
    }

    return matchedElements[0];
  }

  function getEditorById(id: number): EditorElement | undefined {
    if (!stateRef.current) return;

    const res = stateRef.current.filter((ele) => ele.type === "editor" && ele.id === id) as EditorElement[];

    return res[0];
  }

  function getElementById(id: number): CanvasElement | undefined {
    if (!stateRef.current) return;

    const res = stateRef.current.filter((ele) => ele.id === id);

    return res[0];
  }

  function getTextElementById(id: number): TextElement | undefined {
    if (!stateRef.current) return;

    const res = stateRef.current.filter((ele) => ele.type === "text" && ele.id === id) as TextElement[];

    return res[0];
  }

  function handleOnMouseEnterText(id: number) {
    if (!stateRef.current) return;

    const targetElement = getTextElementById(id);

    if (!targetElement?.editorId) return;

    const editorElement = getEditorById(targetElement.editorId);
    if (!editorElement) return;

    const editorPos = stateRef?.current.findIndex((element) => element.id === editorElement?.id);

    setCanvasElements([
      ...stateRef.current.slice(0, editorPos),
      {
        ...editorElement,
        element: React.cloneElement(editorElement.element, {
          ...editorElement.element.props,
          highlight: true,
          highlightRange: targetElement.range,
        }),
      },
      ...stateRef.current.slice(editorPos + 1),
    ]);
  }

  function handleOnMouseLeaveText(id: number) {
    if (!stateRef.current) return;

    const targetElement = getTextElementById(id);

    if (!targetElement?.editorId) return;

    const editorElement = getEditorById(targetElement.editorId);
    if (!editorElement) return;
    const editorPos = stateRef?.current.findIndex((element) => element.id === editorElement?.id);

    setCanvasElements([
      ...stateRef.current.slice(0, editorPos),

      {
        ...editorElement,
        element: React.cloneElement(editorElement.element, {
          ...editorElement.element.props,
          highlight: false,
          highlightRange: undefined,
        }),
      },
      ...stateRef.current.slice(editorPos + 1),
    ]);
  }

  function handleOnMouseLeaveEditor() {
    // setHighlightRange(undefined);
    // if (!stateRef.current) return;
    // let newTextElements: TextElement[] = [];
    // const textElements: TextElement[] = stateRef.current.filter((ele) => ele.type === "text") as TextElement[];
    // for (const textElement of textElements) {
    //   textElement.element = React.cloneElement(textElement.element, { ...textElement.element.props, highlight: false });
    //   newTextElements.push(textElement);
    // }
    // setCanvasElements([...newTextElements]);
  }

  function handleOnChangeSettings(selectedElement: CanvasElement, newSettings: any) {
    if (!stateRef.current) return;

    const targetElement = stateRef.current.findIndex((ele) => ele.id === selectedElement.id);
    if (targetElement === -1 || !stateRef.current) return;

    const updatedElement: CanvasElement = {
      ...selectedElement,
      ...newSettings,
      element: React.cloneElement(selectedElement.element, { ...selectedElement.element.props, ...newSettings }),
    };
    setSelectedElement(updatedElement);

    setCanvasElements([
      ...stateRef.current.slice(0, targetElement),
      updatedElement,
      ...stateRef.current.slice(targetElement + 1),
    ]);
  }

  function handleOnChangeCanvasSettings(newSettings: Partial<CanvasSettings>) {
    setCanvasSettings({ ...canvasSettings, ...newSettings });
  }

  function handleOnClickAddElement(type: "editor" | "text"): void {
    if (type === "editor") {
      addEditorElement(true);
    } else if (type === "text") {
      addTextElement();
    }
  }

  function addEditorElement(addText?: boolean) {
    if (!stateRef.current) return;

    const nextId = getNextId();

    const newEditor: CanvasElement = {
      type: "editor",
      id: nextId,
      key: nextId,
      visible: true,
      zIndex: nextId,
      language: DEFAULT_SETTINGS.editor.language || "plaintext",
      fontSize: DEFAULT_SETTINGS.editor.fontSize,
      onDelete: (id) => {
        handleOnDeleteElement(id);
      },
      element: (
        <Editor
          id={nextId}
          canvasSize={{
            height: canvasSettings.height,
            width: canvasSettings.width,
          }}
          language={DEFAULT_SETTINGS.editor.language || "plaintext"}
          centerPos={centerPos}
          fontSize={DEFAULT_SETTINGS.editor.fontSize}
          lineHeight={DEFAULT_SETTINGS.editor.lineHeight}
          lineNumbers={DEFAULT_SETTINGS.editor.lineNumbers}
          handleExplainEditor={handleExplainEditor}
          handleExplainSelection={handleExplainSelection}
          handleHoverRange={handleHoverRange}
          handleChangeCursorPosition={handleChangeCursorPosition}
          highlightRange={highlightRange}
          handleOnMouseLeave={handleOnMouseLeaveEditor}
          onClick={handleOnClickElement}
          key={nextId}
          placeholder="// Enter your text here..."
          zIndex={nextId}
        />
      ),
    };

    const newElements: CanvasElement[] = [newEditor];

    if (addText) {
      const newText: CanvasElement = {
        element: (
          <Text
            fontSize={DEFAULT_TEXT_FONT_SIZE}
            centerPos={centerPos}
            key={nextId + 1}
            visible={true}
            handleOnMouseEnter={handleOnMouseEnterText}
            handleOnMouseLeave={handleOnMouseLeaveText}
            id={nextId + 1}
            onClick={handleOnClickElement}
            background={DEFAULT_TEXT_BACKGROUND}
            foreground={DEFAULT_TEXT_FOREGROUND}
            zIndex={nextId + 1}
          />
        ),
        id: nextId + 1,
        key: nextId + 1,
        visible: true,
        type: "text",
        editorId: nextId,
        fontSize: DEFAULT_TEXT_FONT_SIZE,
        zIndex: nextId,
        foreground: DEFAULT_TEXT_FOREGROUND,
        background: DEFAULT_TEXT_BACKGROUND,
        main: true,
        onDelete: (id) => {
          handleOnDeleteElement(id);
        },
      };
      newElements.push(newText);
    }
    setCanvasElements([...stateRef.current, ...newElements]);

    return newEditor;
  }

  function addTextElement(editorId?: number) {
    if (!stateRef.current) return;

    const nextId = getNextId();

    const newText: CanvasElement = {
      element: (
        <Text
          fontSize={DEFAULT_TEXT_FONT_SIZE}
          centerPos={centerPos}
          key={nextId}
          visible={true}
          handleOnMouseEnter={handleOnMouseEnterText}
          handleOnMouseLeave={handleOnMouseLeaveText}
          id={nextId}
          onClick={handleOnClickElement}
          background={DEFAULT_TEXT_BACKGROUND}
          foreground={DEFAULT_TEXT_FOREGROUND}
          zIndex={nextId}
          focus
          highlight
        />
      ),
      id: nextId,
      key: nextId,
      visible: true,
      onDelete: (id) => {
        handleOnDeleteElement(id);
      },
      type: "text",
      editorId,
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      zIndex: nextId,
      foreground: DEFAULT_TEXT_FOREGROUND,
      background: DEFAULT_TEXT_BACKGROUND,
    };

    setCanvasElements([...stateRef.current, newText]);

    return newText;
  }

  if (error || notFound) {
    return <NotFound />;
  } else if (!isLoaded) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header frameRef={frameRef} handleOnClickAddElement={handleOnClickAddElement} />
        <main className="canvas flex overflow-hidden">
          <section
            id="canvas"
            ref={ref}
            className={`${loadingExplanation ? "loading" : ""} grid h-screen place-items-center overflow-auto`}
            onClickCapture={(e) => {
              if (e.target !== frameRef.current) return;
              setSelectedElement(undefined);
            }}
          >
            <div
              className={`frame`}
              style={{
                width: canvasSettings.width,
                height: canvasSettings.height,
                background: canvasSettings.background,
              }}
              ref={frameRef}
            >
              <Xwrapper>
                {canvasElements && [...canvasElements?.map((ele) => ele.element)]}
                <span className="branding leading-none text-white bg-black/70 p-1 px-3 font-semibold">ExplainDev</span>
              </Xwrapper>
            </div>
          </section>
          <Sidebar
            onChangeCanvasSettings={handleOnChangeCanvasSettings}
            onChangeElementSettings={handleOnChangeSettings}
            canvasSettings={canvasSettings}
            selectedElement={selectedElement}
          />
        </main>
      </div>
      <LoginWallModal isOpen={isOpenModalLogin} onClose={() => setIsOpenModalLogin(false)} />
      <OnboardingModal
        isOpen={isOpenModalOnboarding}
        onClose={() => {
          setIsOpenModalOnboarding(false);
          setHasSeenOnboarding();
        }}
      />
    </>
  );
}

export default Canvas;
