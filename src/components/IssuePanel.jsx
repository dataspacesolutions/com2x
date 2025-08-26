import React from "react";
import { classNames } from "../utils";

export default function IssuePanel({ issues = [], onToggle }) {
  if (!issues.length) return <div className="text-gray-500 text-sm">No issues yet. Use “Create Issue” to log one.</div>;
  return (
    <ul className="space-y-2">
      {issues.map((f, idx) => (
        <li key={idx} className="border rounded-lg p-2">
          <div className="flex items-center justify-between">
            <div className="text-sm whitespace-pre-wrap">{f.text}</div>
            <button
              onClick={() => onToggle(idx)}
              className={classNames("text-xs px-2 py-1 rounded", f.status === "open" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800")}
            >
              {f.status === "open" ? "Resolve" : "Reopen"}
            </button>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {f.status} · {new Date(f.t).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}
