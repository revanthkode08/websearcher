import mongoose from "mongoose"

const PageSchema = new mongoose.Schema({
 Url:String,
 Title:String,
 Description:String,
 Domain:String,
 Content:String,
 Keywords:[String],
 Links:[String],
 CrawledAt:Date,
 WebsitePurpose: String,
 CompanyCategory: [String],
 SemanticSearchTags: [String],
 NamedEntities: {
  companies: [String],
  technologies: [String],
  products: [String],
  locations: [String]
 },
 RelevanceScores: {
  technical_content_score: Number,
  job_related_score: Number,
  internship_related_score: Number,
  business_services_score: Number
 },
 CrawlPriority: String,
 SuggestedInternalLinks: [String]
})

PageSchema.index({ Title: "text", Content: "text", Keywords: "text", SemanticSearchTags: "text", CompanyCategory: "text" })

export default mongoose.model("Page",PageSchema)