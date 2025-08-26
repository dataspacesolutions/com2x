import React from "react";

export default function DueDateEditor({ id, current, onSave }) {
  const [val, setVal] = React.useState(current || "");
  return (
    <div className="flex items-center gap-2">
      <input type="date" className="border rounded px-2 py-1 text-sm" value={val} onChange={(e) => setVal(e.target.value)} />
      <button onClick={() => onSave(val)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black">
        Save
      </button>
    </div>
  );
}
