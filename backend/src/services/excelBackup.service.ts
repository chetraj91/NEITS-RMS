import ExcelJS from "exceljs";
import { prisma } from "../config/prisma";

export async function createNeitsRmsWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "NEITS RMS";
  workbook.created = new Date();
  workbook.modified = new Date();

  // ============================================================
  // REPAIR SHEET
  // ============================================================
  const repairSheet = workbook.addWorksheet("Repair");

  repairSheet.columns = [
    { header: "Job Number", key: "jobNumber", width: 18 },
    { header: "Received Date", key: "receivedDate", width: 20 },
    { header: "Delivery Date", key: "deliveryDate", width: 20 },
    { header: "Status", key: "status", width: 15 },
    { header: "Priority", key: "priority", width: 12 },

    { header: "Customer Code", key: "customerCode", width: 18 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Company Name", key: "companyName", width: 25 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Address", key: "address", width: 30 },

    { header: "Device Type", key: "deviceType", width: 18 },
    { header: "Brand", key: "brand", width: 15 },
    { header: "Model", key: "model", width: 22 },
    { header: "Serial Number", key: "serialNumber", width: 22 },
    { header: "Processor", key: "processor", width: 25 },
    { header: "RAM", key: "ram", width: 15 },
    { header: "Storage", key: "storage", width: 15 },
    { header: "Graphics", key: "graphics", width: 22 },
    { header: "Operating System", key: "operatingSystem", width: 22 },
    { header: "Color", key: "color", width: 15 },

    { header: "Charger", key: "charger", width: 12 },
    { header: "Battery", key: "battery", width: 12 },
    { header: "Bag", key: "bag", width: 12 },
    { header: "Mouse", key: "mouse", width: 12 },
    { header: "Keyboard", key: "keyboard", width: 12 },
    { header: "Adapter", key: "adapter", width: 12 },
    { header: "Box", key: "box", width: 12 },
    { header: "Other Accessories", key: "otherAccessories", width: 25 },

    { header: "Screen Condition", key: "screenCondition", width: 25 },
    { header: "Body Condition", key: "bodyCondition", width: 25 },
    { header: "Liquid Damage", key: "liquidDamage", width: 15 },
    { header: "Missing Keys", key: "missingKeys", width: 15 },
    { header: "Hinge Broken", key: "hingeBroken", width: 15 },
    { header: "Physical Remarks", key: "physicalRemarks", width: 30 },

    { header: "Complaint", key: "complaint", width: 40 },
    { header: "Observation", key: "observation", width: 40 },
    { header: "Diagnosis", key: "diagnosis", width: 40 },

    { header: "Technician", key: "technician", width: 25 },

    { header: "Repair Parts", key: "repairParts", width: 40 },
    { header: "Repair Amount", key: "repairAmount", width: 18 },
    { header: "Paid Amount", key: "paidAmount", width: 18 },
    { header: "Due Amount", key: "dueAmount", width: 18 },
  ];

  // ============================================================
  // SALES SHEET
  // ============================================================
  const salesSheet = workbook.addWorksheet("Sales");

  salesSheet.columns = [
    { header: "Invoice Number", key: "invoiceNumber", width: 20 },
    { header: "Sale Date", key: "saleDate", width: 20 },

    { header: "Customer Code", key: "customerCode", width: 18 },
    { header: "Customer Name", key: "customerName", width: 25 },
    { header: "Phone", key: "phone", width: 18 },

    { header: "Item Code", key: "itemCode", width: 18 },
    { header: "Item Name", key: "itemName", width: 30 },
    { header: "Brand", key: "brand", width: 18 },
    { header: "Model", key: "model", width: 22 },

    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Selling Price", key: "sellingPrice", width: 18 },
    { header: "Item Total", key: "itemTotal", width: 18 },

    { header: "Total Amount", key: "totalAmount", width: 18 },
    { header: "Discount", key: "discount", width: 15 },
    { header: "Grand Total", key: "grandTotal", width: 18 },
    { header: "Paid Amount", key: "paidAmount", width: 18 },
    { header: "Due Amount", key: "dueAmount", width: 18 },
    { header: "Payment Method", key: "paymentMethod", width: 18 },
  ];

  // ============================================================
  // PURCHASE SHEET
  // ============================================================
  const purchaseSheet = workbook.addWorksheet("Purchase");

  purchaseSheet.columns = [
    { header: "Purchase Number", key: "purchaseNumber", width: 20 },
    { header: "Purchase Date", key: "purchaseDate", width: 20 },

    { header: "Supplier Code", key: "supplierCode", width: 18 },
    { header: "Supplier Name", key: "supplierName", width: 28 },
    { header: "Contact Person", key: "contactPerson", width: 22 },
    { header: "Phone", key: "phone", width: 18 },

    {
      header: "Supplier Invoice Number",
      key: "supplierInvoiceNumber",
      width: 25,
    },

    { header: "Item Code", key: "itemCode", width: 18 },
    { header: "Item Name", key: "itemName", width: 30 },
    { header: "Brand", key: "brand", width: 18 },
    { header: "Model", key: "model", width: 22 },

    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Purchase Price", key: "purchasePrice", width: 18 },
    { header: "Item Total", key: "itemTotal", width: 18 },

    { header: "Purchase Total", key: "totalAmount", width: 18 },
    { header: "Paid Amount", key: "paidAmount", width: 18 },
    { header: "Due Amount", key: "dueAmount", width: 18 },
    { header: "Payment Method", key: "paymentMethod", width: 18 },
    { header: "Notes", key: "notes", width: 35 },
  ];

  // ============================================================
  // COMMON HEADER FORMATTING
  // ============================================================
  for (const sheet of [
    repairSheet,
    salesSheet,
    purchaseSheet,
  ]) {
    const headerRow = sheet.getRow(1);

    headerRow.font = {
      bold: true,
    };

    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    headerRow.height = 25;

    sheet.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(
        64 + Math.min(sheet.columnCount, 26)
      )}1`,
    };

    sheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];
  }

  // ============================================================
  // LOAD REPAIR DATA
  // ============================================================
  const repairJobs = await prisma.repairJob.findMany({
    include: {
      customer: true,
      technician: true,
      parts: {
        include: {
          inventory: true,
        },
      },
      payments: true,
    },
    orderBy: {
      receivedDate: "desc",
    },
  });

  for (const job of repairJobs) {
    const repairParts = job.parts
      .map(
        (part) =>
          `${part.inventory.itemName} x${part.quantity} @ ${part.price}`
      )
      .join(", ");

    // ==========================================================
    // REPAIR BILL CALCULATION
    // ==========================================================
    //
    // Repair Amount =
    // Parts Cost + Diagnosis Fee + Service Charge - Discount
    //
    // Parts Cost     = sum of RepairPart quantity × price
    // Diagnosis Fee  = job.diagnosisFee
    // Service Charge = job.labourCharge
    // Discount       = job.discount
    // ==========================================================

    const partsCost = job.parts.reduce(
      (sum, part) =>
        sum + part.quantity * part.price,
      0
    );

    const diagnosisFee =
      Number(job.diagnosisFee ?? 0);

    const serviceCharge =
      Number(job.labourCharge ?? 0);

    const discount =
      Number(job.discount ?? 0);

    const repairAmount = Math.max(
      0,
      partsCost +
        diagnosisFee +
        serviceCharge -
        discount
    );

    // ==========================================================
    // PAID AMOUNT
    // ==========================================================
    //
    // Paid Amount =
    // Advance Amount + Payment Records
    //
    // The initial advance is stored separately in RepairJob,
    // while subsequent payments are stored in Payment records.
    // ==========================================================

    const advanceAmount =
      Number(job.advanceAmount ?? 0);

    const paymentAmount =
      job.payments.reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

    const paidAmount =
      advanceAmount + paymentAmount;

    // ==========================================================
    // DUE AMOUNT
    // ==========================================================

    const dueAmount = Math.max(
      0,
      repairAmount - paidAmount
    );

    repairSheet.addRow({
      jobNumber: job.jobNumber,
      receivedDate: job.receivedDate,
      deliveryDate: job.deliveryDate,
      status: job.status,
      priority: job.priority,

      customerCode:
        job.customer.customerCode,
      customerName:
        job.customer.fullName,
      companyName:
        job.customer.companyName,
      phone: job.customer.phone,
      email: job.customer.email,
      address: job.customer.address,

      deviceType: job.deviceType,
      brand: job.brand,
      model: job.model,
      serialNumber: job.serialNumber,
      processor: job.processor,
      ram: job.ram,
      storage: job.storage,
      graphics: job.graphics,
      operatingSystem:
        job.operatingSystem,
      color: job.color,

      charger: job.charger,
      battery: job.battery,
      bag: job.bag,
      mouse: job.mouse,
      keyboard: job.keyboard,
      adapter: job.adapter,
      box: job.box,
      otherAccessories:
        job.otherAccessories,

      screenCondition:
        job.screenCondition,
      bodyCondition:
        job.bodyCondition,
      liquidDamage:
        job.liquidDamage,
      missingKeys:
        job.missingKeys,
      hingeBroken:
        job.hingeBroken,
      physicalRemarks:
        job.physicalRemarks,

      complaint: job.complaint,
      observation: job.observation,
      diagnosis: job.diagnosis,

      technician:
        job.technician?.fullName ?? "",

      repairParts,
      repairAmount,
      paidAmount,
      dueAmount,
    });
  }

  // ============================================================
  // LOAD SALES DATA
  // ============================================================
  const sales = await prisma.sale.findMany({
    include: {
      customer: true,
      items: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      saleDate: "asc",
    },
  });

  for (const sale of sales) {
    for (const item of sale.items) {
      salesSheet.addRow({
        invoiceNumber:
          sale.invoiceNumber,
        saleDate: sale.saleDate,

        customerCode:
          sale.customer?.customerCode ?? "",
        customerName:
          sale.customer?.fullName ?? "",
        phone:
          sale.customer?.phone ?? "",

        itemCode:
          item.inventory.itemCode,
        itemName:
          item.inventory.itemName,
        brand:
          item.inventory.brand,
        model:
          item.inventory.model,

        quantity:
          item.quantity,
        sellingPrice:
          item.sellingPrice,
        itemTotal:
          item.total,

        totalAmount:
          sale.totalAmount,
        discount:
          sale.discount,
        grandTotal:
          sale.grandTotal,
        paidAmount:
          sale.paidAmount,
        dueAmount:
          sale.dueAmount,
        paymentMethod:
          sale.paymentMethod,
      });
    }
  }

  // ============================================================
  // LOAD PURCHASE DATA
  // ============================================================
  const purchases =
    await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: {
        purchaseDate: "asc",
      },
    });

  for (const purchase of purchases) {
    for (const item of purchase.items) {
      purchaseSheet.addRow({
        purchaseNumber:
          purchase.purchaseNumber,
        purchaseDate:
          purchase.purchaseDate,

        supplierCode:
          purchase.supplier.supplierCode,
        supplierName:
          purchase.supplier.companyName,
        contactPerson:
          purchase.supplier.contactPerson,
        phone:
          purchase.supplier.phone,

        supplierInvoiceNumber:
          purchase.supplierInvoiceNumber,

        itemCode:
          item.inventory.itemCode,
        itemName:
          item.inventory.itemName,
        brand:
          item.inventory.brand,
        model:
          item.inventory.model,

        quantity:
          item.quantity,
        purchasePrice:
          item.purchasePrice,
        itemTotal:
          item.total,

        totalAmount:
          purchase.totalAmount,
        paidAmount:
          purchase.paidAmount,
        dueAmount:
          purchase.dueAmount,
        paymentMethod:
          purchase.paymentMethod,
        notes:
          purchase.notes,
      });
    }
  }

  // ============================================================
  // DATE / NUMBER FORMATTING
  // ============================================================
  for (const sheet of [
    repairSheet,
    salesSheet,
    purchaseSheet,
  ]) {
    sheet.eachRow(
      (row, rowNumber) => {
        if (rowNumber === 1) {
          return;
        }

        row.eachCell((cell) => {
          if (
            cell.value instanceof Date
          ) {
            cell.numFmt =
              "yyyy-mm-dd hh:mm";
          }
        });
      }
    );
  }

  return workbook;
}