import * as XLSX from "xlsx";

// items: array of steps; decision/system: objects you already have
export function exportChecklistXlsx(items, decision, system) {
  // Flatten rows
  const rows = items.map((it) => ({
    ID: it.id,
    Phase: it.phase,
    Title: it.title,
    Status: it.status,
    "Due Date": it.dueDate || "",
  }));

  // Sheet 1: Checklist
  const ws1 = XLSX.utils.json_to_sheet(rows, { header: ["ID","Phase","Title","Status","Due Date"] });

  // Sheet 2: Choices (connector/app/use-cases + contacts)
  const choices = [{
    Connector: decision?.connector || "",
    Application: decision?.app || "",
    UseCases: (decision?.useCases || []).join(", "),
    IT_Name: decision?.contacts?.it?.name || "",
    IT_Email: decision?.contacts?.it?.email || "",
    Legal_Name: decision?.contacts?.legal?.name || "",
    Legal_Email: decision?.contacts?.legal?.email || "",
    Business_Name: decision?.contacts?.business?.name || "",
    Business_Email: decision?.contacts?.business?.email || "",
    Sustainability_Name: decision?.contacts?.sustainability?.name || "",
    Sustainability_Email: decision?.contacts?.sustainability?.email || "",
  }];
  const ws2 = XLSX.utils.json_to_sheet(choices);

  // Build workbook and save
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "Checklist");
  XLSX.utils.book_append_sheet(wb, ws2, "Selections");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
