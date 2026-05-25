import mongoose from "mongoose"

const PageSchema = new mongoose.Schema({
 Url:String,
 Title:String,
 Description:String,
 Domain:String,
 Content:String,
 Keywords:[String],
 Links:[String],
 CrawledAt:Date
})

PageSchema.index({ Title: "text", Content: "text", Keywords: "text" })

export default mongoose.model("Page",PageSchema)