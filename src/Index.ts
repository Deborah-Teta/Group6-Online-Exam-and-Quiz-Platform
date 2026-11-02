import express from "express"
import {dbConnection} from "./database/DatabaseConnection";
import authRoute from "./routes/authRoute.js";
import classRoutes from "./routes/classRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(express.json())
app.use("/api/auth",authRoute)
app.use("/api/class",classRoutes)
app.use("/api/admin", adminRoutes);


dbConnection().then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on port 5000...");
    })
})