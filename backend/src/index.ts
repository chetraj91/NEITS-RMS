import express from "express";
import cors from "cors";
import { env } from "./config/env";

import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes";
import repairJobRoutes from "./routes/repairJob.routes";
import technicianRoutes from "./routes/technician.routes";
import inventoryRoutes from "./routes/inventory.routes";

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/repair-jobs", repairJobRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/inventory", inventoryRoutes);

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    application: "NEITS Repair Management System",
    version: "1.0.0",
    status: "Running",
  });
});

// Start Server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});