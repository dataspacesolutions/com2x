import React from "react";

export default function UseCaseSelector({ allUseCases, selected = [], onSave }) {
  const [draft, setDraft] = React.useState(new Set(selected));
  const toggle = (u) => {
    const s = new Set(draft);
    s.has(u) ? s.delete(u) : s.add(u);
    setDraft(s);
  };
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3">
        {allUseCases.map((u) => (
          <label key={u} className="border rounded-xl p-3 flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="mt-1" defaultChecked={draft.has(u)} onChange={() => toggle(u)} />
            <div>
              <div className="font-medium text-sm">{u}</div>
              <div className="text-xs text-gray-600">Include this use case in your onboarding scope.</div>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onSave(Array.from(draft))}
          className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
        >
          Save selection
        </button>
      </div>
    </div>
  );
}
