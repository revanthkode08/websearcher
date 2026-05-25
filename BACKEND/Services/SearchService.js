import Page from "../Models/PageModel.js"

export const SearchPages = async(Query, page = 1, limit = 10, domain = "")=>{
  const skip = (page - 1) * limit
  
  let queryObj = { $text: { $search: Query } }
  
  if (domain && domain !== "") {
    queryObj.Domain = { $regex: domain, $options: "i" }
  }

  const Pages = await Page.find(
    queryObj,
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .skip(skip)
  .limit(parseInt(limit))

  const total = await Page.countDocuments(queryObj)

  return {
    results: Pages,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    totalResults: total
  }
}

export const SuggestKeywords = async(Query) => {
  if (!Query || Query.length < 2) return []
  
  const suggestions = await Page.aggregate([
    { $match: { Keywords: { $regex: `^${Query}`, $options: "i" } } },
    { $unwind: "$Keywords" },
    { $match: { Keywords: { $regex: `^${Query}`, $options: "i" } } },
    { $group: { _id: "$Keywords", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ])
  
  return suggestions.map(s => s._id)
}