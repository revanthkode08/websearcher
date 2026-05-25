import axios from "axios"
import { load } from "cheerio"
import https from "https"
import Page from "../Models/PageModel.js"

// allow insecure certificates (development only)
const httpsAgent = new https.Agent({ rejectUnauthorized: false })

export const CrawlWebsite = async (Url) => {
  try {
    // 1. Duplicate Detection
    const existingPage = await Page.findOne({ Url })
    if (existingPage) {
      return { message: "URL already crawled", data: existingPage }
    }

    const Response = await axios.get(Url, { httpsAgent })
    const Html = Response.data
    const $ = load(Html)

    const Title = $("title").text() || "No Title"
    
    // Extract Domain
    let Domain = ""
    try {
      Domain = new URL(Url).hostname
    } catch(e) {
      Domain = "unknown"
    }

    // Extract Description
    let Description = $('meta[name="description"]').attr("content")
    if (!Description) {
      Description = $("body").text().replace(/\s+/g, " ").trim().substring(0, 150) + "..."
    }

    const Content = $("body").text()
    let Links = []

    $("a").each((i,Element)=>{
      Links.push($(Element).attr("href"))
    })

    const Keywords = Content
      .toLowerCase()
      .replace(/[^a-z ]/g,"")
      .split(" ")
      .slice(0,50)

    const PageData = new Page({
      Url,
      Title,
      Description,
      Domain,
      Content,
      Links,
      Keywords,
      CrawledAt: new Date(),
    })

    const savedPage = await PageData.save()
    return { message: "Crawled successfully", data: savedPage }
  } catch (err) {
    console.error("crawl error", err)
    throw err
  }
}