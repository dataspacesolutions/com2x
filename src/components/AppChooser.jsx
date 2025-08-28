import React from "react";
import { classNames } from "../utils";

export default function AppChooser({ onConfirm, disabledConxify = false }) {
  const options = [
    { key: "conxify", title: "ConXify", desc: "Managed path: setup + connector + testing together." },
    { key: "other", title: "Other", desc: "Proceed without ConXify; Phase 3 hidden." },
  ];
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {options.map((opt) => {
        const disabled = opt.key === "conxify" && disabledConxify;
        return (
          <div key={opt.key} className={"border rounded-xl p-4 " + (disabled ? "opacity-50 pointer-events-none" : "")}>
            <div className="font-medium">{opt.title}</div>
            <div className="text-sm text-gray-600">{opt.desc}</div>
            {opt.key === "conxify" && disabled && (
              <div className="mt-2 text-xs text-rose-600">Disabled: ConXify not available for Custom connector</div>
            )}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => onConfirm(opt.key)}
                disabled={disabled}
                className={classNames(
                  "px-3 py-1.5 text-sm rounded-lg text-white",
                  opt.key === "conxify" ? "bg-amber-600 hover:bg-amber-700" : "bg-gray-900 hover:bg-black"
                )}
              >
                Choose {opt.title}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
