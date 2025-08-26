import React from "react";
import { classNames } from "../utils";

export default function Drawer({ open, onClose, children }) {
  return (
    <div className={classNames("fixed inset-0 z-50", open ? "" : "pointer-events-none")}>
      <div
        className={classNames(
          "absolute inset-0 bg-black/30 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={classNames(
          "absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {children}
      </div>
    </div>
  );
}
