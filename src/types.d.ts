interface Explanation {
  source: string;
  processedAnswer: string;
  language: string;
  selection: string;
}

type Coordinates = {
  x: number;
  y: number;
};

type Size = {
  height: number;
  width: number;
};

type AspectRatio = "square" | "portrait" | "landscape" | "custom";
interface SettingsDefault {
  text: {
    fontSize: number;
    foreground: string;
    background: string;
  };
  editor: {
    fontSize: number;
    language: string;
    lineHeight: number;
    lineNumbers: boolean;
  };
  canvas: {
    aspectRatio: AspectRatio;
    background: string;
    height: number;
    width: number;
  };
}

interface CanvasSettings {
  background: string;
  height: number;
  width: number;
}

interface BasicElement {
  element: JSX.Element;
  id: number;
  key: string | number;
  type: string;
  visible?: boolean;
  zIndex?: number;
  onDelete?: (id: number) => void;
}
interface TextElement extends BasicElement {
  arrowId?: number;
  editorId?: number;
  fontSize: number;
  /**
   * When the range has changed or dissappear, then this text element is a zombie
   */
  zoombie?: boolean;
  pinned?: boolean;
  /**
   * If the text element is in loading mode, e.g. the editor's content changed.
   */
  loading?: boolean;
  main?: boolean;
  range?: monaco.Range;
  type: "text";
  foreground?: string;
  background?: string;
  rotate?: number;
  rounded?: boolean;
  backgroundOpacity?: number;
}

interface ArrowElement extends BasicElement {
  anchorAt?: "start" | "end";
  color?: string;
  curveness?: string | boolean | number;
  dashness?: boolean;
  endAnchor?: string[];
  editorId?: number;
  path?: "smooth" | "grid" | "straight";
  range?: monaco.Range;
  startAnchor?: string[];
  strokeWidth?: number;
  type: "arrow";
  opacity?: number;
}

interface EditorElement extends BasicElement {
  fontSize: number;
  language: string;
  lineNumbers?: boolean;
  type: "editor";
}

interface ImageElement extends BasicElement {
  type: "image";
  from: any;
  to: any;
}

type CanvasElement = ArrowElement | TextElement | EditorElement | ImageElement;

interface LocalSettings {
  locale: string;
  level: string;
}

type FlashMessageType = "error" | "success" | "warning" | "info";

interface User {
  createdAt: string;
  email: string;
  explanationsCount: number;
  features: string[];
  feedbacksCount: number;
  firstName: string;
  id: number;
  key: string;
  lastName: string;
  locale: string;
  privateKey: string;
  subscriptionPlan: string;
}

interface FlashMessage {
  type: FlashMessageType;
  message: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}
