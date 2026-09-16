export function escapePrintHtml(value: any): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendHtmlToPrintAgent(
  html: string,
  printer: string,
  widthMm: number,
  heightMm: number
) {
  const response = await fetch("http://127.0.0.1:9123/print/html", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      html,
      printer,
      widthMm,
      heightMm,
      orientation: Number(widthMm) >= Number(heightMm) ? "landscape" : "portrait",
    }),
  });

  let result: any = null;
  try {
    result = await response.json();
  } catch {
    // ignore invalid JSON
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || `Print Agent failed for printer "${printer}".`
    );
  }

  return result;
}

function accessoryName(item: any): string {
  return String(
    item?.accessory?.name ||
      item?.accessoryName ||
      item?.name ||
      item?.description ||
      item?.accessoryId ||
      ""
  ).trim();
}

function getVoucherValue(job: any, key: string, accessories: any[]): any {
  const customer = job?.customer || {};

  switch (key) {
    case "jobNumber":
      return job?.jobNumber;
    case "receivedDate": {
      const d = job?.receivedDate || job?.createdAt;
      if (!d) return "";
      const parsed = new Date(d);
      return Number.isNaN(parsed.getTime())
        ? String(d)
        : parsed.toLocaleDateString("en-GB");
    }
    case "customerName":
      return customer?.fullName || customer?.name;
    case "phone":
      return customer?.phone || customer?.contactNumber;
    case "email":
      return customer?.email;
    case "address":
      return customer?.address;
    case "deviceType":
      return job?.deviceType;
    case "brand":
      return job?.brand;
    case "model":
      return job?.model;
    case "serialNumber":
      return job?.serialNumber;
    case "processor":
      return job?.processor;
    case "ram":
      return job?.ram;
    case "storage":
      return job?.storage;
    case "graphics":
      return job?.graphics;
    case "operatingSystem":
      return job?.operatingSystem;
    case "color":
      return job?.color;
    case "complaint":
      return job?.complaint;
    case "observation":
      return job?.observation;
    case "screenCondition":
      return job?.screenCondition;
    case "bodyCondition":
      return job?.bodyCondition;
    case "liquidDamage":
      return job?.liquidDamage === true ? "Yes" : "";
    case "missingKeys":
      return job?.missingKeys === true ? "Yes" : "";
    case "hingeBroken":
      return job?.hingeBroken === true ? "Yes" : "";
    case "physicalRemarks":
      return job?.physicalRemarks;
    case "accessories": {
      const names = accessories.map(accessoryName).filter(Boolean);
      const other = String(job?.otherAccessories || "").trim();
      return [...names, other].filter(Boolean).map((x) => `✓ ${escapePrintHtml(x)}`).join("<br>");
    }
    case "advanceAmount": {
      const amount = Number(job?.advanceAmount) || 0;
      return amount > 0 ? `Rs. ${amount.toFixed(2)}` : "";
    }
    default:
      return job?.[key] ?? customer?.[key] ?? "";
  }
}

function fieldHasValue(value: any): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function buildReceivingVoucherHtml(
  job: any,
  configuredFields: any[],
  company: any
): string {
  const fields = (Array.isArray(configuredFields) ? configuredFields : [])
    .filter((f: any) => f?.visible !== false)
    .sort((a: any, b: any) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));

  const accessories = Array.isArray(job?.repairJobAccessories)
    ? job.repairJobAccessories
    : [];

  const companyName = String(company?.companyName || "").trim();
  const companyAddress = String(company?.address || company?.companyAddress || "").trim();
  const companyPhone = String(company?.phone || company?.contact || company?.contactNumber || "").trim();
  const companyPan = String(company?.panVat || company?.pan || "").trim();
  const customerName = String(job?.customer?.fullName || job?.customer?.name || "").trim();

  function renderField(field: any): string {
    const value = getVoucherValue(job, field.fieldKey, accessories);
    if (!fieldHasValue(value)) return "";

    const span = Math.min(Math.max(Number(field.columnSpan || 1), 1), 3);
    return `<div class="voucher-field" style="grid-column:span ${span};">
      <span class="voucher-label">${escapePrintHtml(field.fieldLabel || "")}:</span>
      <span class="voucher-value">${String(value)}</span>
    </div>`;
  }

  function renderSection(title: string, keys: string[]): string {
    const sectionFields = fields.filter(
      (f: any) => keys.includes(f.fieldKey) && fieldHasValue(getVoucherValue(job, f.fieldKey, accessories))
    );
    if (!sectionFields.length) return "";
    return `<div class="voucher-section">
      <div class="voucher-section-title">${escapePrintHtml(title)}</div>
      <div class="voucher-fields">${sectionFields.map(renderField).join("")}</div>
    </div>`;
  }

  function renderAccessories(): string {
    const f = fields.find((x: any) => x.fieldKey === "accessories");
    if (!f) return "";
    const value = getVoucherValue(job, "accessories", accessories);
    if (!fieldHasValue(value)) return "";
    return `<div class="voucher-section">
      <div class="voucher-section-title">Accessories Received</div>
      <div class="voucher-long-value">${value}</div>
    </div>`;
  }

 function renderPhysical(): string {
  const physicalFields = [
    "screenCondition",
    "bodyCondition",
    "liquidDamage",
    "missingKeys",
    "hingeBroken",
    "physicalRemarks",
  ];

  const sectionFields = fields.filter((f: any) =>
    physicalFields.includes(f.fieldKey) &&
    fieldHasValue(
      getVoucherValue(job, f.fieldKey, accessories)
    )
  );

  // Do not print an empty Physical Condition section.
  if (!sectionFields.length) {
    return "";
  }

  return `
    <div class="voucher-section">
      <div class="voucher-section-title">
        Physical Condition
      </div>

      <div class="voucher-fields">
        ${sectionFields.map(renderField).join("")}
      </div>
    </div>
  `;
}

  function renderAdvance(): string {
    const f = fields.find((x: any) => x.fieldKey === "advanceAmount");
    if (!f) return "";
    const value = getVoucherValue(job, "advanceAmount", accessories);
    if (!fieldHasValue(value)) return "";
    return `<div class="voucher-section">
      <div class="voucher-section-title">Advance Payment</div>
      <div class="voucher-long-value">${escapePrintHtml(value)}</div>
    </div>`;
  }

  function renderSignatures(): string {
    return `<div class="voucher-signatures">
      <div class="signature-area">
        <div class="signature-line"></div>
        <div class="signature-title">Company Signature</div>
        ${companyName ? `<div class="signature-name">${escapePrintHtml(companyName)}</div>` : ""}
      </div>
      <div class="signature-area">
        <div class="signature-line"></div>
        <div class="signature-title">Customer Signature</div>
        ${customerName ? `<div class="signature-name">${escapePrintHtml(customerName)}</div>` : ""}
      </div>
    </div>`;
  }

  function renderCopy(title: string): string {
    return `<div class="voucher-copy">
      <div class="copy-title">${escapePrintHtml(title)}</div>
      <div class="company-header">
        ${companyName ? `<div class="company-name">${escapePrintHtml(companyName)}</div>` : ""}
        <div class="company-details">
          ${companyAddress ? `<span>${escapePrintHtml(companyAddress)}</span>` : ""}
          ${companyPhone ? `<span>Contact: ${escapePrintHtml(companyPhone)}</span>` : ""}
          ${companyPan ? `<span>PAN: ${escapePrintHtml(companyPan)}</span>` : ""}
        </div>
        <div class="document-title">JOB RECEIVED VOUCHER</div>
      </div>
      ${renderSection("Customer Information", ["jobNumber", "customerName", "phone", "email", "address", "receivedDate"])}
      ${renderSection("Device Information", ["deviceType", "brand", "model", "serialNumber", "processor", "ram", "storage", "graphics", "operatingSystem", "color"])}
      ${renderSection("Complaint & Initial Observation", ["complaint", "observation"])}
      ${renderAccessories()}
      ${renderPhysical()}
      ${renderAdvance()}
      ${renderSignatures()}
    </div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    *{box-sizing:border-box}
    @page{size:297mm 210mm landscape;margin:0}
    html,body{margin:0;padding:0;width:297mm;height:210mm;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#111;background:white}
    .document{width:297mm;height:210mm;padding:3mm;overflow:hidden;position:relative}
    .voucher-sheet{width:100%;height:100%;display:flex;flex-direction:row;overflow:hidden}
    .voucher-copy{flex:0 0 50%;width:50%;height:100%;padding:4mm 5mm;position:relative;overflow:hidden}
    .voucher-copy+.voucher-copy{border-left:1px dashed #111}
    .copy-title{text-align:center;font-size:10px;font-weight:800;letter-spacing:.5px;margin-bottom:2mm}
    .company-header{text-align:center;border-bottom:.8px solid #222;padding-bottom:2mm;margin-bottom:2mm}
    .company-name{font-size:13px;font-weight:800;line-height:1.15}
    .company-details{display:block;font-size:7px;line-height:1.3;margin-top:1mm}
    .company-details span{margin-right:2mm}
    .document-title{font-size:8px;font-weight:800;margin-top:1mm;letter-spacing:.4px}
    .voucher-section{width:100%;margin-bottom:2.8mm;border:.8px solid #111;overflow:hidden}
    .voucher-section-title{font-size:9.5px;font-weight:800;text-transform:uppercase;border-bottom:.8px solid #111;padding:1.8mm 2mm;line-height:1.15}
    .voucher-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:5mm;row-gap:2.8mm;padding:2.8mm}
    .voucher-field{min-width:0;font-size:9.5px;line-height:1.5;word-break:break-word;overflow-wrap:anywhere}
    .voucher-label{font-weight:700}.voucher-value{font-weight:400}
    .voucher-long-value{font-size:9.5px;line-height:1.5;padding:2.8mm;min-height:10mm;word-break:break-word;overflow-wrap:anywhere}
    .voucher-signatures{position:absolute;left:5mm;right:5mm;bottom:4mm;display:grid;grid-template-columns:1fr 1fr;column-gap:18mm}
    .signature-area{text-align:center;min-height:11mm}.signature-line{border-bottom:.8px solid #222;height:5mm;margin-bottom:1mm}.signature-title{font-size:8px;font-weight:700}.signature-name{font-size:8px;margin-top:.5mm}
    @media print{html,body{width:297mm!important;height:210mm!important;margin:0!important;padding:0!important;overflow:hidden!important}.document{width:297mm!important;height:210mm!important}}
  </style></head><body><div class="document"><div class="voucher-sheet">${renderCopy("CUSTOMER COPY")}${renderCopy("OFFICE COPY")}</div></div></body></html>`;
}


/**
 * Build ONE A4 PORTRAIT receiving voucher copy.
 *
 * Customer and NEITS copies are built separately so each one
 * prints on its own complete A4 portrait sheet.
 */
export function buildPortraitReceivingVoucherHtml(
  job: any,
  configuredFields: any[] = [],
  company: any = {},
  copyTitle: "CUSTOMER COPY" | "NEITS COPY" = "CUSTOMER COPY"
): string {
  const customer = job?.customer || {};
  const accessories = Array.isArray(job?.repairJobAccessories)
    ? job.repairJobAccessories
    : [];

  const fields = (Array.isArray(configuredFields) ? configuredFields : [])
    .filter((field: any) => field?.visible !== false)
    .sort(
      (a: any, b: any) =>
        Number(a?.displayOrder || 0) -
        Number(b?.displayOrder || 0)
    );

  const companyName = String(company?.companyName || "").trim();
  const companyAddress = String(
    company?.address || company?.companyAddress || ""
  ).trim();
  const companyPhone = String(
    company?.phone ||
      company?.contact ||
      company?.contactNumber ||
      ""
  ).trim();
  const companyPan = String(
    company?.panVat || company?.pan || ""
  ).trim();
  const companyEmail = String(
    company?.email || company?.companyEmail || ""
  ).trim();

  const customerName = String(
    customer?.fullName || customer?.name || ""
  ).trim();

  function valueFor(key: string): any {
    switch (key) {
      case "jobNumber":
        return job?.jobNumber;

      case "receivedDate": {
        const date = job?.receivedDate || job?.createdAt;
        if (!date) return "";
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime())
          ? String(date)
          : parsed.toLocaleDateString("en-GB");
      }

      case "customerName":
        return customer?.fullName || customer?.name;

      case "phone":
        return customer?.phone || customer?.contactNumber;

      case "email":
        return customer?.email;

      case "address":
        return customer?.address;

      case "deviceType":
        return job?.deviceType;

      case "brand":
        return job?.brand;

      case "model":
        return job?.model;

      case "serialNumber":
        return job?.serialNumber;

      case "processor":
        return job?.processor;

      case "ram":
        return job?.ram;

      case "storage":
        return job?.storage;

      case "graphics":
        return job?.graphics;

      case "operatingSystem":
        return job?.operatingSystem;

      case "color":
        return job?.color;

      case "complaint":
        return job?.complaint;

      case "observation":
        return job?.observation;

      case "screenCondition":
        return job?.screenCondition;

      case "bodyCondition":
        return job?.bodyCondition;

      case "liquidDamage":
        return job?.liquidDamage === true ? "Yes" : "";

      case "missingKeys":
        return job?.missingKeys === true ? "Yes" : "";

      case "hingeBroken":
        return job?.hingeBroken === true ? "Yes" : "";

      case "physicalRemarks":
        return job?.physicalRemarks;

      case "accessories": {
        const names = accessories.map(accessoryName).filter(Boolean);
        const other = String(job?.otherAccessories || "").trim();

        return [
          ...names,
          ...(other ? [other] : []),
        ]
          .map(
            (name: string) =>
              `✓ ${escapePrintHtml(name)}`
          )
          .join("<br>");
      }

      case "advanceAmount": {
        const amount = Number(job?.advanceAmount) || 0;
        return amount > 0
          ? `Rs. ${amount.toFixed(2)}`
          : "";
      }

      default:
        return job?.[key] ?? customer?.[key] ?? "";
    }
  }

  function hasValue(value: any): boolean {
    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    );
  }

  function renderField(field: any): string {
    const value = valueFor(field.fieldKey);

    if (!hasValue(value)) return "";

    const span = Math.min(
      Math.max(Number(field.columnSpan || 1), 1),
      3
    );

    return `
      <div class="voucher-field" style="grid-column:span ${span};">
        <span class="voucher-label">
          ${escapePrintHtml(field.fieldLabel || "")}:
        </span>
        <span class="voucher-value">
          ${String(value)}
        </span>
      </div>
    `;
  }

  function renderSection(
    title: string,
    keys: string[]
  ): string {
    const sectionFields = fields.filter(
      (field: any) =>
        keys.includes(field.fieldKey) &&
        hasValue(valueFor(field.fieldKey))
    );

    if (!sectionFields.length) return "";

    return `
      <div class="voucher-section">
        <div class="voucher-section-title">
          ${escapePrintHtml(title)}
        </div>
        <div class="voucher-fields">
          ${sectionFields.map(renderField).join("")}
        </div>
      </div>
    `;
  }

  function renderAccessories(): string {
    const field = fields.find(
      (item: any) => item.fieldKey === "accessories"
    );

    if (!field) return "";

    const value = valueFor("accessories");

    if (!hasValue(value)) return "";

    return `
      <div class="voucher-section">
        <div class="voucher-section-title">
          Accessories Received
        </div>
        <div class="voucher-long-value">
          ${value}
        </div>
      </div>
    `;
  }

  function renderPhysical(): string {
    const keys = [
      "screenCondition",
      "bodyCondition",
      "liquidDamage",
      "missingKeys",
      "hingeBroken",
      "physicalRemarks",
    ];

    const sectionFields = fields.filter(
      (field: any) =>
        keys.includes(field.fieldKey) &&
        hasValue(valueFor(field.fieldKey))
    );

    if (!sectionFields.length) return "";

    return `
      <div class="voucher-section">
        <div class="voucher-section-title">
          Physical Condition
        </div>
        <div class="voucher-fields">
          ${sectionFields.map(renderField).join("")}
        </div>
      </div>
    `;
  }

  function renderAdvance(): string {
    const field = fields.find(
      (item: any) => item.fieldKey === "advanceAmount"
    );

    if (!field) return "";

    const value = valueFor("advanceAmount");

    if (!hasValue(value)) return "";

    return `
      <div class="voucher-section">
        <div class="voucher-section-title">
          Advance Payment
        </div>
        <div class="voucher-long-value">
          ${escapePrintHtml(value)}
        </div>
      </div>
    `;
  }

  function renderImportantNotice(): string {
    if (job?.importantNoticeAccepted !== true) {
      return "";
    }

    const notice =
      "No warranty/responsibility for software, passwords, BitLocker/encryption, data loss or corruption. No warranty for physical, liquid/water, burn, short-circuit or accidental damage. Devices previously disassembled, repaired, modified or tampered with are accepted without warranty for related issues. Customer is advised to back up all important data before service. By signing, the customer confirms acceptance of these terms.";

    return `
      <div class="important-notice">
        <div class="important-notice-title">
          IMPORTANT NOTICE
        </div>
        <div class="important-notice-text">
          ${escapePrintHtml(notice)}
        </div>
      </div>
    `;
  }

  function renderSignatures(): string {
    return `
      <div class="voucher-signatures">

        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="signature-title">
            CUSTOMER SIGNATURE
          </div>
          ${
            customerName
              ? `<div class="signature-name">${escapePrintHtml(customerName)}</div>`
              : ""
          }
        </div>

        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="signature-title">
            COMPANY SIGNATURE
          </div>
          ${
            companyName
              ? `<div class="signature-name">${escapePrintHtml(companyName)}</div>`
              : ""
          }
        </div>

      </div>
    `;
  }

  function renderFooter(): string {
    const parts: string[] = [];

    if (companyName) parts.push(escapePrintHtml(companyName));
    if (companyAddress) parts.push(escapePrintHtml(companyAddress));
    if (companyPhone) {
      parts.push(`Contact: ${escapePrintHtml(companyPhone)}`);
    }
    if (companyPan) {
      parts.push(`PAN: ${escapePrintHtml(companyPan)}`);
    }
    if (companyEmail) parts.push(escapePrintHtml(companyEmail));

    if (!parts.length) return "";

    return `
      <div class="voucher-footer">
        <div class="voucher-footer-content">
          ${parts
            .map((item) => `<span>${item}</span>`)
            .join(
              `<span class="footer-separator">|</span>`
            )}
        </div>

        <div class="voucher-footer-thanks">
          Thank you for choosing our service.
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
* { box-sizing: border-box; }

@page {
  size: 210mm 297mm portrait;
  margin: 0;
}

html, body {
  margin: 0;
  padding: 0;
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  font-family: Arial, Helvetica, sans-serif;
  color: #111;
  background: white;
}

.document {
  width: 210mm;
  height: 297mm;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.voucher-sheet {
  width: 210mm;
  height: 297mm;
  display: block;
  overflow: hidden;
}

.voucher-copy {
  width: 210mm;
  height: 297mm;
  padding: 10mm 12mm 12mm 12mm;
  position: relative;
  overflow: hidden;
  background: #fff;
}

.copy-title {
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-bottom: 2mm;
}

.company-header {
  text-align: center;
  border-bottom: 0.8px solid #222;
  padding-bottom: 3mm;
  margin-bottom: 5mm;
}

.company-name {
  font-size: 20px;
  font-weight: 800;
  line-height: 1.15;
}

.company-details {
  display: block;
  font-size: 10px;
  line-height: 1.45;
  margin-top: 1.5mm;
}

.company-details span {
  margin-right: 3mm;
}

.document-title {
  font-size: 11px;
  font-weight: 800;
  margin-top: 2mm;
  letter-spacing: 0.5px;
}

.voucher-section {
  width: 100%;
  margin-bottom: 3mm;
  border: 0.7px solid #111;
  overflow: hidden;
  display: block;
}

.voucher-section-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  border-bottom: 0.7px solid #111;
  padding: 1.5mm 2mm;
  margin: 0;
  line-height: 1.15;
}

.voucher-fields {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 5mm;
  row-gap: 2mm;
  padding: 2.5mm;
}

.voucher-field {
  min-width: 0;
  font-size: 10px;
  line-height: 1.45;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.voucher-label { font-weight: 700; }
.voucher-value { font-weight: 400; }

.voucher-long-value {
  font-size: 10px;
  line-height: 1.45;
  padding: 2.5mm;
  min-height: 8mm;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.important-notice {
  width: 100%;
  margin-top: 3mm;
  margin-bottom: 3mm;
  padding: 3mm 3.5mm;
  border: 0.8px solid #111;
  font-size: 10px;
  line-height: 1.5;
  page-break-inside: avoid;
  break-inside: avoid;
}

.important-notice-title {
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 2mm;
  text-transform: uppercase;
}

.important-notice-text {
  font-size: 10px;
  font-weight: 400;
  line-height: 1.5;
}

.voucher-signatures {
  position: absolute;
  left: 12mm;
  right: 12mm;
  bottom: 38mm;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 35mm;
  z-index: 20;
}

.signature-area { text-align: center; }

.signature-line {
  border-top: 0.8px solid #111;
  margin-bottom: 2mm;
}

.signature-title {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.signature-name {
  font-size: 8px;
  margin-top: 1mm;
}

.voucher-footer {
  position: absolute;
  left: 8mm;
  right: 8mm;
  bottom: 5mm;
  min-height: 22mm;
  padding: 3mm 4mm 2mm 4mm;
  border: 0.8px solid #111;
  text-align: center;
  font-size: 8px;
  line-height: 1.35;
  color: #111;
  z-index: 10;
}

.voucher-footer-content {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5mm;
  font-size: 8px;
  font-weight: 600;
}

.voucher-footer-content span {
  white-space: nowrap;
}

.footer-separator {
  font-weight: 700;
  margin: 0 1mm;
}

.voucher-footer-thanks {
  margin-top: 2mm;
  padding-top: 1.5mm;
  border-top: 0.5px dashed #555;
  font-size: 8px;
  font-weight: 700;
}

@media print {
  html, body {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .document {
    width: 210mm !important;
    height: 297mm !important;
  }
}
</style>
</head>

<body>
  <div class="document">
    <div class="voucher-sheet">
      <div class="voucher-copy">

        <div class="copy-title">
          ${escapePrintHtml(copyTitle)}
        </div>

        <div class="company-header">

          ${
            companyName
              ? `<div class="company-name">${escapePrintHtml(companyName)}</div>`
              : ""
          }

          <div class="company-details">
            ${
              companyAddress
                ? `<span>${escapePrintHtml(companyAddress)}</span>`
                : ""
            }
            ${
              companyPhone
                ? `<span>Contact: ${escapePrintHtml(companyPhone)}</span>`
                : ""
            }
            ${
              companyPan
                ? `<span>PAN: ${escapePrintHtml(companyPan)}</span>`
                : ""
            }
          </div>

          <div class="document-title">
            JOB RECEIVED VOUCHER
          </div>

        </div>

        ${renderSection(
          "Customer Information",
          [
            "jobNumber",
            "customerName",
            "phone",
            "email",
            "address",
            "receivedDate",
          ]
        )}

        ${renderSection(
          "Device Information",
          [
            "deviceType",
            "brand",
            "model",
            "serialNumber",
            "processor",
            "ram",
            "storage",
            "graphics",
            "operatingSystem",
            "color",
          ]
        )}

        ${renderSection(
          "Complaint & Initial Observation",
          [
            "complaint",
            "observation",
          ]
        )}

        ${renderAccessories()}

        ${renderPhysical()}

        ${renderAdvance()}

        ${renderImportantNotice()}

        ${renderSignatures()}

        ${renderFooter()}

      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildDetailJobStickerHtml(
  job: any,
  widthMm: number,
  heightMm: number,
  configuredFields: any[] = [],
  _company: any = {}
): string {
  const customer = job?.customer || {};

  const jobNo = String(job?.jobNumber || "").trim();

  const customerName = String(
    customer?.fullName ||
      customer?.name ||
      ""
  ).trim();

  const contact = String(
    customer?.phone ||
      customer?.contactNumber ||
      ""
  ).trim();

  const complaint = String(
    job?.complaint || ""
  ).trim();

  // =========================================================
  // RECEIVED ACCESSORIES ONLY
  // =========================================================

  const receivedAccessories = Array.isArray(
    job?.repairJobAccessories
  )
    ? job.repairJobAccessories.filter(
        (item: any) =>
          item?.received !== false
      )
    : [];

  const accessories = receivedAccessories
    .map(accessoryName)
    .filter(Boolean);

  const otherAccessories = String(
    job?.otherAccessories || ""
  ).trim();

  if (otherAccessories) {
    accessories.push(otherAccessories);
  }

  // =========================================================
  // DEFAULT JOB STICKER FIELDS
  //
  // Used when no JOB_STICKER layout has been saved.
  // =========================================================

  const defaultFields = [
    {
      fieldKey: "jobNumber",
      fieldLabel: "Job Number",
      visible: true,
      displayOrder: 1,
      columnSpan: 3,
      fontSize: 14,
      marginMm: 1,
    },
    {
      fieldKey: "customerName",
      fieldLabel: "Customer",
      visible: true,
      displayOrder: 2,
      columnSpan: 3,
      fontSize: 14,
      marginMm: 1,
    },
    {
      fieldKey: "phone",
      fieldLabel: "Contact",
      visible: true,
      displayOrder: 3,
      columnSpan: 3,
      fontSize: 14,
      marginMm: 1,
    },
    {
      fieldKey: "complaint",
      fieldLabel: "Complaint",
      visible: true,
      displayOrder: 4,
      columnSpan: 3,
      fontSize: 14,
      marginMm: 1,
    },
    {
      fieldKey: "accessories",
      fieldLabel: "Received",
      visible: true,
      displayOrder: 5,
      columnSpan: 3,
      fontSize: 14,
      marginMm: 1,
    },
  ];

  // =========================================================
  // FIELD VALUES
  // =========================================================

  function getStickerValue(
    fieldKey: string
  ): string {
    switch (fieldKey) {
      case "jobNumber":
        return jobNo;

      case "customerName":
        return customerName;

      case "phone":
        return contact;

      case "complaint":
        return complaint;

      case "accessories":
      case "receivedAccessories":
        return accessories.join(", ");

      default:
        return String(
          job?.[fieldKey] ??
            customer?.[fieldKey] ??
            ""
        ).trim();
    }
  }

  // =========================================================
  // NORMALISE SAVED LAYOUT
  //
  // Keep the user's saved:
  //   - visibility
  //   - order
  //   - label
  //   - font size
  //   - margin
  //
  // columnSpan is intentionally NOT used for the visual
  // sticker layout. Every field gets the complete sticker
  // width so text can never be squeezed into a tiny column.
  // =========================================================

  const fields =
    Array.isArray(configuredFields) &&
    configuredFields.length > 0
      ? configuredFields
          .map((field: any) => ({
            fieldKey: String(
              field?.fieldKey || ""
            ).trim(),

            fieldLabel: String(
              field?.fieldLabel ||
                field?.fieldKey ||
                ""
            ).trim(),

            visible:
              field?.visible !== false,

            displayOrder:
              Number(field?.displayOrder) ||
              0,

            columnSpan: 3,

            fontSize:
              Number.isFinite(
                Number(field?.fontSize)
              )
                ? Number(field.fontSize)
                : 14,

            marginMm:
              Number.isFinite(
                Number(field?.marginMm)
              )
                ? Number(field.marginMm)
                : 1,
          }))
          .filter(
            (field: any) =>
              field.fieldKey
          )
          .sort(
            (a: any, b: any) =>
              a.displayOrder -
              b.displayOrder
          )
      : defaultFields;

  // =========================================================
  // SAFE PHYSICAL SIZE
  // =========================================================

  const safeWidth = Math.max(
    Number(widthMm) || 70,
    1
  );

  const safeHeight = Math.max(
    Number(heightMm) || 30,
    1
  );

  // =========================================================
  // RENDER STICKER ROWS
  //
  // IMPORTANT:
  // No CSS grid.
  // No 1/3 width columns.
  // No company header.
  //
  // Every field occupies the full sticker width.
  // =========================================================

  const rows = fields
  .filter(
  (field: any) =>
    field.visible !== false &&
    field.fieldKey !== "companyName" &&
    field.fieldKey !== "companyAddress" &&
    field.fieldKey !== "companyPhone"
    )
    .map((field: any) => {
      const value = getStickerValue(
        field.fieldKey
      );

      if (!fieldHasValue(value)) {
        return "";
      }

      const fontSize = Math.min(
        Math.max(
          Number(field.fontSize) || 14,
          8
        ),
        40
      );

      const marginMm = Math.min(
        Math.max(
          Number(field.marginMm) || 0,
          0
        ),
        10
      );

      const label = String(
        field.fieldLabel ||
          field.fieldKey ||
          ""
      ).trim();

      return `
        <div
          class="sticker-row"
          style="
            font-size:${fontSize}px;
            margin-bottom:${marginMm}mm;
          "
        >
          <span class="sticker-label">
            ${escapePrintHtml(label)}:
          </span>

          <span class="sticker-value">
            ${escapePrintHtml(value)}
          </span>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  // =========================================================
  // JOB DETAILS REPRINT STICKER
  //
  // NO COMPANY NAME
  // NO COMPANY ADDRESS
  // NO COMPANY PHONE
  // NO JOB STICKER HEADER
  //
  // NewRepairJobPage's original printing process is NOT
  // changed by this function.
  // =========================================================

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<style>
  * {
    box-sizing: border-box;
  }

  @page {
    size: ${safeWidth}mm ${safeHeight}mm;
    margin: 0;
  }

  html,
  body {
    margin: 0;
    padding: 0;

    width: ${safeWidth}mm;
    height: ${safeHeight}mm;

    overflow: hidden;

    background: #fff;
    color: #111;

    font-family:
      Arial,
      Helvetica,
      sans-serif;
  }

  /*
   * Full physical sticker.
   *
   * Only a very small outer margin is used.
   * This removes the large blank area.
   */
  .document {
    width: ${safeWidth}mm;
    height: ${safeHeight}mm;

    margin: 0;
    padding: 1mm;

    overflow: hidden;
  }

  /*
   * Dashed border around the complete sticker.
   */

.sticker {
  width: calc(100% - 2mm);
  height: calc(100% - 2mm);

  margin: 1mm;

  border: .35mm dashed #555;

  padding: 1.5mm 2mm;

  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: center;
}

  /*
   * ONE FULL-WIDTH LINE FOR EVERY FIELD.
   *
   * This is the important fix.
   */
  .sticker-row {
    width: 100%;

    display: flex;
    flex-direction: row;

    align-items: baseline;

    min-width: 0;

    line-height: 1.12;

    white-space: normal;
  }

  /*
   * Keep labels together.
   *
   * Example:
   * Job Number:
   *
   * never becomes:
   * J
   * o
   * b
   */
  .sticker-label {
    flex: 0 0 auto;

    font-weight: 700;

    white-space: nowrap;

    margin-right: 1.5mm;
  }

  /*
   * Value receives all remaining width.
   */
  .sticker-value {
    flex: 1 1 auto;

    min-width: 0;

    font-weight: 400;

    white-space: normal;

    overflow-wrap: anywhere;

    word-break: normal;
  }

  @media print {
    html,
    body {
      width: ${safeWidth}mm !important;
      height: ${safeHeight}mm !important;

      margin: 0 !important;
      padding: 0 !important;

      overflow: hidden !important;
    }

    .document {
      width: ${safeWidth}mm !important;
      height: ${safeHeight}mm !important;

      margin: 0 !important;
      padding: 1mm !important;

      overflow: hidden !important;
    }

    .sticker {
      width: 100% !important;
      height: 100% !important;

      overflow: hidden !important;
    }

    .sticker-row {
      width: 100% !important;
    }
  }
</style>

</head>

<body>

  <div class="document">

    <div class="sticker">

      ${rows}

    </div>

  </div>

</body>

</html>`;
}

