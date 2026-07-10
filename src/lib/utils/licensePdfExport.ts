import type { LicenseSummary, UserLicenseSummary } from "@/src/types/licenses";

interface LicenseStats {
  totalLicenses: number;
  totalAssigned: number;
  totalAvailable: number;
  unlicensedUsers: number;
  inactive30: number;
  activeThisWeek: number;
  utilisationPct: number;
}

export async function exportLicensePDF(
  licenses: LicenseSummary[],
  users: UserLicenseSummary[],
  stats: LicenseStats,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const now = new Date().toLocaleString();

  const BRAND = [22, 119, 255] as [number, number, number];
  const DARK = [15, 23, 42] as [number, number, number];
  const MUTED = [100, 116, 139] as [number, number, number];
  const LIGHT = [241, 245, 249] as [number, number, number];
  const WHITE = [255, 255, 255] as [number, number, number];
  const GREEN = [34, 197, 94] as [number, number, number];
  const ORANGE = [249, 115, 22] as [number, number, number];

  doc.setFillColor(...BRAND);
  doc.rect(0, 0, PAGE_W, 28, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("NexusOne — License Report", MARGIN, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${now}`, MARGIN, 19);
  doc.text(`${licenses.length} SKU${licenses.length !== 1 ? "s" : ""} · ${users.length} Users`, PAGE_W - MARGIN, 19, { align: "right" });

  let y = 36;

  const STAT_CARDS: { label: string; value: string; sub?: string; color?: [number, number, number] }[] = [
    { label: "Total Licenses", value: stats.totalLicenses.toLocaleString(), sub: "All SKUs" },
    { label: "Assigned", value: stats.totalAssigned.toLocaleString(), sub: `${stats.utilisationPct.toFixed(1)}% utilisation`, color: BRAND },
    { label: "Available", value: stats.totalAvailable.toLocaleString(), sub: "Ready to assign", color: GREEN },
    { label: "Unlicensed Users", value: stats.unlicensedUsers.toLocaleString(), sub: "No license", color: stats.unlicensedUsers > 0 ? ORANGE : undefined },
    { label: "Inactive 30+ Days", value: stats.inactive30.toLocaleString(), sub: "Potential waste", color: stats.inactive30 > 0 ? ORANGE : undefined },
    { label: "Active This Week", value: stats.activeThisWeek.toLocaleString(), sub: "Last 7 days", color: GREEN },
  ];

  const CARD_W = (CONTENT_W - 8) / 3;
  const CARD_H = 22;

  STAT_CARDS.forEach((card, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = MARGIN + col * (CARD_W + 4);
    const cy = y + row * (CARD_H + 4);

    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, cy, CARD_W, CARD_H, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...(card.color ?? DARK));
    doc.text(card.value, x + 5, cy + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(card.label, x + 5, cy + 16);
    if (card.sub) doc.text(card.sub, x + 5, cy + 20);
  });

  y += 2 * (CARD_H + 4) + 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("License Overview", MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["License Name", "Total", "Assigned", "Available", "Utilisation"]],
    body: licenses.map((l) => [
      l.name,
      l.total.toLocaleString(),
      l.consumed.toLocaleString(),
      l.available.toLocaleString(),
      `${l.total > 0 ? ((l.consumed / l.total) * 100).toFixed(1) : "0"}%`,
    ]),
    headStyles: { fillColor: BRAND, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7.5, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  if (y > 240) {
    doc.addPage();
    y = 16;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("User Licenses", MARGIN, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["User", "Email", "Licenses", "Count"]],
    body: users.map((u) => [
      u.displayName || "—",
      u.email,
      u.licenses.length > 0 ? u.licenses.join(", ") : "Unlicensed",
      u.licenses.length,
    ]),
    headStyles: { fillColor: BRAND, textColor: WHITE, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 7, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 55 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 16, halign: "center" },
    },
    didParseCell(data) {
      if (data.column.index === 2 && data.cell.text[0] === "Unlicensed") {
        data.cell.styles.textColor = ORANGE;
        data.cell.styles.fontStyle = "italic";
      }
    },
  });

  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(...LIGHT);
    doc.rect(0, 285, PAGE_W, 12, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("NexusOne Entra ID Admin", MARGIN, 291);
    doc.text(`Page ${p} of ${totalPages}`, PAGE_W - MARGIN, 291, { align: "right" });
  }

  const filename = `nexusone-licenses-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
