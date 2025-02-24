const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db");

const AdminuserRoutes = require("./routes/adminUser.routes");
const OtpRoutes = require("./routes/otp.routes");
const PatientRoutes = require("./routes/patients.routes");
const AvailabilityRoutes = require("./routes/availability.routes");
const supportUserRoutes = require("./routes/support.routes");
const ClinicRoutes = require("./routes/clinic.routes");

const app = express();

// Connect to Database
connectToDb();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.PRODUCTION_FRONTEND_URL || "https://krishdev-clinic.netlify.app",
];

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Incoming Origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// Routes
app.use("/admin", AdminuserRoutes);
app.use("/support", supportUserRoutes);
app.use("/otp", OtpRoutes);
app.use("/patient", PatientRoutes);
app.use("/clinic", ClinicRoutes);
app.use("/availability", AvailabilityRoutes);

module.exports = app;
