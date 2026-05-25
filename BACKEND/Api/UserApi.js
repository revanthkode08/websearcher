import express from "express"
import {RegisterUser,LoginUser} from "../Services/AuthService.js"
import {SearchPages, SuggestKeywords} from "../Services/SearchService.js"
import User from "../Models/UserModel.js"
import crypto from "crypto"

const Router = express.Router()

// REGISTER
Router.post("/register", async(req,res)=>{
 try{
  const Data = await RegisterUser(req.body)
  res.json({ message:"User registered successfully", Data })
 } catch(err){
  res.status(400).json({message:err.message})
 }
})

// LOGIN
Router.post("/login", async(req,res)=>{
 try{
  const {Email,Password} = req.body
  const result = await LoginUser(Email,Password)
  res.json({ message:"Login successfully", Data: result })
 } catch(err){
  res.status(400).json({ message:err.message })
 }
})

// SEARCH
Router.get("/search", async(req,res)=>{
 try {
  const { q, page = 1, limit = 10, domain = "" } = req.query
  if (!q) return res.json({ results: [], totalPages: 0, currentPage: 1, totalResults: 0 })
  const Result = await SearchPages(q, page, limit, domain)
  res.json(Result)
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

// SUGGEST
Router.get("/suggest", async(req,res)=>{
 try {
  const keywords = await SuggestKeywords(req.query.q)
  res.json(keywords)
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

// HISTORY
Router.post("/history", async(req,res)=>{
 try {
  const { userId, query } = req.body
  if (!userId || !query) return res.status(400).json({message: "Missing data"})
  await User.findByIdAndUpdate(userId, {
    $push: { SearchHistory: { $each: [{query}], $slice: -1000 } }
  })
  res.json({message: "History updated"})
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

Router.get("/history/:userId", async(req,res)=>{
 try {
  const user = await User.findById(req.params.userId)
  if (!user) return res.status(404).json({message: "User not found"})
  res.json(user.SearchHistory)
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

// FORGOT PASSWORD STUB
Router.post("/forgot-password", async(req,res)=>{
 try {
  const { Email } = req.body
  const user = await User.findOne({Email})
  if (!user) return res.status(404).json({message: "User not found"})
  
  const token = crypto.randomBytes(20).toString("hex")
  user.ResetPasswordToken = token
  user.ResetPasswordExpires = Date.now() + 3600000 // 1 hour
  await user.save()
  
  console.log(`[STUB] Password reset link for ${Email}: http://localhost:5173/reset-password/${token}`)
  res.json({message: "Password reset link sent (check server console for stub)"})
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

export default Router