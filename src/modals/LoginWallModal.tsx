import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import "./LoginWallModal.css";

interface LoginWallModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function LoginWallModal({ isOpen = false, onClose }: LoginWallModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.removeAttribute("open");
    isOpen && dialogRef.current?.showModal();
  }, [isOpen]);

  dialogRef.current?.addEventListener("close", onClose);

  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef}>
      <section className="login-wall px-3 py-5 text-center">
        <h1 className="mb-3">Whoa! You're coding fast!</h1>
        <p className="mb-5">Please login to continue using ExplainDev</p>
        <div className="text-center space-y-5">
          <div>
            <Link to={`/login?redirect=${window.location.pathname}`}>
              <button className="font-bold px-2 py-1 text-sm ">Login</button>
            </Link>
          </div>
          <hr />
          <div>
            <a rel="noreferrer" href="https://explaindev.typeform.com/signup?origin=webapp" target="_blank">
              <button className="font-bold px-2 py-1 text-sm ">Create an account</button>
            </a>
          </div>
        </div>
      </section>
    </dialog>
  );
}
