import React from "react";
import { Status, allUseCases } from "./constants";
import { fmtDate, daysFromNow, useLocalStorage, toCsv , saveFile } from "./utils";
import { exportChecklistXlsx } from "./exporters";

import ProgressBar from "./components/ProgressBar";
import PhaseTag from "./components/PhaseTag";
import StatusPill from "./components/StatusPill";
import Badge from "./components/Badge";
import Drawer from "./components/Drawer";
import UseCaseSelector from "./components/UseCaseSelector";
import ConnectorChooser from "./components/ConnectorChooser";
import AppChooser from "./components/AppChooser";
import AddFeedbackButton from "./components/AddFeedbackButton";
import FeedbackPanel from "./components/FeedbackPanel";
import AddIssueButton from "./components/AddIssueButton";
import IssuePanel from "./components/IssuePanel";
import EditDueDateButton from "./components/EditDueDateButton";
import DueDateEditor from "./components/DueDateEditor";
import ContactSupportModal from "./components/ContactSupportModal";
import CompanyContacts from "./components/CompanyContacts";

const withBase = (p) =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${String(p).replace(/^\//, "")}`;

const tcsUrl = withBase("Terms_and_Conditions.pdf");
const conxifyGuideUrl = withBase("ConXify_Access_Guide.txt");

export default function App() {
  const initialChecklist = [
    // Phase 1
    { id: "1.1", phase: 1, title: "Intro to Catena-X", description: "Read the short explainer and download the intro deck.", required: true, status: Status.TODO, actions: ["Download", "Mark Done"], requires: [], dueDate: daysFromNow(3) },
    { id: "1.2", phase: 1, title: "Handover Package & Terms", description: "Download the handover package, review T&Cs, and accept to proceed.", required: true, status: Status.TODO, actions: ["Download", "Accept"], requires: ["1.1"], dueDate: daysFromNow(5) },

    // Phase 2
    { id: "2.1", phase: 2, title: "Company & Contacts", description: "Provide legal entity details and key contacts (IT, Legal, Business).", required: true, status: Status.LOCKED, actions: ["Submit"], requires: ["1.2:accepted"], dueDate: daysFromNow(10) },
    { id: "2.2", phase: 2, title: "Cofinity-X Registration", description: "Register your organization in Cofinity and procure BPN.", required: true, status: Status.LOCKED, actions: ["Refresh Status"], readOnly: true, requires: ["2.1:submitted"], dueDate: daysFromNow(14) },
    { id: "2.3", phase: 2, title: "Select Use Cases", description: "Choose one or more initial Catena-X use cases.", required: true, status: Status.LOCKED, actions: ["Select"], requires: ["2.2:ready"], dueDate: daysFromNow(15) },
    { id: "2.4", phase: 2, title: "Choose Connector", description: "Select one: T-Systems, Sovity, or Cofinity.", required: true, status: Status.LOCKED, actions: ["Choose"], requires: ["2.3:submitted"], dueDate: daysFromNow(16) },
    { id: "2.5", phase: 2, title: "Choose Application", description: "Pick ConXify or Other.", required: true, status: Status.LOCKED, actions: ["Choose"], requires: ["2.4:chosen"], dueDate: daysFromNow(17) },

    // Phase 3 (client-view simplified; ConXify path only)
    { id: "3.1", phase: 3, title: "ConXify Setup Accessible", description: "Your ConXify workspace is accessible and ready to use.", required: true, status: Status.LOCKED, actions: ["Access ConXify", "Download Access Guide", "Mark Ready"], requires: ["2.5:conxify"], dueDate: daysFromNow(20) },
    { id: "3.2", phase: 3, title: "Raise Issues (optional)", description: "If you face any issues, raise them here for our team.", required: false, status: Status.LOCKED, actions: ["Create Issue"], requires: ["3.1:ready"], dueDate: daysFromNow(22) },
    { id: "3.3", phase: 3, title: "Business UAT Sign-off", description: "Confirm that business validation is complete.", required: true, status: Status.LOCKED, actions: ["Provide Business Sign-off"], requires: ["3.1:ready"], dueDate: daysFromNow(24) },

    // Phase 4
    { id: "4.1", phase: 4, title: "Hypercare Readiness", description: "Confirm contacts, no critical issues, and readiness for go-live.", required: true, status: Status.LOCKED, actions: ["Confirm"], requires: ["2.5:chosen"], dueDate: daysFromNow(26) },
    { id: "4.2", phase: 4, title: "Weekly Check-ins & Feedback", description: "Provide updates/feedback during Hypercare as needed.", required: false, status: Status.LOCKED, actions: ["Add Feedback", "Mark All Resolved"], requires: ["4.1:confirmed"], dueDate: daysFromNow(28) },
    { id: "4.3", phase: 4, title: "Onboarding Complete – Written Sign-off", description: "Provide final confirmation that onboarding is complete.", required: true, status: Status.LOCKED, actions: ["Provide Sign-off"], requires: ["4.1:confirmed"], dueDate: daysFromNow(30) },
  ];

  const [items, setItems] = useLocalStorage("com2x_items_v6", initialChecklist);
  const [decision, setDecision] = useLocalStorage("com2x_decision_v6", { connector: "t-systems", app: undefined, useCases: [], contacts: {},  });
  const [system, setSystem] = useLocalStorage("com2x_system_v6", { bpn: "—", cofinityRegistered: false, completed: false, completedAt: null });
  const [feedbacks, setFeedbacks] = useLocalStorage("com2x_feedbacks_v6", []); // {id:'4.2', text:'..', status:'open'|'resolved', t:iso}
  const [issues, setIssues] = useLocalStorage("com2x_issues_v6", []);         // {id:'3.2', text:'..', status:'open'|'resolved', t:iso}
  const [supportOpen, setSupportOpen] = React.useState(false);

  const map = React.useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const isTokenMet = (token) => {
    const [t, key] = token.split(":");
    if (t === "2.4" && key === "chosen") return decision.connector !== undefined;
    if (t === "2.5" && key === "conxify") return decision.app === "conxify";
    if (t === "2.5" && key === "chosen") return decision.app !== undefined;

    const it = map.get(t);
    if (!it) return false;
    switch (key) {
      case "accepted": return it.status === Status.DONE || it.status === Status.REVIEW;
      case "submitted": return it.status === Status.REVIEW || it.status === Status.DONE;
      case "ready": return it.status === Status.DONE;
      case "confirmed": return it.status === Status.DONE;
      default: return it.status === Status.DONE;
    }
  };

  const visible = items.filter((it) => {
    if (it.phase === 2 && !isTokenMet("1.2:accepted")) return false;
    if (it.phase === 3 && !isTokenMet("2.5:conxify")) return false;
    if (it.phase === 4) {
      if (!isTokenMet("2.5:chosen")) return false;
      if (decision.app === "conxify" && !isTokenMet("3.3:confirmed")) return false;
    }
    return true;
  });

  // Unlock items when requirements are met
  React.useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        if (!it.requires?.length) return it;
        const allMet = it.requires.every((tok) => isTokenMet(tok));
        if (allMet && it.status === Status.LOCKED) return { ...it, status: Status.TODO };
        return it;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision, system, items.length]);

  // Derived status for 4.2 (feedback)
  const step42Feedback = feedbacks.filter((f) => f.id === "4.2");
  const step42Open = step42Feedback.some((f) => f.status !== "resolved");
  React.useEffect(() => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== "4.2") return x;
        if (step42Feedback.length === 0) return { ...x, status: x.status === Status.LOCKED ? x.status : Status.TODO };
        return { ...x, status: step42Open ? Status.DOING : Status.DONE };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbacks.length, step42Open]);

  // Derived status for 3.2 (issues)
  const step32Issues = issues.filter((f) => f.id === "3.2");
  const step32Open = step32Issues.some((f) => f.status !== "resolved");
  React.useEffect(() => {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== "3.2") return x;
        if (step32Issues.length === 0) return { ...x, status: x.status === Status.LOCKED ? x.status : Status.TODO };
        return { ...x, status: step32Open ? Status.DOING : Status.DONE };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues.length, step32Open]);

  // Progress among visible & required (count REVIEW as complete)
  const reqVisible = visible.filter((i) => i.required);
  const completedCount = reqVisible.filter((i) => i.status === Status.DONE || i.status === Status.REVIEW).length;
  const progress = reqVisible.length ? Math.round((completedCount / reqVisible.length) * 100) : 0;

  // UI State
  const [selected, setSelected] = React.useState(null);
  const [chooseConnectorOpen, setChooseConnectorOpen] = React.useState(false);
  const [chooseAppOpen, setChooseAppOpen] = React.useState(false);
  const [chooseUseCasesOpen, setChooseUseCasesOpen] = React.useState(false);
  const [qaOpen, setQaOpen] = React.useState(true);
  const [collapsedPhases, setCollapsedPhases] = React.useState({});

  const actions = {
    Download: (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DOING } : x))),
    "Mark Done": (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x))),
    Accept: (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.REVIEW } : x))),
    Submit: (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.REVIEW } : x))),
    Select: (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.REVIEW } : x))),
    Choose: (id, value) => {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x)));
      if (id === "2.4") setDecision((prev) => ({ ...prev, connector: value }));
      if (id === "2.5") setDecision((prev) => ({ ...prev, app: value }));
    },
    "Refresh Status": (id) => {
      setSystem({ ...system, bpn: "BPN-12AB-34CD", cofinityRegistered: true });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x)));
    },
    "Download Sample T&Cs": () => {
      const a = document.createElement("a");
      a.href = tcsUrl;
      a.download = "Terms_and_Conditions.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    "Download Access Guide": () => {
      const a = document.createElement("a");
      a.href = conxifyGuideUrl;
      a.download = "ConXify user manual v1.0.docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    "Mark Ready": (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x))),
    "Provide Business Sign-off": (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x))),
    Confirm: (id) => setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x))),
    "Provide Sign-off": (id) => {
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: Status.DONE } : x)));
      setSystem((prev) => ({ ...prev, completed: true, completedAt: new Date().toISOString() }));
      setItems((prev) => prev.map((x) => (x.id === "4.2" ? { ...x, status: Status.DONE } : x)));
    },
    /*"Export JSON": () => {
      const payload = { items, decision, system, feedbacks, issues };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      saveFile(blob, "com2x-onboarding-state.json");
    },*/
    "Export Checklist (XLSX)": () => {
      const blob = exportChecklistXlsx(items, decision, system);
      saveFile(blob, "com2x-checklist.xlsx");
    },
    "Export Feedback CSV": () => {
      const csv = toCsv(feedbacks);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveFile(blob, "com2x-feedback.csv");
    },
    "Export Issues CSV": () => {
      const csv = toCsv(issues);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      saveFile(blob, "com2x-issues.csv");
    },
    "Add Feedback": (id, text) => {
      if (!text?.trim()) return;
      setFeedbacks((prev) => [...prev, { id, text: text.trim(), status: "open", t: new Date().toISOString() }]);
    },
    "Toggle Feedback": (idx) => setFeedbacks((prev) => prev.map((f, i) => (i === idx ? { ...f, status: f.status === "open" ? "resolved" : "open" } : f))),
    "Mark All Feedback Resolved": (id) => setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: "resolved" } : f))),
    "Add Issue": (id, text) => {
      if (!text?.trim()) return;
      setIssues((prev) => [...prev, { id, text: text.trim(), status: "open", t: new Date().toISOString() }]);
    },
    "Toggle Issue": (idx) => setIssues((prev) => prev.map((f, i) => (i === idx ? { ...f, status: f.status === "open" ? "resolved" : "open" } : f))),
    "Mark All Issues Resolved": (id) => setIssues((prev) => prev.map((f) => (f.id === id ? { ...f, status: "resolved" } : f))),
    "Edit Due Date": (id, newDate) => {
      if (!newDate) return;
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, dueDate: newDate } : x)));
    },
    "Reset Demo": () => {
      localStorage.clear();
      window.location.reload();
    },
  };

  const phases = [1, 2, 3, 4].filter((p) => visible.some((i) => i.phase === p));

  // Support mailto
  const buildSupportMailto = (subject, message, includeState) => {
    const base = "support@com2x.com";
    const payload = includeState ? JSON.stringify({ items, decision, system, feedbacks, issues }, null, 2) : "";
    const body = `${message || ""}${includeState ? "\n\n---\nClient State\n" + payload : ""}`;
    const href = `mailto:${base}?subject=${encodeURIComponent(subject || "COM2X onboarding support")}&body=${encodeURIComponent(body)}`;
    return href;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Completion banner */}
      {system.completed && (
        <div className="bg-green-600 text-white text-center py-2 text-sm">
          Onboarding completed on {fmtDate(system.completedAt)}
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
          <div className="text-xl font-semibold">COM2X Onboarding</div>
          <div className="ml-auto w-72">
            <ProgressBar value={progress} />
            <div className="text-xs text-gray-500 mt-1">Overall progress: {progress}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {phases.map((phase) => (
            <section key={phase} className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <PhaseTag phase={phase} />
                <button
                  onClick={() => setCollapsedPhases((prev) => ({ ...prev, [phase]: !prev[phase] }))}
                  className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                >
                  {collapsedPhases[phase] ? "Expand" : "Collapse"}
                </button>
              </div>
              {phase === 2 && (
                <div className="text-xs text-gray-600 flex items-center gap-2 mb-2">
                  <span>BPN:</span>
                  <span className="font-mono">{system.bpn}</span>
                </div>
              )}
              {phase === 3 && (
                <div className="text-xs text-gray-600 mb-2">
                  ConXify path: <span className="font-semibold">{decision.app === "conxify" ? "Enabled" : "Hidden"}</span>
                </div>
              )}

              {!collapsedPhases[phase] && (
                <ul className="space-y-3">
                  {visible
                    .filter((i) => i.phase === phase)
                    .map((i) => {
                      const isOverdue = new Date(i.dueDate) < new Date() && i.status !== Status.DONE;
                      const feedbackList = i.id === "4.2" ? feedbacks.filter((f) => f.id === "4.2") : [];
                      const openFeedback = feedbackList.filter((f) => f.status === "open").length;
                      const issueList = i.id === "3.2" ? issues.filter((f) => f.id === "3.2") : [];
                      const openIssues = issueList.filter((f) => f.status === "open").length;

                      return (
                        <li key={i.id} className="relative border rounded-xl p-3 hover:shadow transition bg-white">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-xs font-mono text-gray-500">{i.id}</div>
                            <div className="flex-1">
                              <div className="font-medium">{i.title}</div>
                              <div className="text-sm text-gray-600">{i.description}</div>

                              {i.id === "2.3" && decision.useCases?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="text-xs text-gray-500">Use cases:</span>
                                  {decision.useCases.map((u) => (
                                    <Badge key={u} color="blue">
                                      {u}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {i.id === "2.4" && decision.connector && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="text-xs text-gray-500">Connector:</span>
                                  <Badge color="amber">
                                    {decision.connector === "t-systems"
                                      ? "T-Systems"
                                      : decision.connector.charAt(0).toUpperCase() + decision.connector.slice(1)}
                                  </Badge>
                                </div>
                              )}
                              {i.id === "2.5" && decision.app && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <span className="text-xs text-gray-500">Application:</span>
                                  <Badge color={decision.app === "conxify" ? "amber" : "gray"}>
                                    {decision.app === "conxify" ? "ConXify" : "Other"}
                                  </Badge>
                                </div>
                              )}

                              {/* Feedback badges */}
                              {i.id === "4.2" && feedbackList.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge color={openFeedback > 0 ? "amber" : "green"}>
                                    {openFeedback > 0 ? `${openFeedback} open` : "All resolved"}
                                  </Badge>
                                  <Badge color="indigo">{feedbackList.length} total</Badge>
                                </div>
                              )}
                              {/* Issue badges */}
                              {i.id === "3.2" && issueList.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge color={openIssues > 0 ? "amber" : "green"}>
                                    {openIssues > 0 ? `${openIssues} open` : "All resolved"}
                                  </Badge>
                                  <Badge color="indigo">{issueList.length} total</Badge>
                                </div>
                              )}

                              <div className="mt-2 flex items-center flex-wrap gap-2">
                                <StatusPill status={i.status} overdue={isOverdue} />
                                {i.required && <Badge color="red">Required</Badge>}
                                {i.dueDate && <Badge color={isOverdue ? "red" : "gray"}>Due {i.dueDate}</Badge>}
                                <EditDueDateButton id={i.id} current={i.dueDate} onSave={(d) => actions["Edit Due Date"](i.id, d)} />
                              </div>

                              {i.id === "1.2" && (
                                <div className="mt-2">
                                  
                                  <a href={tcsUrl} download className="px-3 py-2 rounded-lg border text-sm">
                                    Download T&Cs
                                  </a>
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap gap-2">
                                {i.actions?.map((action) => {
                                  if (i.id === "2.3" && action === "Select") {
                                    return (
                                      <button
                                        key={`${i.id}-${action}`}
                                        onClick={() => setChooseUseCasesOpen(true)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
                                      >
                                        Select Use Cases
                                      </button>
                                    );
                                  }
                                  if (i.id === "2.4" && action === "Choose") {
                                    return (
                                      <button
                                        key={`${i.id}-${action}`}
                                        onClick={() => setChooseConnectorOpen(true)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                                      >
                                        Choose Connector
                                      </button>
                                    );
                                  }
                                  if (i.id === "2.5" && action === "Choose") {
                                    return (
                                      <button
                                        key={`${i.id}-${action}`}
                                        onClick={() => setChooseAppOpen(true)}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                      >
                                        Choose Application
                                      </button>
                                    );
                                  }
                                  if (i.id === "3.1" && action === "Download Access Guide") {
                                    return (
                                      <button
                                        key={`${i.id}-${action}`}
                                        onClick={() => actions["Download Access Guide"]("3.1")}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50"
                                      >
                                        Download Access Guide
                                      </button>
                                    );
                                  }
                                  if (i.id === "3.2" && action === "Create Issue") {
                                    return <AddIssueButton key={`${i.id}-${action}`} onAdd={(text) => actions["Add Issue"]("3.2", text)} />;
                                  }
                                  if (i.id === "4.2" && action === "Add Feedback") {
                                    return <AddFeedbackButton key={`${i.id}-${action}`} onAdd={(text) => actions["Add Feedback"]("4.2", text)} />;
                                  }
                                  if (i.id === "4.2" && action === "Mark All Resolved") {
                                    return (
                                      <button
                                        key={`${i.id}-${action}`}
                                        onClick={() => actions["Mark All Feedback Resolved"]("4.2")}
                                        className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                                      >
                                        Mark All Resolved
                                      </button>
                                    );
                                  }
                                  return (
                                    <button
                                      key={`${i.id}-${action}`}
                                      onClick={() => actions[action](i.id)}
                                      className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50"
                                    >
                                      {action}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => setSelected(i)}
                                  className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-white shadow-xl rounded-2xl p-3 w-72">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Quick Actions</div>
            <button onClick={() => setQaOpen((o) => !o)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50">
              {qaOpen ? "Hide" : "Show"}
            </button>
          </div>
          {qaOpen && (
            <div className="mt-3 space-y-2">
              <button onClick={actions["Export JSON"]} className="w-full px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">
                Export checklist (JSON)
              </button>
              <button onClick={actions["Export Feedback CSV"]} className="w-full px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">
                Export feedback (CSV)
              </button>
              <button onClick={actions["Export Issues CSV"]} className="w-full px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">
                Export issues (CSV)
              </button>
              <button onClick={() => window.print()} className="w-full px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 text-sm">
                Print / Save as PDF
              </button>
              <button onClick={actions["Reset Demo"]} className="w-full px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-sm">
                Reset demo
              </button>
              <div className="flex gap-2">
                <button onClick={() => setSupportOpen(true)} className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-center text-sm">
                  Contact Support
                </button>
                <a
                  href="https://dass-x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-3 py-2 rounded-lg bg-white border text-center text-sm"
                >
                  AI Assistant
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Drawer */}
      <Drawer open={!!selected} onClose={() => setSelected(null)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">{selected?.title || "Details"}</div>
            <button onClick={() => setSelected(null)} className="text-sm px-3 py-1.5 rounded-lg border">
              Close
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-auto">
            <div className="text-sm text-gray-700">{selected?.description}</div>
            {selected && (
              <div className="text-xs text-gray-600 flex gap-3 flex-wrap">
                <div>ID: {selected.id}</div>
                <div>
                  <PhaseTag phase={selected.phase} />
                </div>
                {selected.dueDate && (
                  <div>
                    Due: <span className="font-mono">{selected.dueDate}</span>
                  </div>
                )}
              </div>
            )}
            {selected?.id === "2.2" && (
              <div className="text-sm">
                <div className="font-medium mb-1">Cofinity-X Status</div>
                <ul className="text-gray-600 list-disc ml-5">
                  <li>Registration: {system.cofinityRegistered ? "Completed" : "Pending"}</li>
                  <li>
                    BPN: <span className="font-mono">{system.bpn}</span>
                  </li>
                </ul>
              </div>
            )}
            {selected?.id === "3.1" && (
              <div className="text-sm">
                <div className="font-medium mb-2">Access ConXify</div>
                <a href="/ConXify_Access_Guide.txt" download className="text-blue-700 underline">
                  Download ConXify Access Guide
                </a>
              </div>
            )}
            {selected?.id === "4.2" && (
              <div className="text-sm">
                <div className="font-medium mb-2">Feedback</div>
                <FeedbackPanel feedbacks={feedbacks} onToggle={(idx) => actions["Toggle Feedback"](idx)} />
              </div>
            )}
            {selected?.id === "3.2" && (
              <div className="text-sm">
                <div className="font-medium mb-2">Issues</div>
                <IssuePanel issues={issues} onToggle={(idx) => actions["Toggle Issue"](idx)} />
              </div>
            )}

            <div className="pt-2 border-t">
              <div className="text-xs text-gray-500 mb-1">Actions</div>
              <div className="flex flex-wrap gap-2">
                {selected?.actions?.map((action) => {
                  if (selected.id === "2.3" && action === "Select") {
                    return <span key="noop" className="text-xs text-gray-500">Use the “Select Use Cases” button on the phase card.</span>;
                  }
                  if (selected.id === "4.2" && action === "Add Feedback") {
                    return <AddFeedbackButton key={`${selected.id}-${action}`} onAdd={(text) => actions["Add Feedback"]("4.2", text)} />;
                  }
                  if (selected.id === "3.2" && action === "Create Issue") {
                    return <AddIssueButton key={`${selected.id}-${action}`} onAdd={(text) => actions["Add Issue"]("3.2", text)} />;
                  }
                  if (selected.id === "4.2" && action === "Mark All Resolved") {
                    return (
                      <button
                        key={`${selected.id}-${action}`}
                        onClick={() => actions["Mark All Feedback Resolved"]("4.2")}
                        className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Mark All Resolved
                      </button>
                    );
                  }
                  if (action === "Download Access Guide") {
                    return (
                      <button
                        key={`${selected.id}-${action}`}
                        onClick={() => actions["Download Access Guide"](selected.id)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-white border hover:bg-gray-50"
                      >
                        Download Access Guide
                      </button>
                    );
                  }
                  return (
                    <button
                      key={action}
                      onClick={() => actions[action](selected.id)}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gray-900 text-white hover:bg-black"
                    >
                      {action}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline due date editor */}
            {selected && (
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500 mb-1">Due Date</div>
                <DueDateEditor id={selected.id} current={selected.dueDate} onSave={(d) => actions["Edit Due Date"](selected.id, d)} />
              </div>
            )}
          </div>
        </div>
      </Drawer>

      {/* Use Case Selector */}
      <Drawer open={chooseUseCasesOpen} onClose={() => setChooseUseCasesOpen(false)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Select Use Cases</div>
            <button onClick={() => setChooseUseCasesOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border">
              Close
            </button>
          </div>
          <div className="p-4 overflow-auto">
            <UseCaseSelector
              allUseCases={allUseCases}
              selected={decision.useCases}
              onSave={(list) => {
                setDecision((prev) => ({ ...prev, useCases: list }));
                setItems((prev) => prev.map((x) => (x.id === "2.3" ? { ...x, status: Status.REVIEW } : x)));
                setChooseUseCasesOpen(false);
              }}
            />
          </div>
        </div>
      </Drawer>

      {/* Connector Chooser */}
      <Drawer open={chooseConnectorOpen} onClose={() => setChooseConnectorOpen(false)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Choose Connector</div>
            <button onClick={() => setChooseConnectorOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border">
              Close
            </button>
          </div>
          <div className="p-4 overflow-auto">
            <ConnectorChooser
              defaultKey={decision.connector}
              onConfirm={(choice) => {
                setItems((prev) => prev.map((x) => (x.id === "2.4" ? { ...x, status: Status.DONE } : x)));
                setDecision((prev) => ({
                  ...prev,
                  connector: choice,
                  app: (choice === "custom" && prev.app === "conxify") ? undefined : prev.app
                }));
                setChooseConnectorOpen(false);
              }}
            />
          </div>
        </div>
      </Drawer>

      {/* App Chooser */}
      <Drawer open={chooseAppOpen} onClose={() => setChooseAppOpen(false)}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="font-semibold">Choose Application</div>
            <button onClick={() => setChooseAppOpen(false)} className="text-sm px-3 py-1.5 rounded-lg border">
              Close
            </button>
          </div>
          <div className="p-4 overflow-auto">
            <AppChooser
              disabledConxify={decision?.connector==='custom'}
              onConfirm={(choice) => {
                setItems((prev) => prev.map((x) => (x.id === "2.5" ? { ...x, status: Status.DONE } : x)));
                setDecision((prev) => ({ ...prev, app: choice }));
                setChooseAppOpen(false);
              }}
            />
          </div>
        </div>
      </Drawer>

      {/* Contact Support Modal */}
      <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} buildMailto={buildSupportMailto} />

      <footer className="max-w-7xl mx-auto p-6 text-center text-xs text-gray-500">
        © COM2X Onboarding – Client View (Wireframe)
      </footer>
    </div>
  );
}
