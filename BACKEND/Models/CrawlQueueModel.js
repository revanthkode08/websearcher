import mongoose from "mongoose"

const CrawlQueueSchema = new mongoose.Schema({

 Url:String,

 Status:{
 type:String,
 default:"Pending"
 }

})

export default mongoose.model("CrawlQueue",CrawlQueueSchema)
