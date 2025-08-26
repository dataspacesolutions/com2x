import React from "react";
import Modal from "./Modal";

export default function ContactSupportModal({ open, onClose, buildMailto }) {
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [includeState, setIncludeState] = React.useState(true);

  const mailtoHref = buildMailto(subject, message, includeState);

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div className="text-lg font-semibold">Contact Support</div>
        <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg border">
          Close
        </button>
      </div>
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Subject</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="COM2X onboarding support"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Message</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue..."
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeState} onChange={(e) => setIncludeState(e.target.checked)} />
          Include current onboarding state in email body
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <a href={mailtoHref} onClick={onClose} className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm text-center">
            Open Email
          </a>
          <button onClick={onClose} className="px-3 py-2 rounded-lg border text-sm">Cancel</button>
        </div>
        <div className="text-[11px] text-gray-500">
          Email opens in your default mail client to <span className="font-mono">support@com2x.com</span>.
        </div>
      </div>
    </Modal>
  );
}
