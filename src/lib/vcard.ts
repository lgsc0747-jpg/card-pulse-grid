interface VCardData {
  displayName?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  headline?: string;
  location?: string;
}

export function generateVCard(data: VCardData): string {
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
  ];

  if (data.displayName) {
    lines.push(`FN:${data.displayName}`);
    lines.push(`N:${data.displayName};;;`);
  }
  if (data.headline) lines.push(`TITLE:${data.headline}`);
  if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.linkedin) lines.push(`X-SOCIALPROFILE;TYPE=linkedin:${data.linkedin}`);
  if (data.github) lines.push(`X-SOCIALPROFILE;TYPE=github:${data.github}`);
  if (data.location) lines.push(`ADR;TYPE=WORK:;;${data.location};;;`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(data: VCardData) {
  const vcf = generateVCard(data);
  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(data.displayName ?? "contact").replace(/\s+/g, "_")}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
