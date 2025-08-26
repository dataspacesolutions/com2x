import React from "react";
import { classNames } from "../utils";

export default function Modal({ open, onClose, children }) {
  return (
    <div className={classNames("fixed inset-0 z-50 flex items-center justify-center", open ? "" : "hidden")}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[92%] sm:w-[520px] max-w-[95vw] p-4">
        {children}
      </div>
    </div>
  );
}
