import { toPng } from "html-to-image";
import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";
import SettingsModal from "./modals/SettingsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro"; // <-- import styles to be used
import { FeedbackModal } from "./modals/FeedbackModal";

interface HeaderProps {
  handleOnClickAddElement: (type: "editor" | "text") => void;
  frameRef: React.RefObject<HTMLDivElement>;
}

function Header({ frameRef, handleOnClickAddElement }: React.PropsWithChildren<HeaderProps>) {
  const [isOpenModalSettings, setIsOpenModalSettings] = useState<boolean>(false);
  const [isOpenModalFeedback, setIsOpenModalFeedback] = useState<boolean>(false);

  const onClickShare = useCallback(() => {
    setIsOpenModalFeedback(true);

    const THREE_SECONDS = 3000;

    setTimeout(() => {
      if (frameRef.current === null) return;

      toPng(frameRef.current, { cacheBust: true, pixelRatio: 2 })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "explaindev.png";
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error(err);
        });
    }, THREE_SECONDS);
  }, [frameRef]);

  return (
    <>
      <header className="w-full">
        <div className="relative flex items-center">
          <div className="flex-none ml-5">
            <a
              href="https://explain.dev"
              target={"_blank"}
              rel="noreferrer"
              className="font-bold  px-5 text-lg h-12 flex items-center"
            >
              ExplainDev
            </a>
          </div>
          <div className="flex-none ml-5 space-x-3">
            <button onClick={() => handleOnClickAddElement("editor")} className="font-bold px-3  h-12" title="Add Code">
              <FontAwesomeIcon icon={solid("code")} className="mr-3" /> Add Code
            </button>
            <button onClick={() => handleOnClickAddElement("text")} className="font-bold px-3  h-12" title="Add Text">
              <FontAwesomeIcon icon={solid("font")} className="mr-3" />
              Add Text
            </button>
          </div>
          <div className="relative flex items-center ml-auto space-x-3 mr-5 ">
            <button onClick={() => setIsOpenModalSettings(true)} className="font-bold px-3  h-12 text-sm ">
              Settings
            </button>
            <Link to={`/login?redirect=${window.location.pathname}`}>
              <button className="font-bold px-3  h-12 text-sm ">Login</button>
            </Link>
            <button onClick={onClickShare} className="download-btn text-black font-bold px-3 h-8 text-sm rounded ">
              Share Screenshot
            </button>
          </div>
        </div>
      </header>
      <SettingsModal
        isOpen={isOpenModalSettings}
        onClose={() => {
          setIsOpenModalSettings(false);
        }}
      />
      <FeedbackModal
        isOpen={isOpenModalFeedback}
        onClose={() => {
          setIsOpenModalFeedback(false);
        }}
      />
    </>
  );
}

export default Header;
