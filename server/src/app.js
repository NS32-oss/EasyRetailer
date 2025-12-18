import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Load environment variables
dotenv.config();

const app = express();

// Secure HTTP headers with Helmet
app.use(helmet());

// Disable the "X-Powered-By" header to hide Express info
app.disable("x-powered-by");

// Rate Limiting: limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:5174", // Local development (current port)
  "https://easy-retailer.vercel.app", // Deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies to be sent and received
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Import and declare routes
import businessRouter from "./routes/business.router.js";
import productRouter from "./routes/product.router.js";
import salesRouter from "./routes/sales.router.js";
import statisticsRouter from "./routes/statistics.router.js";
import brandRouter from "./routes/brand.router.js";
import returnRouter from "./routes/return.router.js";

app.use("/api/v1/business", businessRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/sales", salesRouter);
app.use("/api/v1/statistics", statisticsRouter);
app.use("/api/v1/brand", brandRouter);
app.use("/api/v1/returns", returnRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
