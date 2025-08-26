import React from "react";

export default function EditDueDateButton({ id, current, onSave }) {
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(current || "");
  return (
    <div className="relative inline-block">
      {!open && (
        <button onClick={() => setOpen(true)} className="text-xs px-2 py-0.5 rounded border hover:bg-gray-50">
          Edit due
        </button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 right-0 bg-white border rounded-lg p-2 shadow-lg w-56">
          <input type="date" className="w-full border rounded px-2 py-1 text-sm" value={val} onChange={(e) => setVal(e.target.value)} />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                onSave(val);
                setOpen(false);
              }}
              className="px-2 py-1 rounded bg-gray-900 text-white text-xs"
            >
              Save
            </button>
            <button onClick={() => setOpen(false)} className="px-2 py-1 rounded border text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
