import React from "react";

const LABELS = {
  "t-systems": "T-Systems",
  "sovity": "Sovity",
  "cofinity": "Cofinity",
  "custom": "Custom",
};

const SUPPORTED = new Set(["t-systems", "sovity", "cofinity"]); // supported by ConXify

export default function ConnectorChooser({ defaultKey = "t-systems", onConfirm }) {
  const [choice, setChoice] = React.useState(defaultKey);
  const options = ["t-systems", "sovity", "cofinity", "custom"];
  return (
    <div>
      <div className="grid sm:grid-cols-4 gap-3">
        {options.map((k) => {
          const supported = SUPPORTED.has(k);
          return (
            <label key={k} className="relative border rounded-xl p-3 flex items-start gap-2 cursor-pointer hover:bg-gray-50">
              <span className={"absolute top-0 right-0 text-[10px] px-2 py-0.5 rounded-bl-lg " + (supported ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")}>
                {supported ? "ConXify supported" : "Not supported"}
              </span>
              <input
                type="radio"
                name="connector"
                className="mt-1"
                defaultChecked={choice === k}
                onChange={() => setChoice(k)}
              />
              <div>
                <div className="font-medium text-sm">{LABELS[k]}</div>
                <div className="text-xs text-gray-600">Connector option</div>
              </div>
            </label>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onConfirm(choice)} className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700">
          Confirm selection
        </button>
      </div>
    </div>
  );
}
