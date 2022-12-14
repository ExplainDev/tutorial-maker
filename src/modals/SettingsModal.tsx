import React, { useEffect, useRef, useState } from "react";

import { getLocalSettings, initSettings, setLocalSettings } from "../storage/settings";

import "./SettingsModal.css";

export default function SettingsModal({ isOpen, onClose }: ModalProps) {
  const [locale, setLocale] = useState<string>();
  const [level, setLevel] = useState<string>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const localSettings = getLocalSettings() || initSettings();

    setLocale(localSettings?.locale);
    setLevel(localSettings?.level);
    dialogRef.current?.removeAttribute("open");

    isOpen && dialogRef.current?.showModal();
  }, [isOpen]);

  dialogRef.current?.addEventListener("close", onClose);
  function handleOnChangeSettings() {
    return (event: React.FormEvent<HTMLSelectElement>) => {
      const { value } = event.currentTarget;

      switch (event.currentTarget.name) {
        case "locale": {
          setLocale(value);

          setLocalSettings({ locale: value });

          break;
        }
        case "level": {
          setLevel(value);
          setLocalSettings({ level: value });
          break;
        }
      }
    };
  }

  return (
    <dialog ref={dialogRef}>
      <section className="settings p-5 ">
        <h3 className="mb-3">Settings</h3>
        <form method="dialog">
          <div className="flex flex-col space-y-4 ">
            <div>
              <label htmlFor="locale">
                Language
                <select
                  name="locale"
                  onChange={handleOnChangeSettings()}
                  value={locale}
                  className="w-full p-1 border border-slate-200 hover:border-slate-400 hover:border"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </label>
            </div>
            <div>
              <label htmlFor="level">
                Explanation level
                <select
                  className="w-full p-1 border border-slate-200 hover:border-slate-400 hover:border"
                  name="level"
                  onChange={handleOnChangeSettings()}
                  value={level}
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
            </div>
            <button>Close</button>
          </div>
        </form>
      </section>
    </dialog>
  );
}
