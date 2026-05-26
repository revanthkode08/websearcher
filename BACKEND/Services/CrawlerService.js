import puppeteer from "puppeteer"
import { load } from "cheerio"
import Page from "../Models/PageModel.js"

export const CrawlWebsite = async (Url) => {
  try {
    // 1. Duplicate Detection
    const existingPage = await Page.findOne({ Url })
    if (existingPage) {
      return { message: "URL already crawled", data: existingPage }
    }

    // Launch puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Mimic real browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9'
    });

    // Navigate and wait for network to idle
    await page.goto(Url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Extract HTML
    const Html = await page.content();
    await browser.close();
    const $ = load(Html)

    const Title = $("title").text() || "No Title"
    
    // Extract Domain
    let Domain = ""
    try {
      Domain = new URL(Url).hostname
    } catch(e) {
      Domain = "unknown"
    }

    // Clean up DOM before extracting text
    $("script, style, noscript, iframe").remove();

    // Extract Description
    let Description = $('meta[name="description"]').attr("content")
    if (!Description) {
      Description = $("body").text().replace(/\s+/g, " ").trim().substring(0, 150) + "..."
    }

    const Content = $("body").text().replace(/\s+/g, " ").trim()
    let Links = []

    $("a").each((i,Element)=>{
      Links.push($(Element).attr("href"))
    })

    // Define a basic set of common stop words to filter out
    const stopWords = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "click", "continue", "button", "shopping", "inc", "affiliates", "conditions", "privacy", "policy", "use"]);

    // Try to get meta keywords first
    let metaKeywords = $('meta[name="keywords"]').attr("content");
    let words = [];

    if (metaKeywords) {
      words = metaKeywords.toLowerCase().split(/\s*,\s*/);
    } else {
      words = Content
        .toLowerCase()
        .replace(/[^a-z ]/g," ") // Replace non-alphabetic characters with space
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word)); // Remove small words and stop words
    }

    const Keywords = [...new Set(words)].slice(0,50)

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