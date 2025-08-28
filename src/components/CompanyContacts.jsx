import React from "react";

export default function CompanyContacts({ value, onChange }) {
  const v = value || {};
  const set = (key, k2) => (e) => {
    const next = { ...v, [key]: { ...(v[key] || {}), [k2]: e.target.value } };
    onChange?.(next);
  };
  const Row = ({ label, keyName }) => (
    <div className="grid sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-gray-600 mb-1">{label} — Name (optional)</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={(v[keyName]?.name ?? "")}
          onChange={set(keyName, "name")}
          placeholder={`Enter ${label} name`}
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">{label} — Email (optional)</label>
        <input
          type="email"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          value={(v[keyName]?.email ?? "")}
          onChange={set(keyName, "email")}
          placeholder={`Enter ${label} email`}
        />
      </div>
    </div>
  );
  return (
    <div className="space-y-3">
      <Row label="IT Stakeholder" keyName="it" />
      <Row label="Legal Representative" keyName="legal" />
      <Row label="Business Stakeholder" keyName="business" />
      <Row label="Sustainability Manager" keyName="sustainability" />
    </div>
  );
}
