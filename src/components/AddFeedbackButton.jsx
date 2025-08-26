import React from "react";

export default function AddFeedbackButton({ onAdd }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  return (
    <div className="relative">
      {!open && (
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50">
          Add Feedback
        </button>
      )}
      {open && (
        <div className="absolute z-20 mt-1 right-0 bg-white border rounded-lg p-2 shadow-lg w-64">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            className="w-full border rounded-lg p-2 text-sm"
            placeholder="Write your feedback..."
          />
          <div className="mt-2 flex gap-2 justify-end">
            <button
              onClick={() => {
                onAdd(text);
                setText("");
                setOpen(false);
              }}
              className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
            >
              Submit
            </button>
            <button onClick={() => { setOpen(false); setText(""); }} className="px-3 py-1.5 text-sm rounded-lg border">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
