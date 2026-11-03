import express from "express"
import {dbConnection} from "./database/DatabaseConnection";
import authRoute from "./routes/authRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import studentExamRoutes from "./routes/studentExamRoutes.js";


const app = express();

app.use(express.json())
app.use("/api/auth",authRoute)
app.use("/api/admin",adminRoutes)
app.use("/api/class",classRoutes)
app.use("/api/questions", questionRoutes);
app.use("/api/student-exams", studentExamRoutes);
app.use("/api/exams", examRoutes);

dbConnection().then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on port 5000...");
    })
})