import React from "react";
import {
  DEFAULT_ARROW_MAX_STROKE_WIDTH,
  DEFAULT_ARROW_MIN_STROKE_WIDTH,
  DEFAULT_TEXT_MAX_SIZE,
  DEFAULT_TEXT_MIN_SIZE,
} from "./constants";

import "./Sidebar.css";

interface SidebarProps {
  canvasSettings: CanvasSettings;
  selectedElement?: CanvasElement;
  onChangeElementSettings: (selectedElement: CanvasElement, newSettings: any) => void;
  onChangeCanvasSettings: (newSettings: Partial<CanvasSettings>) => void;
}

function Sidebar({
  canvasSettings,
  onChangeCanvasSettings,
  onChangeElementSettings,
  selectedElement,
}: React.PropsWithChildren<SidebarProps>) {
  function handleOnChangeSettings() {
    return (event: React.FormEvent<HTMLInputElement | HTMLButtonElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { value } = event.currentTarget;

      switch (event.currentTarget.name) {
        case "arrow.anchorAt": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { anchorAt: value });
          break;
        }
        case "arrow.color": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { color: value });
          break;
        }
        case "arrow.strokeWidth": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { strokeWidth: parseInt(value) });
          break;
        }
        case "arrow.dashness": {
          const target = event.currentTarget as HTMLInputElement;
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { dashness: target.checked });
          break;
        }
        case "arrow.path": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { path: value });
          break;
        }

        case "arrow.opacity": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { opacity: parseFloat(value) });
          break;
        }
        case "canvas.height": {
          if (!value) return;

          onChangeCanvasSettings({ height: parseInt(value) });
          break;
        }

        case "canvas.width": {
          if (!value) return;

          onChangeCanvasSettings({ width: parseInt(value) });
          break;
        }
        case "canvas.background": {
          onChangeCanvasSettings({ background: value });
          break;
        }
        case "editor.fontSize": {
          if (!value || !selectedElement) return;

          onChangeElementSettings(selectedElement, { fontSize: parseInt(value) });
          break;
        }
        case "editor.language": {
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { language: value });
          break;
        }
        case "editor.lineNumbers": {
          const target = event.currentTarget as HTMLInputElement;
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { lineNumbers: target.checked });
          break;
        }
        case "text.fontSize": {
          if (!selectedElement) return;
          onChangeElementSettings(selectedElement, { fontSize: parseInt(value) });
          break;
        }
        case "text.foreground": {
          if (!selectedElement) return;
          onChangeElementSettings(selectedElement, { foreground: value });
          break;
        }
        case "text.background": {
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { background: value });
          break;
        }
        case "text.rotate": {
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { rotate: parseInt(value) });
          break;
        }
        case "text.rounded": {
          const target = event.currentTarget as HTMLInputElement;
          if (!selectedElement) return;

          onChangeElementSettings(selectedElement, { rounded: target.checked });
          break;
        }
      }
    };
  }

  return (
    <section className="sidebar">
      <form>
        <ul className="list-none space-y divide-y">
          {selectedElement?.type === "arrow" && (
            <li className="p-3 space-y-3">
              <h5 className="font-bold text-base">Arrow</h5>
              <div className="space-y-1">
                <label htmlFor="arrow.strokeWidth" className="block">
                  Stroke width
                </label>
                <input
                  type="number"
                  min={DEFAULT_ARROW_MIN_STROKE_WIDTH}
                  max={DEFAULT_ARROW_MAX_STROKE_WIDTH}
                  step={1}
                  value={selectedElement.strokeWidth}
                  className="text-black border border-slate-200 hover:border-slate-400 p-1"
                  name="arrow.strokeWidth"
                  onChange={handleOnChangeSettings()}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="arrow.color" className="block">
                  Color
                </label>
                <div>
                  <input
                    type="text"
                    name="arrow.color"
                    value={selectedElement.color || ""}
                    onChange={handleOnChangeSettings()}
                    className={`border border-slate-200 hover:border-slate-400 p-1 w-full resize-y`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="arrow.opacity" className="block">
                  Opacity
                </label>
                <input
                  type="number"
                  min={0.1}
                  max={1}
                  step={0.1}
                  maxLength={3}
                  defaultValue={selectedElement.opacity}
                  className="text-black border border-slate-200 hover:border-slate-400 p-1"
                  name="arrow.opacity"
                  onChange={handleOnChangeSettings()}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="arrow.anchorAt" className="block">
                  Anchor position
                </label>
                <div className="inline-flex ">
                  <button
                    name="arrow.anchorAt"
                    value={"start"}
                    type="button"
                    className={`px-3 py-0 bg-white border text-black rounded-l  ${
                      selectedElement.anchorAt !== "end" ? "bg-slate-200" : ""
                    }`}
                    onClick={handleOnChangeSettings()}
                  >
                    Start
                  </button>
                  <button
                    name="arrow.anchorAt"
                    value={"end"}
                    type="button"
                    className={`px-3 py-0 bg-gray border text-black border-l-0 rounded-r ${
                      selectedElement.anchorAt === "end" ? "bg-slate-200" : ""
                    }`}
                    onClick={handleOnChangeSettings()}
                  >
                    End
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ">
                  <input
                    type="checkbox"
                    id="default-toggle"
                    className="sr-only peer"
                    checked={selectedElement.dashness}
                    name="arrow.dashness"
                    onChange={handleOnChangeSettings()}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3">Dash line</span>
                </label>
              </div>

              <div>
                <label htmlFor="arrow.anchorAt" className="block">
                  Path
                </label>
                <div className="inline-flex ">
                  <button
                    name="arrow.path"
                    value={"grid"}
                    type="button"
                    className={`px-3 py-0 bg-white border text-black rounded-l  ${
                      selectedElement.path === "grid" ? "bg-slate-200" : ""
                    }`}
                    onClick={handleOnChangeSettings()}
                  >
                    Grid
                  </button>
                  <button
                    name="arrow.path"
                    value={"smooth"}
                    type="button"
                    className={`px-3 py-0 bg-gray border text-black border-x-0 ${
                      selectedElement.path === "smooth" ? "bg-slate-200" : ""
                    }`}
                    onClick={handleOnChangeSettings()}
                  >
                    Smooth
                  </button>
                  <button
                    name="arrow.path"
                    value={"straight"}
                    type="button"
                    className={`px-3 py-0 bg-gray border text-black rounded-r ${
                      selectedElement.path === "straight" ? "bg-slate-200" : ""
                    }`}
                    onClick={handleOnChangeSettings()}
                  >
                    Line
                  </button>
                </div>
              </div>
              {selectedElement.onDelete && (
                <div>
                  <button
                    type="button"
                    onClick={() => selectedElement.onDelete && selectedElement.onDelete(selectedElement.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          )}
          {selectedElement?.type === "text" && (
            <li className="p-3 space-y-3">
              <h5 className="font-bold text-base">Text</h5>
              <div className="space-y-1">
                <label htmlFor="text.fontSize" className="block">
                  Font size
                </label>
                <div>
                  <input
                    type="number"
                    min={DEFAULT_TEXT_MIN_SIZE}
                    max={DEFAULT_TEXT_MAX_SIZE}
                    step={1}
                    value={selectedElement.fontSize}
                    className="text-black border border-slate-200 hover:border-slate-400 p-1"
                    name="text.fontSize"
                    onChange={handleOnChangeSettings()}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="text.foreground" className="block">
                  Color
                </label>
                <div>
                  <input
                    type="text"
                    value={selectedElement.foreground}
                    className="text-black border border-slate-200 hover:border-slate-400 p-1"
                    name="text.foreground"
                    onChange={handleOnChangeSettings()}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="text.background" className="block">
                  Background
                </label>
                <div>
                  <input
                    type="text"
                    value={selectedElement.background}
                    className="text-black border border-slate-200 hover:border-slate-400 p-1"
                    name="text.background"
                    onChange={handleOnChangeSettings()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ">
                  <input
                    type="checkbox"
                    id="default-toggle"
                    className="sr-only peer"
                    checked={selectedElement.rounded || false}
                    name="text.rounded"
                    onChange={handleOnChangeSettings()}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  <span className="ml-3">Rounded</span>
                </label>
              </div>

              {selectedElement.onDelete && (
                <div>
                  <button
                    type="button"
                    onClick={() => selectedElement.onDelete && selectedElement.onDelete(selectedElement.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          )}
          {selectedElement?.type === "editor" && (
            <li className="p-3  space-y-3">
              <h5 className="text-base font-bold">Code</h5>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="editor.fontSize" className="block">
                    Font size
                  </label>
                  <input
                    className="text-black border border-slate-200 hover:border-slate-400 p-1"
                    max={32}
                    min={10}
                    name="editor.fontSize"
                    onChange={handleOnChangeSettings()}
                    type="number"
                    value={selectedElement.fontSize}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="canvas.background" className="block">
                    Language
                  </label>
                  <select
                    name="editor.language"
                    value={selectedElement.language}
                    onChange={handleOnChangeSettings()}
                    className="w-full p-1 border border-slate-200 hover:border-slate-400 hover:border"
                  >
                    <option value="asm">Assembly</option>
                    <option value="apache">Apache</option>
                    <option value="bash">Bash</option>
                    <option value="clojure">Clojure</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="css">CSS</option>
                    <option value="dockerfile">Dockerfile</option>
                    <option value="go">Go</option>
                    <option value="gql">GraphQL</option>
                    <option value="html">HTML</option>
                    <option value="ini">Ini</option>
                    <option value="java">Java</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="javascript">JavaScript/Typescript</option>
                    <option value="json">JSON</option>
                    <option value="php">PHP</option>
                    <option value="plaintext">Plaintext</option>
                    <option value="powershell">PowerShell</option>
                    <option value="python">Python</option>
                    <option value="ruby">Ruby</option>
                    <option value="rust">Rust</option>
                    <option value="scala">Scala</option>
                    <option value="scss">SCSS</option>
                    <option value="sql">SQL</option>
                    <option value="swift">Swift</option>
                    <option value="xml">XML</option>
                    <option value="yaml">YAML</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="default-toggle" className="inline-flex relative items-center cursor-pointer ">
                    <input
                      type="checkbox"
                      id="default-toggle"
                      className="sr-only peer"
                      checked={selectedElement.lineNumbers || false}
                      name="editor.lineNumbers"
                      onChange={handleOnChangeSettings()}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    <span className="ml-3">Line numbers</span>
                  </label>
                </div>
              </div>
              {selectedElement.onDelete && (
                <div>
                  <button
                    type="button"
                    onClick={() => selectedElement.onDelete && selectedElement.onDelete(selectedElement.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          )}

          <li className="p-3 space-y-3">
            <h5 className="font-bold text-base">Canvas</h5>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="canvas.background" className="block">
                  Background
                </label>
                <textarea
                  name="canvas.background"
                  value={canvasSettings.background}
                  onChange={handleOnChangeSettings()}
                  className={`border border-slate-200 hover:border-slate-400 p-1 w-full resize-y font-mono`}
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="canvas.height" className="block">
                  Height
                </label>
                <input
                  type="number"
                  name="canvas.height"
                  min={500}
                  value={canvasSettings.height}
                  onChange={handleOnChangeSettings()}
                  className={`border border-slate-200 hover:border-slate-400 p-1`}
                />
                <label htmlFor="canvas.background" className="block">
                  Width
                </label>
                <input
                  type="number"
                  name="canvas.width"
                  min={500}
                  value={canvasSettings.width}
                  onChange={handleOnChangeSettings()}
                  className={`border border-slate-200 hover:border-slate-400 p-1`}
                />
              </div>
            </div>
          </li>
        </ul>
      </form>
    </section>
  );
}

export default Sidebar;
