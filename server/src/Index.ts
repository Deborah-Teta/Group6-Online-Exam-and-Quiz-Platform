import express from "express"
import {dbConnection} from "./database/DatabaseConnection";
import authRoute from "./routes/authRoute.js";

const app = express();

app.use(express.json())
app.use("/api/auth",authRoute)

dbConnection().then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on port 5000...");
    })
})