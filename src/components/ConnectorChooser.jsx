import React from "react";

export default function ConnectorChooser({ defaultKey = "t-systems", onConfirm }) {
  const [choice, setChoice] = React.useState(defaultKey);
  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-3">
        {["t-systems", "sovity", "cofinity"].map((k) => (
          <label key={k} className="border rounded-xl p-3 flex items-start gap-2 cursor-pointer">
            <input type="radio" name="connector" className="mt-1" defaultChecked={choice === k} onChange={() => setChoice(k)} />
            <div>
              <div className="font-medium text-sm">{k === "t-systems" ? "T-Systems" : k.charAt(0).toUpperCase() + k.slice(1)}</div>
              <div className="text-xs text-gray-600">Connector option</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => onConfirm(choice)} className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700">
          Confirm selection
        </button>
      </div>
    </div>
  );
}
