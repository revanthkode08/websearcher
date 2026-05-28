import express from "express"
import {CrawlWebsite} from "../Services/CrawlerService.js"
import User from "../Models/UserModel.js"
import Page from "../Models/PageModel.js"

const Router = express.Router()

Router.post("/crawl",async(req,res)=>{
 try {
  const Result = await CrawlWebsite(req.body.Url)
  res.json(Result)
 } catch(err) {
  res.status(500).json({ error: err.message, message: "Puppeteer failed to launch or crawl the website. This is common on hosting platforms like Render if Chrome dependencies are missing." })
 }
})

Router.get("/websites", async (req, res) => {
  try {
    const websites = await Page.find();
    res.json(websites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

Router.get("/stats", async(req,res)=>{
 try {
  const totalUsers = await User.countDocuments()
  const totalPages = await Page.countDocuments()
  
  // Aggregate to find most searched keywords across all users' histories
  const mostSearched = await User.aggregate([
    { $unwind: "$SearchHistory" },
    { $group: { _id: "$SearchHistory.query", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ])

  // Get active domains
  const activeDomains = await Page.aggregate([
    { $group: { _id: "$Domain", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  res.json({
    totalUsers,
    totalPages,
    mostSearched,
    activeDomains,
    crawlStatus: "Active"
  })
 } catch(err) {
  res.status(500).json({message: err.message})
 }
})

export default Router