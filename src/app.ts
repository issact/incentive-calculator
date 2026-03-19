import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import salesRoutes from "./routes/sales.routes.js"
import incentiveRoutes from "./routes/incentive.routes.js"
import reportRoutes from "./routes/report.routes.js"


(BigInt.prototype as any).toJSON = function () {
    return this.toString()
}

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sales", salesRoutes);
app.use("/incentives", incentiveRoutes);
app.use("/reports", reportRoutes);

export default app
