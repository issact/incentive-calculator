import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import salesRoutes from "./routes/sales.routes.js"
import incentiveRoutes from "./routes/incentive.routes.js"
import reportRoutes from "./routes/report.routes.js"
import healthRoutes from "./routes/health.routes.js"
import { errorHandler, notFound } from "./middleware/error.middleware.js"


(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

const app = express();

if (process.env.NODE_ENV === "production") {
    // Needed for secure cookies behind Render / reverse proxies.
    app.set("trust proxy", 1)
}

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (no Origin header).
        if (!origin) return callback(null, true)

        if (corsOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(null, false)
    },
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());


app.use("/", healthRoutes)

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/incentives", incentiveRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use(notFound)
app.use(errorHandler)

export default app
