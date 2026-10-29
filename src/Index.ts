import express from "express"
import {dbConnection} from "./database/DatabaseConnection";

const app = express();

dbConnection().then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on port 5000...");
    })
})