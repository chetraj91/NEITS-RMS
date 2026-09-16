import { prisma } from "../config/prisma";

const DOCUMENT_TYPES = {
  CUSTOMER_VOUCHER:
    "CUSTOMER_VOUCHER",

  JOB_STICKER:
    "JOB_STICKER",

  RECEIVING_JOB_STICKER:
    "RECEIVING_JOB_STICKER",

  ACCESSORY_STICKER:
    "ACCESSORY_STICKER",
} as const;

// =====================================================
// DEFAULT LAYOUTS
// =====================================================

const DEFAULT_FIELDS = {

  CUSTOMER_VOUCHER: [
    {
      fieldKey: "jobNumber",
      fieldLabel: "Job Number",
      displayOrder: 1,
      columnSpan: 1,
    },

    {
      fieldKey: "receivedDate",
      fieldLabel: "Received Date",
       displayOrder: 2,
       columnSpan: 1,
      },

    {
      fieldKey: "customerName",
      fieldLabel: "Customer Name",
      displayOrder: 3,
      columnSpan: 1,
    },

    {
      fieldKey: "phone",
      fieldLabel: "Contact Number",
      displayOrder: 4,
      columnSpan: 1,
    },

    {
      fieldKey: "email",
      fieldLabel: "Email",
      displayOrder: 5,
      columnSpan: 1,
    },

    {
      fieldKey: "address",
      fieldLabel: "Address",
      displayOrder: 6,
      columnSpan: 3,
    },

    {
      fieldKey: "deviceType",
      fieldLabel: "Device Type",
      displayOrder: 7,
      columnSpan: 1,
    },

    {
      fieldKey: "brand",
      fieldLabel: "Brand",
      displayOrder: 8,
      columnSpan: 1,
    },

    {
      fieldKey: "model",
      fieldLabel: "Model",
      displayOrder: 9,
      columnSpan: 1,
    },

    {
      fieldKey: "serialNumber",
      fieldLabel: "Serial Number",
      displayOrder: 10,
      columnSpan: 1,
    },

    {
      fieldKey: "complaint",
      fieldLabel: "Customer Complaint",
      displayOrder: 14,
      columnSpan: 3,
    },

    {
    fieldKey: "processor",
    fieldLabel: "Processor",
    displayOrder: 11,
    columnSpan: 1,
    },

    {
    fieldKey: "ram",
    fieldLabel: "RAM",
    displayOrder: 12,
    columnSpan: 1,
    },

    {
   fieldKey: "storage",
   fieldLabel: "Storage",
   displayOrder: 13,
   columnSpan: 1,
   },

   {
   fieldKey: "graphics",
   fieldLabel: "Graphics",
   displayOrder: 15,
   columnSpan: 1,
    },
    {
    fieldKey: "color",
    fieldLabel: "Color",
    displayOrder: 16,
    columnSpan: 1,
    },

    {
  fieldKey: "screenCondition",
  fieldLabel: "Screen Condition",
  displayOrder: 18,
  columnSpan: 1,
},

{
  fieldKey: "bodyCondition",
  fieldLabel: "Body Condition",
  displayOrder: 19,
  columnSpan: 1,
},

{
  fieldKey: "liquidDamage",
  fieldLabel: "Liquid Damage",
  displayOrder: 20,
  columnSpan: 1,
},

{
  fieldKey: "missingKeys",
  fieldLabel: "Missing Keys",
  displayOrder: 21,
  columnSpan: 1,
},

{
  fieldKey: "hingeBroken",
  fieldLabel: "Hinge Broken",
  displayOrder: 22,
  columnSpan: 1,
},

{
  fieldKey: "physicalRemarks",
  fieldLabel: "Physical Remarks",
  displayOrder: 23,
  columnSpan: 3,
},

{
      fieldKey: "accessories",
      fieldLabel: "Accessories Received",
      displayOrder: 17,
      columnSpan: 3,
    },

    {
  fieldKey: "bodyScratch",
  fieldLabel: "Body Scratch",
  visible: true,
  displayOrder: 25,
  columnSpan: 1,
  fontSize: 11,
  marginMm: 1.5,
},

{
  fieldKey: "customerSignature",
  fieldLabel: "Customer Signature",
  displayOrder: 26,
  columnSpan: 1,
},

{
  fieldKey: "companySignature",
  fieldLabel:
    "Nepal Electronics & IT Solution Signature",
  displayOrder: 27,
  columnSpan: 1,
},

{
  fieldKey: "advanceAmount",
  fieldLabel: "Advance Paid",
  displayOrder: 24,
  columnSpan: 3,
},

],

RECEIVING_JOB_STICKER: [
  {
    fieldKey: "companyName",
    fieldLabel: "Company Name",
    displayOrder: 1,
    columnSpan: 3,
    fontSize: 11,
    marginMm: 1,
  },

  {
    fieldKey: "companyAddress",
    fieldLabel: "Company Address",
    displayOrder: 2,
    columnSpan: 3,
    fontSize: 7,
    marginMm: 0.5,
  },

  {
    fieldKey: "companyPhone",
    fieldLabel: "Company Contact Number",
    displayOrder: 3,
    columnSpan: 3,
    fontSize: 7,
    marginMm: 0.5,
  },

  {
    fieldKey: "jobNumber",
    fieldLabel: "Job Number",
    displayOrder: 4,
    columnSpan: 1,
  },

  {
    fieldKey: "customerName",
    fieldLabel: "Customer Name",
    displayOrder: 5,
    columnSpan: 1,
  },

  {
    fieldKey: "phone",
    fieldLabel: "Contact Number",
    displayOrder: 6,
    columnSpan: 1,
  },

  {
    fieldKey: "deviceType",
    fieldLabel: "Device Type",
    displayOrder: 7,
    columnSpan: 1,
  },

  {
    fieldKey: "brand",
    fieldLabel: "Brand",
    displayOrder: 8,
    columnSpan: 1,
  },

  {
    fieldKey: "model",
    fieldLabel: "Model",
    displayOrder: 9,
    columnSpan: 1,
  },

  {
    fieldKey: "serialNumber",
    fieldLabel: "Serial Number",
    displayOrder: 10,
    columnSpan: 1,
  },

  {
    fieldKey: "complaint",
    fieldLabel: "Customer Complaint",
    displayOrder: 11,
    columnSpan: 3,
  },

  {
    fieldKey: "accessories",
    fieldLabel: "Accessories Received",
    displayOrder: 12,
    columnSpan: 3,
  },
],

JOB_STICKER: [

      {
      fieldKey: "companyName",
      fieldLabel: "Company Name",
      displayOrder: 1,
      columnSpan: 3,
      visible: true,
      fontSize: 11,
      marginMm: 0,
    },

    {
      fieldKey: "companyAddress",
      fieldLabel: "Company Address",
      displayOrder: 2,
      columnSpan: 3,
      visible: true,
      fontSize: 7,
      marginMm: 0,
    },

    {
      fieldKey: "companyPhone",
      fieldLabel: "Company Phone",
      displayOrder: 3,
      columnSpan: 3,
      visible: true,
      fontSize: 7,
      marginMm: 0,
    },

  {
    fieldKey: "jobNumber",
    fieldLabel: "Job Number",
    displayOrder: 4,
    columnSpan: 1,
    visible: true,
    fontSize: 9,
    marginMm: 1.5,
  },

  {
    fieldKey: "customerName",
    fieldLabel: "Customer Name",
    displayOrder: 5,
    columnSpan: 1,
    visible: true,
    fontSize: 9,
    marginMm: 1.5,
  },

  {
    fieldKey: "phone",
    fieldLabel: "Contact Number",
    displayOrder: 6,
    columnSpan: 1,
    visible: true,
    fontSize: 9,
    marginMm: 1.5,
  },

  {
    fieldKey: "complaint",
    fieldLabel: "Customer Complaint",
    displayOrder: 11,
    columnSpan: 3,
    visible: true,
    fontSize: 9,
    marginMm: 1.5,
  },

  {
    fieldKey: "deviceType",
    fieldLabel: "Device Type",
    displayOrder: 7,
    columnSpan: 1,
    visible: false,
    fontSize: 8,
    marginMm: 1.5,
  },

  {
    fieldKey: "brand",
    fieldLabel: "Brand",
    displayOrder: 8,
    columnSpan: 1,
    visible: false,
    fontSize: 8,
    marginMm: 1.5,
  },

  {
    fieldKey: "model",
    fieldLabel: "Model",
    displayOrder: 9,
    columnSpan: 1,
    visible: false,
    fontSize: 8,
    marginMm: 1.5,
  },

  {
    fieldKey: "serialNumber",
    fieldLabel: "Serial Number",
    displayOrder: 10,
    columnSpan: 1,
    visible: false,
    fontSize: 8,
    marginMm: 1.5,
  },

  {
    fieldKey: "accessories",
    fieldLabel: "Accessories Received",
    displayOrder: 12,
    columnSpan: 3,
    visible: false,
    fontSize: 8,
    marginMm: 1.5,
  },
],

  ACCESSORY_STICKER: [
    {
      fieldKey: "jobNumber",
      fieldLabel: "Job Number",
      displayOrder: 1,
      columnSpan: 1,
    },

    {
      fieldKey: "customerName",
      fieldLabel: "Customer Name",
      displayOrder: 2,
      columnSpan: 1,
    },

    {
      fieldKey: "phone",
      fieldLabel: "Contact Number",
      displayOrder: 3,
      columnSpan: 1,
    },

    {
      fieldKey: "deviceType",
      fieldLabel: "Device Type",
      displayOrder: 4,
      columnSpan: 1,
    },

    {
      fieldKey: "brand",
      fieldLabel: "Brand",
      displayOrder: 5,
      columnSpan: 1,
    },

    {
      fieldKey: "model",
      fieldLabel: "Model",
      displayOrder: 6,
      columnSpan: 1,
    },

    {
      fieldKey: "serialNumber",
      fieldLabel: "Serial Number",
      displayOrder: 7,
      columnSpan: 1,
    },

    {
      fieldKey: "accessoryName",
      fieldLabel: "Accessory",
      displayOrder: 8,
      columnSpan: 1,
    },

    {
      fieldKey: "itemNumber",
      fieldLabel: "Item Number",
      displayOrder: 9,
      columnSpan: 1,
    },

    {
      fieldKey: "accessoryCount",
      fieldLabel: "Accessory Count",
      displayOrder: 10,
      columnSpan: 1,
    },
  ],
};

// =====================================================
// DEFAULT PRINT SIZES
// =====================================================

const DEFAULT_SIZES = {
  CUSTOMER_VOUCHER: {
    widthMm: 210,
    heightMm: 297,
  },

  RECEIVING_JOB_STICKER: {
    widthMm: 100,
    heightMm: 50,
  },

  JOB_STICKER: {
    widthMm: 100,
    heightMm: 50,
  },

  ACCESSORY_STICKER: {
    widthMm: 70,
    heightMm: 35,
  },
};

// =====================================================
// GET LAYOUT
// =====================================================

export async function getReceivingPrintLayout(
  documentType: string
) {
  if (
    !Object.values(
      DOCUMENT_TYPES
    ).includes(
      documentType as any
    )
  ) {
    throw new Error(
      "Invalid document type."
    );
  }

  const existing =
    await prisma.receivingPrintLayoutField.findMany({
      where: {
        documentType,
      },

      orderBy: {
        displayOrder: "asc",
      },
    });

  const defaults =
    DEFAULT_FIELDS[
      documentType as keyof typeof DEFAULT_FIELDS
    ];

  const existingKeys = new Set(
  existing.map(
    (field: any) => field.fieldKey
  )
);

for (
  const field of defaults
) {
  if (existingKeys.has(field.fieldKey)) {
    continue;
  }
    await prisma.receivingPrintLayoutField.upsert({
      where: {
        documentType_fieldKey: {
          documentType,
          fieldKey:
            field.fieldKey,
        },
      },

      update: {},

      create: {
        documentType,

        fieldKey:
          field.fieldKey,

        fieldLabel:
          field.fieldLabel,

        visible: true,

        displayOrder:
          field.displayOrder,

        columnSpan:
          field.columnSpan,
      },
    });
  }

  return prisma.receivingPrintLayoutField.findMany({
    where: {
      documentType,
    },

    orderBy: {
      displayOrder: "asc",
    },
  });
}

// =====================================================
// SAVE LAYOUT
// =====================================================

export async function saveReceivingPrintLayout(
  documentType: string,
  fields: any[]
) {
  if (
    !Object.values(
      DOCUMENT_TYPES
    ).includes(
      documentType as any
    )
  ) {
    throw new Error(
      "Invalid document type."
    );
  }

  if (!Array.isArray(fields)) {
    throw new Error(
      "Layout fields are required."
    );
  }

  return prisma.$transaction(
    async (tx) => {

      await tx.receivingPrintLayoutField.deleteMany({
        where: {
          documentType,
        },
      });

      for (
        const field of fields
      ) {
        const columnSpan =
          Number(
            field.columnSpan
          );

        await tx.receivingPrintLayoutField.create({
          data: {
            documentType,

            fieldKey:
              field.fieldKey,

            fieldLabel:
              field.fieldLabel,

            visible:
              field.visible !==
              false,

            displayOrder:
              Number(
                field.displayOrder
              ) || 0,

            columnSpan:
              Number.isFinite(
                columnSpan
              ) &&
              columnSpan >= 1 &&
              columnSpan <= 3
                ? columnSpan
                : 1,

                  fontSize:
                 Number.isFinite(
                 Number(field.fontSize)
                 ) &&
                 Number(field.fontSize) >= 5 &&
                 Number(field.fontSize) <= 40
                 ? Number(field.fontSize)
                 : 11,

                marginMm:
                Number.isFinite(
                Number(field.marginMm)
               ) &&
               Number(field.marginMm) >= 0 &&
               Number(field.marginMm) <= 20
               ? Number(field.marginMm)
               : 1.5,
               },
               });
               }

      return tx.receivingPrintLayoutField.findMany({
        where: {
          documentType,
        },

        orderBy: {
          displayOrder: "asc",
        },
      });
    }
  );
}

// =====================================================
// GET PRINT SIZE
// =====================================================

export async function getReceivingPrintSize(
  documentType: string
) {
  const existing =
    await prisma.receivingPrintSetting.findUnique({
      where: {
        documentType,
      },
    });

  if (existing) {
    return existing;
  }

  const defaults =
    DEFAULT_SIZES[
      documentType as keyof typeof DEFAULT_SIZES
    ];

  if (!defaults) {
    throw new Error(
      "Invalid document type."
    );
  }

  return prisma.receivingPrintSetting.create({
    data: {
      documentType,

      widthMm:
        defaults.widthMm,

      heightMm:
        defaults.heightMm,
    },
  });
}

// =====================================================
// SAVE PRINT SIZE
// =====================================================

export async function saveReceivingPrintSize(
  documentType: string,
  widthMm: number,
  heightMm: number
) {
  if (
    !Object.values(
      DOCUMENT_TYPES
    ).includes(
      documentType as any
    )
  ) {
    throw new Error(
      "Invalid document type."
    );
  }

  if (
    !Number.isFinite(
      Number(widthMm)
    ) ||
    Number(widthMm) <= 0
  ) {
    throw new Error(
      "Invalid width."
    );
  }

  if (
    !Number.isFinite(
      Number(heightMm)
    ) ||
    Number(heightMm) <= 0
  ) {
    throw new Error(
      "Invalid height."
    );
  }

  return prisma.receivingPrintSetting.upsert({
    where: {
      documentType,
    },

    update: {
      widthMm:
        Number(widthMm),

      heightMm:
        Number(heightMm),
    },

    create: {
      documentType,

      widthMm:
        Number(widthMm),

      heightMm:
        Number(heightMm),
    },
  });
}