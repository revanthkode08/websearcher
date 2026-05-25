import express from "express"
import Page from "../Models/PageModel.js"

const Router = express.Router()

Router.post("/add-page",async(req,res)=>{

 const PageData = await Page.create(req.body)

 res.json(PageData)

})

export default Router