import puppeteer from "puppeteer"
import { GoogleGenAI } from "@google/genai"
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
    const stopWords = new Set(["a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "it", "it's", "its", "itself", "let's", "me", "more", "most", "my", "myself", "nor", "of", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "she'd", "she'll", "she's", "should", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "we'd", "we'll", "we're", "we've", "were", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "would", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "click", "continue", "button", "shopping", "inc", "affiliates", "conditions", "privacy", "policy", "use", "skip", "content", "navigation", "menu", "toggle", "sign", "login", "register", "search", "page", "home"]);

    // Target semantic content tags to avoid navigation menus and footers
    let mainText = "";
    $("article, main, section, h1, h2, h3, p").each((i, el) => {
      mainText += $(el).text() + " ";
    });
    
    // Fallback if no semantic tags found
    if (!mainText.trim()) {
      mainText = Content;
    }

    // Start AI Extraction
    let aiData = {};
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an intelligent web content extraction engine.

Your task is to crawl and analyze a webpage and produce structured data optimized for:
1. Semantic website search
2. Keyword-based retrieval
3. Company/service discovery
4. Internship/job/service matching
5. Fast indexing in a distributed web crawler system

IMPORTANT GOALS:
- Focus only on meaningful business-related content.
- Ignore navigation bars, ads, footers, cookie popups, scripts, styles, and repeated UI content.
- Extract the MAIN PURPOSE of the website.
- Generate high-quality searchable keywords.
- Detect company domain/category automatically.

OUTPUT FORMAT MUST BE VALID JSON matching exactly this structure:
{
  "page_title": "",
  "meta_description": "",
  "canonical_url": "",
  "website_purpose": "",
  "company_category": [],
  "important_keywords": [],
  "semantic_search_tags": [],
  "named_entities": {
    "companies": [],
    "technologies": [],
    "products": [],
    "locations": []
  },
  "relevance_scores": {
    "technical_content_score": 0,
    "job_related_score": 0,
    "internship_related_score": 0,
    "business_services_score": 0
  },
  "crawl_priority": "HIGH",
  "suggested_internal_links": []
}

Analyze the following webpage content:
Title: ${Title}
Description: ${Description}
Content:
${mainText.substring(0, 15000)}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });
        
        aiData = JSON.parse(response.text);
      } catch (aiError) {
        console.error("AI Extraction failed:", aiError);
      }
    }

    let Keywords = aiData.important_keywords || [];
    
    // Fallback if AI fails or no API key is provided
    if (Keywords.length === 0) {
      let metaKeywords = $('meta[name="keywords"]').attr("content");
      let words = [];
  
      if (metaKeywords) {
        words = metaKeywords.toLowerCase().split(/\s*,\s*/);
      } else {
        words = (Title + " " + Description + " " + mainText)
          .toLowerCase()
          .replace(/[^a-z ]/g," ") 
          .split(/\s+/)
          .filter(word => word.length > 2 && !stopWords.has(word));
      }
  
      const wordCounts = {};
      words.forEach(w => wordCounts[w] = (wordCounts[w] || 0) + 1);
      const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
      
      Keywords = sortedWords.slice(0, 50);
    }

    const PageData = new Page({
      Url,
      Title: aiData.page_title || Title,
      Description: aiData.meta_description || Description,
      Domain,
      Content,
      Links,
      Keywords,
      WebsitePurpose: aiData.website_purpose || "",
      CompanyCategory: aiData.company_category || [],
      SemanticSearchTags: aiData.semantic_search_tags || [],
      NamedEntities: aiData.named_entities || { companies: [], technologies: [], products: [], locations: [] },
      RelevanceScores: aiData.relevance_scores || { technical_content_score: 0, job_related_score: 0, internship_related_score: 0, business_services_score: 0 },
      CrawlPriority: aiData.crawl_priority || "MEDIUM",
      SuggestedInternalLinks: aiData.suggested_internal_links || [],
      CrawledAt: new Date(),
    })

    const savedPage = await PageData.save()
    return { message: "Crawled successfully", data: savedPage }
  } catch (err) {
    console.error("crawl error", err)
    throw err
  }
}