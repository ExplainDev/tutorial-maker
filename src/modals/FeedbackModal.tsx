import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import React, { useEffect, useRef, useState } from "react";
import HttpClient from "../http/HttpClient";

import "./LoginWallModal.css";

export function FeedbackModal(props: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [where, setWhere] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const { getData: getVisitorData } = useVisitorData();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    dialogRef.current?.removeAttribute("open");
    props.isOpen && dialogRef.current?.showModal();
  }, [props.isOpen]);

  dialogRef.current?.addEventListener("close", props.onClose);

  async function submitFeedback(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const httpClient = new HttpClient();

    const visitorData = await getVisitorData();

    httpClient.post("/api/tutorial/feedback", {
      body: JSON.stringify({
        where,
        feedback,
      }),
      headers: {
        "X-ExplainDev-client-origin-visitor-id": visitorData ? visitorData.visitorId : "",
      },
    });

    formRef.current?.reset();
    setWhere("");
    setFeedback("");
    props.onClose();
  }

  if (!props.isOpen) return null;

  return (
    <dialog ref={dialogRef}>
      <section className="login-wall px-5 py-4">
        <h1 className="mb-3 font-bold">Two quick questions...</h1>
        <div className="space-y-3">
          <form onSubmit={submitFeedback} ref={formRef}>
            <div>
              <p className="mb-3">Where will you share this tutorial?</p>

              <div className="space-x-2">
                <input
                  type={"radio"}
                  name="where"
                  id="myself"
                  checked={where === "myself"}
                  onChange={() => setWhere("myself")}
                />
                <label htmlFor="myself">Only for myself</label>
              </div>
              <div className="space-x-2">
                <input type={"radio"} name="where" id="work" checked={where === "work"} onChange={() => setWhere("work")} />
                <label htmlFor="work">Work</label>
              </div>
              <div className="space-x-2">
                <input
                  type={"radio"}
                  name="where"
                  id="social"
                  checked={where === "social"}
                  onChange={() => setWhere("social")}
                />
                <label htmlFor="social">Social Media</label>
              </div>
              <div className="space-x-2">
                <input
                  type={"radio"}
                  name="where"
                  id="training"
                  checked={where === "training"}
                  onChange={() => setWhere("training")}
                />
                <label htmlFor="training">School / Training</label>
              </div>
            </div>
            <div className="space-y-2">
              <div>How could we improve this tool for you?</div>
              <textarea
                rows={3}
                placeholder="Please share..."
                maxLength={250}
                className="w-full border border-slate-200 p-1"
                value={feedback}
                onChange={(e) => {
                  setFeedback(e.target.value);
                }}
              ></textarea>
            </div>
            <button type="submit" className="w-full px-5 py-2 bg-slate-900 text-white">
              Send
            </button>
          </form>
        </div>
      </section>
    </dialog>
  );
}
