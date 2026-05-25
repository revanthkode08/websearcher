import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"

import adminApi from "./Api/AdminApi.js"
import userApi from "./Api/UserApi.js"
import authorApi from "./Api/AuthorApi.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// mount APIs under /app to match test requests
app.use("/app/admin",adminApi)
app.use("/app/user",userApi)
app.use("/app/author",authorApi)

app.listen(process.env.PORT,()=>{
 console.log("Server running")
})