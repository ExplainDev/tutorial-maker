export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://api.explain.dev";

export const DEFAULT_SETTINGS: SettingsDefault = {
  canvas: {
    aspectRatio: "landscape",
    height: 1080 * (4 / 5),
    width: 1350 * (4 / 5),
    background: `linear-gradient(180deg, #A6FFCB, #12D8FA, #1FA2FF)`,
  },
  editor: {
    fontSize: 14,
    language: "javascript",
    lineHeight: 1.5,
    lineNumbers: false,
  },
  text: {
    fontSize: 14,
    foreground: "white",
    background: "black",
  },
};
const CANVAS_BACKGROUND: string[] = [
  `linear-gradient(to right, #11998e, #38ef7d)`,
  `linear-gradient(180deg, #A6FFCB, #12D8FA, #1FA2FF)`,
  `linear-gradient(to bottom right, #FBE45F, #71A437`,
  `linear-gradient(to bottom right, #F5445B, #BE60B1)`,
  `linear-gradient(to bottom right, #48AAD0, #3E30D7)`,
  `linear-gradient(to bottom right, #484ADB, #68F6CE)`,
  `linear-gradient(to bottom left, #31D539, #E9B43B)`,
  `linear-gradient(to bottom left, #DEA59E, #1CE6E5)`,
  `linear-gradient(to bottom right, #D2F6FA, #14D2CB)`,
  `radial-gradient(ellipse at center, #C1A78F, #C34C6A)`,
  `radial-gradient(ellipse at bottom, #E5EEC8, #3ADEFA)`,
  `radial-gradient(ellipse at left, #CA7BE8, #E7B399)`,
  `radial-gradient( #31DA79, #3EAA48)`,
  `linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)`,
];

export const DEFAULT_ARROW_ANCHOR_AT = "start";
export const DEFAULT_ARROW_COLOR = "white";
export const DEFAULT_ARROW_CURVENESS = 0.25;
export const DEFAULT_ARROW_DASHNESS = false;
export const DEFAULT_ARROW_HEAD_SIZE = 4;
export const DEFAULT_ARROW_MAX_STROKE_WIDTH = 10;
export const DEFAULT_ARROW_MIN_STROKE_WIDTH = 1;
export const DEFAULT_ARROW_OPACITY = 0.8;
export const DEFAULT_ARROW_PATH: "grid" | "smooth" | "straight" = "smooth";
export const DEFAULT_ARROW_SHOW_HEAD = true;
export const DEFAULT_ARROW_SHOW_TAIL = false;
export const DEFAULT_ARROW_STROKE_WIDTH = 4;
export const DEFAULT_ARROW_TAIL_SIZE = 3;
export const DEFAULT_ARROW_TAIL_SHAPE = undefined;

export const DEFAULT_TEXT_FOREGROUND = "black";
export const DEFAULT_TEXT_BACKGROUND = "transparent";
export const DEFAULT_TEXT_FONT_SIZE = 17;
export const DEFAULT_TEXT_MAX_SIZE = 72;
export const DEFAULT_TEXT_MIN_SIZE = 8;
export const DEFAULT_TEXT_LARGE_FONT_SIZE = 27;
export const DEFAULT_TEXT_PLACEHOLDER = `✨How it works✨
 
 
👩‍💻 Write some code below to get an explanation using AI\n
👆 Select portions of code within your snippet for more details\n
🧑‍🎨 Drag & customize the elements in your tutorial!`;
export const DEFAULT_CANVAS_HEIGHT = 750;
export const DEFAULT_CANVAS_WIDTH = 1000;
export const DEFAULT_CANVAS_BACKGROUND = CANVAS_BACKGROUND[Math.floor(Math.random() * CANVAS_BACKGROUND.length)];

export const ERROR_CODE_USER_NOT_FOUND = "USER_NOT_FOUND";
export const ERROR_CODE_RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";

export const DEFAULT_EDITOR_LAST_CHANGE_TIMEOUT = 1000;
export const DEFAULT_EDITOR_FONT_SIZE = 15;
export const DEFAULT_EDITOR_LINE_HEIGHT = 1.5;
export const DEFAULT_EDITOR_LINE_NUMBERS = false;
export const DEFAULT_EDITOR_MIN_SELECTION = 1;
export const DEFAULT_EDITOR_TEXT_WIDTH = "auto";
export const DEFAULT_EDITOR_TAB_SIZE = 2;
export const DEFAULT_EDITOR_FONT_FAMILY = `"JetBrains Mono", monospace`;
export const DEFAULT_EDITOR_LANGUAGE = "javascript";
export const DEFAULT_EDITOR_MAX_WIDTH = 0.99;
