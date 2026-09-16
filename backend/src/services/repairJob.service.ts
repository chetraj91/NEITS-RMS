import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

import {
  sendJobReceivedSms,
  sendJobDiagnosisSms,
  sendEstimateSms,
} from "./smsEvent.service";


// =========================================
// Convert Device Field Name → Form Field Key
// =========================================
//
// Examples:
//
// RAM              → rAM
// Serial           → serial
// Hinges broken    → hingesBroken
// Body scratch     → bodyScratch
// Screen damage    → screenDamage
// Key missing      → keyMissing
// Water damage     → waterDamage
// =========================================

function getFieldKey(name?: string) {
  if (!name) {
    return "";
  }

  const cleaned = name
    .trim()
    .replace(
      /[^a-zA-Z0-9]+(.)/g,
      (_match, character) => character.toUpperCase()
    );

  return cleaned.replace(
    /^./,
    (character) => character.toLowerCase()
  );
}

// =========================================
// CREATE REPAIR JOB
// =========================================

export async function createRepairJob(data: any) {
  console.log("=================================");
  console.log("CREATE REPAIR JOB");
  console.log("=================================");

  // =======================================
  // GET LAST JOB NUMBER
  // =======================================

  const lastJob = await prisma.repairJob.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let nextNumber = 1;

  if (lastJob) {
    const number = lastJob.jobNumber.replace("JOB-", "");
    nextNumber = parseInt(number, 10) + 1;
  }

  const jobNumber = `JOB-${String(nextNumber).padStart(5, "0")}`;

  // =======================================
  // GET DEVICE TYPE
  // =======================================
  //
  // Frontend sends:
  //
  // deviceType: "Laptop"
  // or
  // deviceType: "Desktop"
  //
  // We use the name to find the DeviceType
  // and its configured fields.
  // =======================================

  const deviceType = await prisma.deviceType.findUnique({
    where: {
      name: data.deviceType,
    },

    include: {
      deviceFields: {
        include: {
          deviceField: true,
        },

        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!deviceType) {
    throw new Error(
      `Device Type "${data.deviceType}" was not found.`
    );
  }

  console.log(
    "Device Type:",
    deviceType.name
  );

  console.log(
    "Device Type ID:",
    deviceType.id
  );

  console.log(
    "Configured Device Fields:",
    deviceType.deviceFields.length
  );

  // =======================================
  // ACCESSORIES
  // =======================================
  //
  // Frontend sends:
  //
  // accessories: [
  //   "accessory-id-1",
  //   "accessory-id-2"
  // ]
  //
  // These are saved into
  // RepairJobAccessory.
  // =======================================

  const accessories = Array.isArray(
    data.accessories
  )
    ? data.accessories
    : [];

  console.log(
    "Accessories:",
    accessories
  );

  // =======================================
  // NORMAL REPAIR JOB DATA
  // =======================================

  const repairJobData = {
    jobNumber,

    customerId:
      data.customerId,

    // =====================================
    // DEVICE INFORMATION
    // =====================================

    deviceType:
      data.deviceType,

    brand:
      data.brand,

    model:
      data.model,

    serialNumber:
      data.serialNumber || null,

    processor:
      data.processor || null,

    ram:
      data.ram || null,

    storage:
      data.storage || null,

    graphics:
      data.graphics || null,

    operatingSystem:
      data.operatingSystem || null,

    windowsPassword:
      data.windowsPassword || null,

    biosPassword:
      data.biosPassword || null,

    color:
      data.color || null,

    // =====================================
    // LEGACY FIXED ACCESSORY FIELDS
    // =====================================

    charger:
      Boolean(data.charger),

    battery:
      Boolean(data.battery),

    bag:
      Boolean(data.bag),

    mouse:
      Boolean(data.mouse),

    keyboard:
      Boolean(data.keyboard),

    adapter:
      Boolean(data.adapter),

    box:
      Boolean(data.box),

    otherAccessories:
      data.otherAccessories || null,

    // =====================================
    // PHYSICAL CONDITION
    // =====================================

    screenCondition:
      data.screenCondition || null,

    bodyCondition:
      data.bodyCondition || null,

    liquidDamage:
      Boolean(data.liquidDamage),

    missingKeys:
      Boolean(data.missingKeys),

    hingeBroken:
      Boolean(data.hingeBroken),

    physicalRemarks:
      data.physicalRemarks || null,

    // =====================================
    // COMPLAINT
    // =====================================

    complaint:
      data.complaint,

    observation:
      data.observation || null,

    internalNotes:
      data.internalNotes || null,

      importantNoticeAccepted:
      data.importantNoticeAccepted === true,

    // =====================================
    // FINANCIAL
    // =====================================

    diagnosisFee:
      Number(data.diagnosisFee) || 0,

    estimatedCost:
      data.estimatedCost !== undefined
        ? Number(data.estimatedCost) || 0
        : 0,

    labourCharge:
      Number(data.labourCharge) || 0,

    advanceAmount:
      Number(data.advanceAmount) || 0,

    totalAmount:
      Number(data.totalAmount) || 0,

    balanceAmount:
      Number(data.balanceAmount) || 0,

    // =====================================
    // PRIORITY
    // =====================================

    priority:
      data.priority || "NORMAL",

    // =====================================
    // EXPECTED DATE
    // =====================================

    expectedDate:
      data.expectedDate
        ? new Date(data.expectedDate)
        : null,

    // =====================================
    // WARRANTY
    // =====================================

    warrantyDays:
      Number(data.warrantyDays) || 0,
  };

  console.log(
    "Repair Job Data:",
    repairJobData
  );

  // =======================================
  // FIND DYNAMIC DEVICE FIELD VALUES
  // =======================================

  const dynamicFieldValues: {
    deviceFieldId: string;
    value: string | null;
  }[] = [];

  for (
    const mapping of deviceType.deviceFields
  ) {
    const deviceField =
      mapping.deviceField;

    if (!deviceField) {
      continue;
    }

    const fieldKey =
      getFieldKey(
        deviceField.name
      );

    if (!fieldKey) {
      continue;
    }

    // Only save fields actually sent
    // by the frontend.

    if (
      Object.prototype.hasOwnProperty.call(
        data,
        fieldKey
      )
    ) {
      const fieldValue =
        data[fieldKey];

      dynamicFieldValues.push({
        deviceFieldId:
          deviceField.id,

        value:
          fieldValue === null ||
          fieldValue === undefined
            ? null
            : String(fieldValue),
      });

      console.log(
        "Dynamic Field:",
        deviceField.name,
        "→",
        fieldKey,
        "→",
        fieldValue
      );
    }
  }

  console.log(
    "Dynamic Field Values:",
    dynamicFieldValues
  );

  // =======================================
  // CREATE EVERYTHING IN TRANSACTION
  // =======================================
  //
  // IMPORTANT FIX:
  //
  // Previously the transaction did:
  //
  // create job
  // create accessories
  // create fields
  // findUnique with multiple includes
  //
  // The final findUnique could cause the
  // transaction to exceed Prisma's default
  // 5000 ms timeout.
  //
  // Now the transaction only creates the
  // required records and returns the job ID.
  //
  // The complete job is fetched AFTER the
  // transaction has successfully committed.
  // =======================================

  const jobId =
    await prisma.$transaction(
      async (tx) => {
        // =================================
        // 1. CREATE REPAIR JOB
        // =================================

        const job =
          await tx.repairJob.create({
            data: repairJobData,
          });

        console.log(
          "Repair Job Created:",
          job.id
        );

        // =================================
// INITIAL REPAIR ADVANCE → CASH BOOK
// =================================

const initialAdvance =
  Number(
    repairJobData.advanceAmount ?? 0
  );

if (initialAdvance > 0) {
  await tx.cashBook.create({
    data: {
      particulars:
        `Repair Advance - ${job.jobNumber}`,
      debit: 0,
      credit: initialAdvance,
      balance: 0,
    },
  });

  console.log(
    "Initial Repair Advance recorded in Cash Book:",
    initialAdvance
  );
}

        // =================================
        // 2. SAVE ACCESSORIES
        // =================================

        if (
          accessories.length > 0
        ) {
          await tx.repairJobAccessory.createMany(
            {
              data:
                accessories.map(
                  (
                    accessoryId: string
                  ) => ({
                    repairJobId:
                      job.id,

                    accessoryId:
                      accessoryId,

                    received:
                      true,
                  })
                ),

              skipDuplicates:
                true,
            }
          );

          console.log(
            "Accessories Saved:",
            accessories.length
          );
        }

        // =================================
        // 3. SAVE DYNAMIC DEVICE FIELDS
        // =================================

        if (
          dynamicFieldValues.length >
          0
        ) {
          await tx.repairJobFieldValue.createMany(
            {
              data:
                dynamicFieldValues.map(
                  (field) => ({
                    repairJobId:
                      job.id,

                    deviceFieldId:
                      field.deviceFieldId,

                    value:
                      field.value,
                  })
                ),

              skipDuplicates:
                true,
            }
          );

          console.log(
            "Dynamic Fields Saved:",
            dynamicFieldValues.length
          );
        }

        // =================================
        // ONLY RETURN JOB ID
        // =================================

        return job.id;
      },

      // ===================================
      // TRANSACTION OPTIONS
      // ===================================

      {
        timeout: 15000,
      }
    );

  // =======================================
  // TRANSACTION COMPLETED
  // =======================================

  console.log(
    "Transaction completed successfully."
  );

  console.log(
    "Created Job ID:",
    jobId
  );

  // =======================================
  // GET COMPLETE JOB AFTER COMMIT
  // =======================================

  const result =
    await prisma.repairJob.findUnique({
      where: {
        id: jobId,
      },

      include: {
        customer: true,

        repairJobAccessories: {
          include: {
            accessory: true,
          },
        },

        repairJobFieldValues: {
          include: {
            deviceField: true,
          },
        },
      },
    });

    // =======================================
    // AUTOMATIC SMS — JOB RECEIVED
   // =======================================

      if (result) {
       try {
        await sendJobReceivedSms({
      id: result.id,

      jobNumber:
        result.jobNumber,

      brand:
        result.brand,

      model:
        result.model,

      serialNumber:
        result.serialNumber,

      deviceType:
        result.deviceType,

      complaint:
        result.complaint,

      customer:
        result.customer
          ? {
              id:
                result.customer.id,

              fullName:
                result.customer.fullName,

              phone:
                result.customer.phone,
            }
          : null,
           });
          } catch (error) {
          // SMS failure must NEVER
          // prevent repair job creation.

          console.error(
           "JOB RECEIVED SMS ERROR:",
           error
          );
        }
       }
       // =========================================
      // AUTOMATIC EXCEL BACKUP
      // =========================================

     triggerAutomaticExcelBackup();

  // =======================================
  // FINAL LOG
  // =======================================

  console.log(
    "================================="
  );

  console.log(
    "REPAIR JOB CREATED SUCCESSFULLY"
  );

  console.log(
    "Job Number:",
    result?.jobNumber
  );

  console.log(
    "Job ID:",
    result?.id
  );

  console.log(
    "================================="
  );

  return result;
}

// =========================================
// GET ALL REPAIR JOBS
// =========================================

export async function getRepairJobs() {
  return prisma.repairJob.findMany({
    include: {
      customer: true,

      repairJobAccessories: {
        include: {
          accessory: true,
        },
      },

      repairJobFieldValues: {
        include: {
          deviceField: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// =========================================
// GET SINGLE REPAIR JOB
// =========================================

export async function getRepairJob(
  id: string
) {
  // =========================================
  // GET REPAIR JOB
  // =========================================

  const repairJob =
    await prisma.repairJob.findUnique({
      where: {
        id,
      },

      include: {
        customer: true,

        repairJobAccessories: {
          include: {
            accessory: true,
          },
        },
      },
    });

  if (!repairJob) {
    return null;
  }

  // =========================================
  // GET DEVICE TYPE FIELD CONFIGURATION
  // =========================================

  const deviceTypeFields =
    await prisma.deviceTypeField.findMany({
      where: {
        deviceType: {
          name: repairJob.deviceType,
        },

        visible: true,
      },

      include: {
        deviceField: true,
      },

      orderBy: {
        displayOrder: "asc",
      },
    });

    // =========================================
// GET DEVICE TYPE BUILT-IN LAYOUT
// =========================================

     const deviceTypeLayout =
     await prisma.deviceTypeLayout.findMany({
      where: {
      deviceType: {
        name: repairJob.deviceType,
      },
    },

    orderBy: {
      displayOrder: "asc",
    },
  });

    // =========================================
    // GET CUSTOMER LAYOUT CONFIGURATION
   // =========================================

    const customerLayoutFields =
     await prisma.customerLayoutField.findMany({
    where: {
      visible: true,
    },

    orderBy: {
      displayOrder: "asc",
    },
    });
  
  // =========================================
  // GET SAVED FIELD VALUES
  // =========================================

  const repairJobFieldValues =
    await prisma.repairJobFieldValue.findMany({
      where: {
        repairJobId: id,
      },

      include: {
        deviceField: true,
      },
    });

  // =========================================
  // SORT FIELD VALUES BY CONFIGURED ORDER
  // =========================================

  const fieldOrderMap =
    new Map<string, any>();

  deviceTypeFields.forEach(
    (mapping) => {
      fieldOrderMap.set(
        mapping.deviceFieldId,
        mapping
      );
    }
  );

  repairJobFieldValues.sort(
    (
      a: any,
      b: any
    ) => {
      const aConfig =
        fieldOrderMap.get(
          a.deviceFieldId
        );

      const bConfig =
        fieldOrderMap.get(
          b.deviceFieldId
        );

      return (
        Number(
          aConfig?.displayOrder ??
            9999
        ) -
        Number(
          bConfig?.displayOrder ??
            9999
        )
      );
    }
  );

  // =========================================
  // RETURN COMPLETE JOB
  // =========================================

 return {
  ...repairJob,

  repairJobFieldValues,

  deviceTypeFields,

  deviceTypeLayout,

  customerLayoutFields,
};
}
// =========================================
// UPDATE REPAIR JOB
// =========================================

// =========================================
// UPDATE REPAIR JOB
// =========================================

export async function updateRepairJob(
  id: string,
  data: any
) {
  console.log("=================================");
  console.log("UPDATE REPAIR JOB");
  console.log("Job ID:", id);
  console.log("Update Data:", data);
  console.log("=================================");

  // =========================================
  // 1. CHECK EXISTING JOB
  // =========================================

  const existingJob =
    await prisma.repairJob.findUnique({
      where: {
        id,
      },
    });

  if (!existingJob) {
    throw new Error(
      "Repair Job not found."
    );
  }

  // =========================================
  // 2. BUILD NORMAL REPAIR JOB DATA
  // =========================================

  const normalFields =
    new Set([
      "customerId",

      "status",
      "priority",

      "receivedDate",
      "expectedDate",
      "deliveryDate",

      "createdBy",
      "branch",

      // DEVICE INFORMATION
      "deviceType",
      "brand",
      "model",
      "serialNumber",
      "processor",
      "ram",
      "storage",
      "graphics",
      "operatingSystem",
      "windowsPassword",
      "biosPassword",
      "color",

      // LEGACY ACCESSORIES
      "charger",
      "battery",
      "bag",
      "mouse",
      "keyboard",
      "adapter",
      "box",
      "otherAccessories",

      // PHYSICAL CONDITION
      "screenCondition",
      "bodyCondition",
      "liquidDamage",
      "missingKeys",
      "hingeBroken",
      "physicalRemarks",

      // COMPLAINT
      "complaint",
      "observation",

      // DIAGNOSIS
      "diagnosis",
      "technicianId",
      "repairNotes",

      // FINANCIAL
      "diagnosisFee",
      "estimatedCost",
      "labourCharge",
      "advanceAmount",
      "discount",
      "totalAmount",
      "balanceAmount",
      "invoiceNumber",

      // WARRANTY
      "warrantyDays",
      "warrantyExpiry",

      // NOTES
      "internalNotes",
      "importantNoticeAccepted",
    ]);

  const updateData: any = {};

  for (
    const key of Object.keys(data)
  ) {
    if (
      normalFields.has(key)
    ) {
      updateData[key] =
        data[key];
    }
  }

  // =========================================
  // 3. DATE CONVERSION
  // =========================================

  if (
    updateData.expectedDate
  ) {
    updateData.expectedDate =
      new Date(
        updateData.expectedDate
      );
  }

  if (
    updateData.receivedDate
  ) {
    updateData.receivedDate =
      new Date(
        updateData.receivedDate
      );
  }

  if (
    updateData.deliveryDate
  ) {
    updateData.deliveryDate =
      new Date(
        updateData.deliveryDate
      );
  }

  if (
    updateData.warrantyExpiry
  ) {
    updateData.warrantyExpiry =
      new Date(
        updateData.warrantyExpiry
      );
  }

  // =========================================
  // 4. UPDATE MAIN REPAIR JOB
  // =========================================

  // =========================================
  // CAPTURE OLD DIAGNOSIS
  // =========================================

  const oldJob =
    await prisma.repairJob.findUnique({
      where: {
        id,
      },
      select: {
        diagnosis: true,
      },
    });

  const oldDiagnosis =
    String(
      oldJob?.diagnosis || ""
    ).trim();

  const newDiagnosis =
    updateData.diagnosis !== undefined
      ? String(
          updateData.diagnosis || ""
        ).trim()
      : "";

  // =========================================
  // UPDATE MAIN REPAIR JOB
  // =========================================

  // =========================================
// CAPTURE OLD ESTIMATE VALUES
// =========================================

const oldEstimateJob =
  await prisma.repairJob.findUnique({
    where: {
      id,
    },

    select: {
      estimatedCost: true,
      totalAmount: true,
      advanceAmount: true,
      balanceAmount: true,
    },
  });

const oldEstimatedCost =
  Number(
    oldEstimateJob?.estimatedCost ?? 0
  );

const oldTotalAmount =
  Number(
    oldEstimateJob?.totalAmount ?? 0
  );

const oldAdvanceAmount =
  Number(
    oldEstimateJob?.advanceAmount ?? 0
  );

const oldBalanceAmount =
  Number(
    oldEstimateJob?.balanceAmount ?? 0
  );

  let job =
    await prisma.repairJob.update({
      where: {
        id,
      },

      data: updateData,

      include: {
        customer: true,
      },
    });
  console.log(
    "Main Repair Job Updated Successfully"
  );

  console.log(
    "Diagnosis:",
    job.diagnosis
  );

  console.log(
    "Status:",
    job.status
  );

  // =========================================
// AUTOMATIC SMS — JOB DIAGNOSIS
// =========================================
//
// Send only when diagnosis is newly entered.
// Do not send again when the job is merely edited.
//
// =========================================

if (
  updateData.diagnosis !== undefined &&
  !oldDiagnosis &&
  newDiagnosis &&
  job.customer
) {
  try {
    await sendJobDiagnosisSms({
      id: job.id,
      jobNumber: job.jobNumber,
      brand: job.brand,
      model: job.model,
      serialNumber:
        job.serialNumber,
      deviceType:
        job.deviceType,
      complaint:
        job.complaint,
      diagnosis:
        newDiagnosis,

      customer:
        job.customer
          ? {
              id:
                job.customer.id,

              fullName:
                job.customer.fullName,

              phone:
                job.customer.phone,
            }
          : null,
    });
  } catch (error: any) {
    console.error(
      "SMS EVENT: JOB_DIAGNOSIS failed:",
      error?.message ||
        "Unable to send diagnosis SMS."
    );
  }
}

// =========================================
// AUTOMATIC SMS — ESTIMATE
// =========================================

const newEstimatedCost =
  Number(
    job.estimatedCost ?? 0
  );

const newTotalAmount =
  Number(
    job.totalAmount ?? 0
  );

const newAdvanceAmount =
  Number(
    job.advanceAmount ?? 0
  );

const newBalanceAmount =
  Number(
    job.balanceAmount ?? 0
  );

const estimateChanged =
  newEstimatedCost !==
    oldEstimatedCost ||
  newTotalAmount !==
    oldTotalAmount ||
  newAdvanceAmount !==
    oldAdvanceAmount ||
  newBalanceAmount !==
    oldBalanceAmount;

if (
  estimateChanged &&
  job.customer &&
  (
    data.estimatedCost !==
      undefined ||
    data.totalAmount !==
      undefined ||
    data.balanceAmount !==
      undefined
  )
) {
  try {

    await sendEstimateSms({
      id:
        job.id,

      jobNumber:
        job.jobNumber,

      brand:
        job.brand,

      model:
        job.model,

      serialNumber:
        job.serialNumber,

      deviceType:
        job.deviceType,

      complaint:
        job.complaint,

      diagnosis:
        job.diagnosis,

      estimatedCost:
          newTotalAmount,

      totalAmount:
        newTotalAmount,

      advanceAmount:
        newAdvanceAmount,

      dueAmount:
        newBalanceAmount,

      customer:
        job.customer
          ? {
              id:
                job.customer.id,

              fullName:
                job.customer.fullName,

              phone:
                job.customer.phone,
            }
          : null,
    });

  } catch (error) {

    console.error(
      "ESTIMATE SMS ERROR:",
      error
    );

    // SMS failure must NEVER
    // prevent estimate update.
  }
}

  // =========================================
  // 5. UPDATE ACCESSORIES
  // =========================================

  const accessories =
    Array.isArray(
      data.accessories
    )
      ? data.accessories
      : undefined;

  if (
    accessories !== undefined
  ) {
    console.log(
      "Updating Accessories:",
      accessories
    );

    await prisma.repairJobAccessory.deleteMany(
      {
        where: {
          repairJobId: id,
        },
      }
    );

    if (
      accessories.length > 0
    ) {
      await prisma.repairJobAccessory.createMany(
        {
          data:
            accessories.map(
              (
                accessoryId: string
              ) => ({
                repairJobId:
                  id,

                accessoryId:
                  accessoryId,

                received:
                  true,
              })
            ),

          skipDuplicates:
            true,
        }
      );
    }

    console.log(
      "Accessories Updated Successfully"
    );
  }

  // =========================================
  // 6. GET DEVICE TYPE CONFIGURATION
  // =========================================

  const deviceTypeName =
    data.deviceType ||
    existingJob.deviceType;

  const deviceType =
    await prisma.deviceType.findUnique({
      where: {
        name:
          deviceTypeName,
      },

      include: {
        deviceFields: {
          include: {
            deviceField: true,
          },

          orderBy: {
            displayOrder:
              "asc",
          },
        },
      },
    });

  // =========================================
  // 7. UPDATE DYNAMIC DEVICE FIELDS
  // =========================================

  if (deviceType) {
    console.log(
      "Device Type:",
      deviceType.name
    );

    console.log(
      "Dynamic Fields:",
      deviceType.deviceFields.length
    );

    for (
      const mapping of
        deviceType.deviceFields
    ) {
      const deviceField =
        mapping.deviceField;

      if (!deviceField) {
        continue;
      }

      const fieldKey =
        getFieldKey(
          deviceField.name
        );

      if (!fieldKey) {
        continue;
      }

      // Only update if the frontend actually
      // sent this field.
      if (
        !Object.prototype.hasOwnProperty.call(
          data,
          fieldKey
        )
      ) {
        continue;
      }

      const value =
        data[fieldKey] ===
          null ||
        data[fieldKey] ===
          undefined
          ? null
          : String(
              data[fieldKey]
            );

      await prisma.repairJobFieldValue.upsert(
        {
          where: {
            repairJobId_deviceFieldId:
              {
                repairJobId:
                  id,

                deviceFieldId:
                  deviceField.id,
              },
          },

          update: {
            value,
          },

          create: {
            repairJobId:
              id,

            deviceFieldId:
              deviceField.id,

            value,
          },
        }
      );

      console.log(
        "Dynamic Field Updated:",
        deviceField.name,
        "→",
        fieldKey,
        "→",
        value
      );
    }

    console.log(
      "Dynamic Device Fields Updated Successfully"
    );
  }

  // =========================================
  // 8. CUSTOMER LEDGER
  // =========================================
  //
  // Repair ledger structure:
  //
  // Estimate       → DEBIT
  // Discount       → CREDIT
  // Repair Advance → CREDIT
  // Repair Payment → CREDIT
  //
  // Payment credits are created separately
  // by payment.service.ts.
  //
  // Therefore this section must NOT create
  // payment entries.
  // =========================================

  if (
    data.totalAmount !== undefined ||
    data.discount !== undefined ||
    data.advanceAmount !== undefined
  ) {
    // =========================================
    // 8.1 ESTIMATE / REPAIR BILL
    // =========================================

    const estimateParticulars =
      `Estimate - ${job.jobNumber}`;

    const totalAmount =
      Number(job.totalAmount ?? 0);

    const existingEstimate =
      await prisma.customerLedger.findFirst({
        where: {
          repairJobId: job.id,
          particulars: estimateParticulars,
        },
      });

    if (existingEstimate) {
      await prisma.customerLedger.update({
        where: {
          id: existingEstimate.id,
        },
        data: {
          debit: totalAmount,
        },
      });
    } else if (totalAmount > 0) {
      await prisma.customerLedger.create({
        data: {
          customerId: job.customerId,
          repairJobId: job.id,
          particulars: estimateParticulars,
          debit: totalAmount,
          credit: 0,
          balance: totalAmount,
        },
      });
    }

    // =========================================
    // 8.2 DISCOUNT → CREDIT
    // =========================================

    const discount =
      Number(job.discount ?? 0);

    const discountParticulars =
      `Discount - ${job.jobNumber}`;

    const existingDiscount =
      await prisma.customerLedger.findFirst({
        where: {
          repairJobId: job.id,
          particulars: discountParticulars,
        },
      });

    if (discount > 0) {
      if (existingDiscount) {
        await prisma.customerLedger.update({
          where: {
            id: existingDiscount.id,
          },
          data: {
            debit: 0,
            credit: discount,
          },
        });
      } else {
        await prisma.customerLedger.create({
          data: {
            customerId: job.customerId,
            repairJobId: job.id,
            particulars: discountParticulars,
            debit: 0,
            credit: discount,
            balance: 0,
          },
        });
      }
    } else if (existingDiscount) {
      await prisma.customerLedger.delete({
        where: {
          id: existingDiscount.id,
        },
      });
    }

    // =========================================
    // 8.3 INITIAL REPAIR ADVANCE → CREDIT
    // =========================================

    const advanceAmount =
      Number(job.advanceAmount ?? 0);

    const advanceParticulars =
      `Repair Advance - ${job.jobNumber}`;

    const existingAdvance =
      await prisma.customerLedger.findFirst({
        where: {
          repairJobId: job.id,
          particulars: advanceParticulars,
        },
      });

    if (advanceAmount > 0) {
      if (existingAdvance) {
        await prisma.customerLedger.update({
          where: {
            id: existingAdvance.id,
          },
          data: {
            debit: 0,
            credit: advanceAmount,
          },
        });
      } else {
        await prisma.customerLedger.create({
          data: {
            customerId: job.customerId,
            repairJobId: job.id,
            particulars: advanceParticulars,
            debit: 0,
            credit: advanceAmount,
            balance: 0,
          },
        });
      }
    } else if (existingAdvance) {
      await prisma.customerLedger.delete({
        where: {
          id: existingAdvance.id,
        },
      });
    }

    console.log(
      "Customer Ledger synchronized:",
      {
        jobNumber: job.jobNumber,
        totalAmount,
        discount,
        advanceAmount,
      }
    );
  }

  // =========================================
  // 9. GET COMPLETE UPDATED JOB
  // =========================================

  const result =
    await prisma.repairJob.findUnique({
      where: {
        id,
      },

      include: {
        customer: true,

        repairJobAccessories: {
          include: {
            accessory: true,
          },
        },

        repairJobFieldValues: {
          include: {
            deviceField: true,
          },
        },
      },
    });

    // =========================================
   // AUTOMATIC EXCEL BACKUP
  // =========================================

triggerAutomaticExcelBackup();

  // =========================================
  // 10. FINAL LOG
  // =========================================

  console.log(
    "================================="
  );

  console.log(
    "REPAIR JOB UPDATED SUCCESSFULLY"
  );

  console.log(
    "Job Number:",
    result?.jobNumber
  );

  console.log(
    "Job ID:",
    result?.id
  );

  console.log(
    "Diagnosis:",
    result?.diagnosis
  );

  console.log(
    "Status:",
    result?.status
  );

  console.log(
    "================================="
  );

  return result;
}

// =========================================
// DELETE REPAIR JOB
// =========================================

export async function deleteRepairJob(
  id: string
) {
  return prisma.$transaction(
    async (tx) => {
      // =================================
      // CUSTOMER LEDGER
      // =================================

      await tx.customerLedger.deleteMany({
        where: {
          repairJobId: id,
        },
      });

      // =================================
      // DYNAMIC FIELD VALUES
      // =================================

      await tx.repairJobFieldValue.deleteMany({
        where: {
          repairJobId: id,
        },
      });

      // =================================
      // ACCESSORIES
      // =================================

      await tx.repairJobAccessory.deleteMany({
        where: {
          repairJobId: id,
        },
      });

      // =================================
      // FINALLY DELETE JOB
      // =================================

      return tx.repairJob.delete({
        where: {
          id,
        },
      });
    },

    // ===================================
    // DELETE TRANSACTION TIMEOUT
    // ===================================

    {
      timeout: 15000,
    }
  );
}