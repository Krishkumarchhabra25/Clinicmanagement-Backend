const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db");

const AdminuserRoutes = require("./routes/adminUser.routes");
const OtpRoutes = require("./routes/otp.routes");
const PatientRoutes = require("./routes/patients.routes");
const AvailabilityRoutes = require("./routes/availability.routes")
const supportUserRoutes = require("./routes/support.routes")
const ClinicRoutes = require("./routes/clinic.routes")
const app = express();

// Connect to Database
connectToDb();

// Configure CORS Properly
app.use(
  cors({
    origin: "*", // Frontend URL
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Preflight Handling
app.options("*", cors());

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes
app.use("/admin", AdminuserRoutes);
app.use("/support" , supportUserRoutes)
app.use("/otp", OtpRoutes);
app.use("/patient", PatientRoutes);
app.use("/clinic" , ClinicRoutes)

app.use("/availability" , AvailabilityRoutes)

module.exports = app;
