import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { NfcStats } from "@/hooks/useNfcData";

interface ExportButtonProps {
  stats: NfcStats;
  chartData: { label: string; taps: number; vcards: number }[];
}

export function ExportButton({ stats, chartData }: ExportButtonProps) {
  const handleExport = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    wb.creator = "Handshake";
    wb.created = new Date();

    const headerFont = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    const headerFill = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF0D9488" } };
    const sectionFont = { bold: true, size: 11, color: { argb: "FF0D9488" } };
    const borderThin = { top: { style: "thin" as const }, bottom: { style: "thin" as const }, left: { style: "thin" as const }, right: { style: "thin" as const } };

    const applyHeader = (ws: any, row: number, cols: number) => {
      const r = ws.getRow(row);
      for (let c = 1; c <= cols; c++) {
        const cell = r.getCell(c);
        cell.font = headerFont;
        cell.fill = headerFill;
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = borderThin;
      }
      r.height = 24;
    };

    const autoWidth = (ws: any) => {
      ws.columns?.forEach((col: any) => {
        let maxLen = 12;
        col.eachCell?.({ includeEmpty: false }, (cell: any) => {
          const len = String(cell.value ?? "").length;
          if (len > maxLen) maxLen = len;
        });
        col.width = Math.min(maxLen + 4, 40);
      });
    };

    // ═══ OVERVIEW SHEET ═══
    const wsOverview = wb.addWorksheet("Overview");
    wsOverview.addRow(["HANDSHAKE — ANALYTICS REPORT"]).font = { bold: true, size: 14, color: { argb: "FF0D9488" } };
    wsOverview.addRow([`Generated: ${new Date().toLocaleString()}`]).font = { size: 10, italic: true, color: { argb: "FF666666" } };
    wsOverview.addRow([]);

    // KPIs
    wsOverview.addRow(["KEY METRICS"]).font = sectionFont;
    wsOverview.addRow(["Metric", "Value"]);
    applyHeader(wsOverview, 5, 2);
    const kpis = [
      ["Total Profile Views", stats.totalTaps],
      ["Unique Visitors", stats.uniqueVisitors],
      ["Return Visitor Rate", `${stats.returnVisitorRate}%`],
      ["Interaction Depth", `${stats.interactionDepthRate}%`],
      ["Contact Save Rate", `${stats.contactSaveRate}%`],
      ["Avg Dwell Time", `${stats.avgDwellTime}s`],
      ["vCard Downloads", stats.vcardDownloads],
      ["CV Downloads", stats.cvDownloads],
      ["Card Flips", stats.cardFlips],
      ["Video Plays", stats.videoPlays],
      ["Contact Form Submissions", stats.contactFormSubmissions],
      ["Leads Captured", stats.leadGenCount],
    ];
    kpis.forEach(([m, v]) => {
      const r = wsOverview.addRow([m, v]);
      r.getCell(1).border = borderThin;
      r.getCell(2).border = borderThin;
      r.getCell(2).alignment = { horizontal: "right" };
    });
    autoWidth(wsOverview);

    // ═══ TIMELINE SHEET WITH CHART ═══
    if (chartData.length > 0) {
      const wsTl = wb.addWorksheet("Timeline");
      wsTl.addRow(["TIMELINE DATA"]).font = sectionFont;
      wsTl.addRow(["Period", "Profile Views", "vCard Saves"]);
      applyHeader(wsTl, 2, 3);
      chartData.forEach((p) => {
        const r = wsTl.addRow([p.label, p.taps, p.vcards]);
        r.eachCell((c: any) => { c.border = borderThin; });
      });
      autoWidth(wsTl);

      // Add area chart
      const chart = wsTl.addChart("area", {
        title: "Profile Views & vCard Saves Over Time",
        legend: { position: "bottom" },
      } as any) as any;
      const dataEnd = chartData.length + 2;
      chart.addSeries({
        name: "Profile Views",
        categories: [`Timeline!$A$3:$A$${dataEnd}`],
        values: [`Timeline!$B$3:$B$${dataEnd}`],
      });
      chart.addSeries({
        name: "vCard Saves",
        categories: [`Timeline!$A$3:$A$${dataEnd}`],
        values: [`Timeline!$C$3:$C$${dataEnd}`],
      });
      chart.setPosition("E", 1, "N", 18);
    }

    // ═══ DEVICES SHEET WITH PIE CHART ═══
    if (stats.deviceBreakdown.length > 0 || stats.browserBreakdown.length > 0) {
      const wsDev = wb.addWorksheet("Devices & Browsers");
      let row = 1;
      if (stats.deviceBreakdown.length > 0) {
        wsDev.getRow(row).values = ["DEVICE BREAKDOWN"];
        wsDev.getRow(row).font = sectionFont;
        row++;
        wsDev.getRow(row).values = ["Device", "Count", "Share"];
        applyHeader(wsDev, row, 3);
        row++;
        const total = stats.deviceBreakdown.reduce((s, d) => s + d.value, 0);
        stats.deviceBreakdown.forEach((d) => {
          const r = wsDev.getRow(row);
          r.values = [d.name, d.value, total > 0 ? d.value / total : 0];
          r.getCell(3).numFmt = "0%";
          r.eachCell((c: any) => { c.border = borderThin; });
          row++;
        });

        // Pie chart for devices
        const devChart = wsDev.addChart("pie", {
          title: "Device Breakdown",
          legend: { position: "right" },
        } as any) as any;
        devChart.addSeries({
          name: "Devices",
          categories: [`'Devices & Browsers'!$A$3:$A$${2 + stats.deviceBreakdown.length}`],
          values: [`'Devices & Browsers'!$B$3:$B$${2 + stats.deviceBreakdown.length}`],
        });
        devChart.setPosition("E", 1, "L", 16);
        row++;
      }

      if (stats.browserBreakdown.length > 0) {
        row++;
        wsDev.getRow(row).values = ["BROWSER BREAKDOWN"];
        wsDev.getRow(row).font = sectionFont;
        row++;
        const bStart = row;
        wsDev.getRow(row).values = ["Browser", "Count", "Share"];
        applyHeader(wsDev, row, 3);
        row++;
        const total = stats.browserBreakdown.reduce((s, d) => s + d.value, 0);
        stats.browserBreakdown.forEach((d) => {
          const r = wsDev.getRow(row);
          r.values = [d.name, d.value, total > 0 ? d.value / total : 0];
          r.getCell(3).numFmt = "0%";
          r.eachCell((c: any) => { c.border = borderThin; });
          row++;
        });

        const bChart = wsDev.addChart("bar", {
          title: "Browser Distribution",
          legend: { position: "bottom" },
        } as any) as any;
        bChart.addSeries({
          name: "Browsers",
          categories: [`'Devices & Browsers'!$A$${bStart + 2}:$A$${bStart + 1 + stats.browserBreakdown.length}`],
          values: [`'Devices & Browsers'!$B$${bStart + 2}:$B$${bStart + 1 + stats.browserBreakdown.length}`],
        });
        bChart.setPosition("E", bStart, "L", bStart + 15);
      }

      if (stats.osBreakdown.length > 0) {
        row += 2;
        wsDev.getRow(row).values = ["OS BREAKDOWN"];
        wsDev.getRow(row).font = sectionFont;
        row++;
        wsDev.getRow(row).values = ["OS", "Count", "Share"];
        applyHeader(wsDev, row, 3);
        row++;
        const total = stats.osBreakdown.reduce((s, d) => s + d.value, 0);
        stats.osBreakdown.forEach((d) => {
          const r = wsDev.getRow(row);
          r.values = [d.name, d.value, total > 0 ? d.value / total : 0];
          r.getCell(3).numFmt = "0%";
          r.eachCell((c: any) => { c.border = borderThin; });
          row++;
        });
      }
      autoWidth(wsDev);
    }

    // ═══ ENGAGEMENT SHEET ═══
    if (stats.linkCTR.length > 0 || stats.ctaClicks.length > 0) {
      const wsEng = wb.addWorksheet("Engagement");
      let row = 1;

      if (stats.linkCTR.length > 0) {
        wsEng.getRow(row).values = ["LINK CLICK-THROUGH RATES"];
        wsEng.getRow(row).font = sectionFont;
        row++;
        wsEng.getRow(row).values = ["Link", "Clicks", "CTR %"];
        applyHeader(wsEng, row, 3);
        row++;
        const linkStart = row;
        stats.linkCTR.forEach((l) => {
          const r = wsEng.getRow(row);
          r.values = [l.name, l.clicks, l.percentage / 100];
          r.getCell(3).numFmt = "0.0%";
          r.eachCell((c: any) => { c.border = borderThin; });
          row++;
        });

        const linkChart = wsEng.addChart("bar", {
          title: "Link Click-Through Rates",
          legend: { position: "bottom" },
        } as any) as any;
        linkChart.addSeries({
          name: "Clicks",
          categories: [`Engagement!$A$${linkStart}:$A$${linkStart + stats.linkCTR.length - 1}`],
          values: [`Engagement!$B$${linkStart}:$B$${linkStart + stats.linkCTR.length - 1}`],
        });
        linkChart.setPosition("E", 1, "L", 16);
        row++;
      }

      if (stats.ctaClicks.length > 0) {
        row++;
        wsEng.getRow(row).values = ["CTA CLICK BREAKDOWN"];
        wsEng.getRow(row).font = sectionFont;
        row++;
        wsEng.getRow(row).values = ["CTA Label", "Clicks"];
        applyHeader(wsEng, row, 2);
        row++;
        stats.ctaClicks.forEach((c) => {
          const r = wsEng.getRow(row);
          r.values = [c.label, c.clicks];
          r.eachCell((ce: any) => { ce.border = borderThin; });
          row++;
        });
      }
      autoWidth(wsEng);
    }

    // ═══ CONNECTIONS SHEET ═══
    const wsConn = wb.addWorksheet("Connections");
    wsConn.addRow(["CONNECTION SOURCES"]).font = sectionFont;
    wsConn.addRow(["Source", "Count"]);
    applyHeader(wsConn, 2, 2);
    [
      ["NFC Tap", stats.connectionSources.nfc],
      ["QR Scan", stats.connectionSources.qr],
      ["Direct Link", stats.connectionSources.direct],
    ].forEach(([name, val]) => {
      const r = wsConn.addRow([name, val]);
      r.eachCell((c: any) => { c.border = borderThin; });
    });

    // Pie chart for connections
    const connChart = wsConn.addChart("pie", {
      title: "Connection Sources",
      legend: { position: "right" },
    } as any) as any;
    connChart.addSeries({
      name: "Sources",
      categories: ["Connections!$A$3:$A$5"],
      values: ["Connections!$B$3:$B$5"],
    });
    connChart.setPosition("D", 1, "K", 16);
    autoWidth(wsConn);

    // ═══ SECURITY SHEET ═══
    const wsSec = wb.addWorksheet("Security");
    wsSec.addRow(["SECURITY METRICS"]).font = sectionFont;
    wsSec.addRow(["Metric", "Value"]);
    applyHeader(wsSec, 2, 2);
    [
      ["Auth Success Rate", `${stats.authSuccessRate}%`],
      ["Unauthorized Attempts", stats.unauthorizedAttempts],
    ].forEach(([m, v]) => {
      const r = wsSec.addRow([m, v]);
      r.eachCell((c: any) => { c.border = borderThin; });
    });
    autoWidth(wsSec);

    // ═══ PERSONA SHEET ═══
    if (stats.personaPerformance.length > 0) {
      const wsPer = wb.addWorksheet("Personas");
      wsPer.addRow(["PERSONA PERFORMANCE"]).font = sectionFont;
      wsPer.addRow(["Persona", "Profile Views", "Save Rate %"]);
      applyHeader(wsPer, 2, 3);
      const perStart = 3;
      stats.personaPerformance.forEach((p) => {
        const r = wsPer.addRow([p.name, p.taps, p.saveRate / 100]);
        r.getCell(3).numFmt = "0.0%";
        r.eachCell((c: any) => { c.border = borderThin; });
      });

      const perChart = wsPer.addChart("bar", {
        title: "Persona Performance",
        legend: { position: "bottom" },
      } as any) as any;
      perChart.addSeries({
        name: "Profile Views",
        categories: [`Personas!$A$${perStart}:$A$${perStart + stats.personaPerformance.length - 1}`],
        values: [`Personas!$B$${perStart}:$B$${perStart + stats.personaPerformance.length - 1}`],
      });
      perChart.setPosition("E", 1, "L", 16);
      autoWidth(wsPer);
    }

    // Download
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `handshake-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={handleExport}>
      <Download className="w-3 h-3" />
      Export XLSX
    </Button>
  );
}
