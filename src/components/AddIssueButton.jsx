import React from "react";

export default function AddIssueButton({ onAdd }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  return (
    <div className="relative">
      {!open && (
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50">
          Create Issue
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-start justify-end p-4 sm:items-center sm:justify-center">
          <div className="bg-white border rounded-xl p-3 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-sm">Create Issue</div>
              <button onClick={() => { setOpen(false); setText(""); }} className="text-xs px-2 py-1 rounded border">Close</button>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full border rounded-lg p-2 text-sm" placeholder="Describe the issue..." />
            <div className="mt-2 flex gap-2 justify-end">
              <button onClick={() => { onAdd(text); setText(""); setOpen(false); }} className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black">Submit</button>
              <button onClick={() => { setOpen(false); setText(""); }} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
