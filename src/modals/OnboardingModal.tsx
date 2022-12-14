import React, { useEffect, useRef } from "react";

import "./OnboardingModal.css";

export function OnboardingModal(props: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.removeAttribute("open");
    props.isOpen && dialogRef.current?.showModal();
  }, [props.isOpen]);

  dialogRef.current?.addEventListener("close", props.onClose);

  const videoId = "LcKhSe0iVyA";
  if (!props.isOpen) return null;
  return (
    <dialog ref={dialogRef}>
      <section className="onboarding bg-white p-6 space-y-5">
        <h1 className="text-center font-bold">Your one minute tutorial!</h1>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="ExplainDev for Code Tutorials"
        />
        <div className="text-center">
          <button className="px-5 py-2 bg-slate-900 text-white" onClick={() => props.onClose()}>
            Close tutorial
          </button>
        </div>
      </section>
    </dialog>
  );
}
