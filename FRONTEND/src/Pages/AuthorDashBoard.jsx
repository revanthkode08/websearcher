import { useState, useEffect } from "react"
import axios from "axios"
import { 
  Globe, 
  Users, 
  Activity, 
  Database, 
  Search, 
  PlusCircle, 
  Cpu,
  RefreshCw,
  ExternalLink,
  Tag
} from "lucide-react"

export default function AuthorDashboard(){
 const [Url, setUrl] = useState("")
 const [Title, setTitle] = useState("")
 const [Content, setContent] = useState("")
 const [Keywords, setKeywords] = useState("")
 const [CrawlUrl, setCrawlUrl] = useState("")
 const [Stats, setStats] = useState(null)
 const [Websites, setWebsites] = useState([])
 const [Message, setMessage] = useState("")
 const [Loading, setLoading] = useState(false)

 useEffect(() => {
   fetchStats()
   fetchWebsites()
 }, [])

 const fetchWebsites = async () => {
   try {
     const res = await axios.get("http://localhost:5000/app/admin/websites")
     setWebsites(res.data)
   } catch(e) {
     console.error("Failed to fetch websites", e)
   }
 }

 const fetchStats = async () => {
   try {
     const res = await axios.get("http://localhost:5000/app/admin/stats")
     setStats(res.data)
   } catch(e) {
     console.error("Failed to fetch stats", e)
   }
 }

 const handleAddWebsite = async()=>{
   setLoading(true)
   try{
     await axios.post(
       "http://localhost:5000/app/author/add-page",
       { Url, Title, Content, Keywords: Keywords.split(",").map(k => k.trim()) }
     )
     setMessage("Website Added Successfully")
     fetchStats()
     fetchWebsites()
     setUrl(""); setTitle(""); setContent(""); setKeywords("")
   } catch(err){
     setMessage("Error adding website")
   } finally {
     setLoading(false)
     setTimeout(() => setMessage(""), 3000)
   }
 }

 const handleCrawl = async() => {
   if(!CrawlUrl) return;
   setLoading(true)
   try {
     const res = await axios.post("http://localhost:5000/app/admin/crawl", { Url: CrawlUrl })
     setMessage(res.data.message || "Crawled successfully")
     fetchStats()
     fetchWebsites()
     setCrawlUrl("")
   } catch(e) {
     setMessage("Crawl failed")
   } finally {
     setLoading(false)
     setTimeout(() => setMessage(""), 3000)
   }
 }

 return(
   <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-6 md:p-10 transition-colors duration-500 font-sans">
     <div className="max-w-7xl mx-auto space-y-10">
       
       {/* HEADER */}
       <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
           <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
             Crawler Command Center
           </h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage and monitor your web indexing infrastructure.</p>
         </div>
         <button 
           onClick={() => { fetchStats(); fetchWebsites(); }}
           className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full shadow-sm backdrop-blur-md border border-gray-200 dark:border-gray-700 transition-all duration-300 group cursor-pointer"
         >
           <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
           Refresh Data
         </button>
       </header>

       {/* NOTIFICATION TOAST */}
       {Message && (
         <div className="fixed top-6 right-6 z-50 animate-bounce">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-blue-500/20 border border-white/20 backdrop-blur-lg font-medium flex items-center gap-3">
             <Activity className="w-5 h-5" />
             {Message}
           </div>
         </div>
       )}

       {/* GLOSSY STATS ROW */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard icon={<Database className="w-6 h-6 text-blue-500" />} label="Indexed Pages" value={Stats?.totalPages || 0} gradient="from-blue-500/10 to-transparent" />
         <StatCard icon={<Users className="w-6 h-6 text-purple-500" />} label="Total Users" value={Stats?.totalUsers || 0} gradient="from-purple-500/10 to-transparent" />
         <StatCard icon={<Activity className="w-6 h-6 text-emerald-500" />} label="Crawl Status" value={Stats?.crawlStatus || "Offline"} gradient="from-emerald-500/10 to-transparent" valueColor="text-emerald-600 dark:text-emerald-400" />
         <StatCard icon={<Globe className="w-6 h-6 text-orange-500" />} label="Active Domains" value={Stats?.activeDomains?.length || 0} gradient="from-orange-500/10 to-transparent" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COL: CRAWLER & ADD SITE */}
         <div className="lg:col-span-2 space-y-8">
           
           {/* CRAWL A WEBSITE */}
           <GlassPanel>
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Run Crawler Task</h2>
             </div>
             <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Deploy the spider to index a new root URL and extract metadata, keywords, and content.</p>
             <div className="flex flex-col sm:flex-row gap-4">
               <input
                 className="flex-grow bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-inner"
                 placeholder="https://example.com"
                 value={CrawlUrl}
                 onChange={(e)=>setCrawlUrl(e.target.value)}
               />
               <button
                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px] cursor-pointer"
                 onClick={handleCrawl}
                 disabled={Loading || !CrawlUrl}
               >
                 {Loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                 {Loading ? "Indexing..." : "Initialize"}
               </button>
             </div>
           </GlassPanel>

           {/* MANUAL ADD */}
           <GlassPanel>
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><PlusCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manual Injection</h2>
             </div>
             <div className="space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <input
                   className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                   placeholder="Website URL"
                   value={Url}
                   onChange={(e)=>setUrl(e.target.value)}
                 />
                 <input
                   className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                   placeholder="Page Title"
                   value={Title}
                   onChange={(e)=>setTitle(e.target.value)}
                 />
               </div>
               <textarea
                 className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all h-32 resize-none"
                 placeholder="Extracted Content"
                 value={Content}
                 onChange={(e)=>setContent(e.target.value)}
               />
               <input
                 className="w-full bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                 placeholder="Keywords (comma separated)"
                 value={Keywords}
                 onChange={(e)=>setKeywords(e.target.value)}
               />
               <button
                 className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                 onClick={handleAddWebsite}
                 disabled={Loading || !Url}
               >
                 <PlusCircle className="w-5 h-5" />
                 {Loading ? "Saving..." : "Inject to Database"}
               </button>
             </div>
           </GlassPanel>

         </div>

         {/* RIGHT COL: ANALYTICS */}
         <div className="space-y-8 flex flex-col">
           
           <GlassPanel className="flex-1">
             <div className="flex items-center gap-2 mb-6">
               <Search className="w-5 h-5 text-gray-400" />
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending Queries</h3>
             </div>
             {Stats?.mostSearched?.length > 0 ? (
               <ul className="space-y-4">
                 {Stats.mostSearched.map((s, i) => (
                   <li key={i} className="flex justify-between items-center group">
                     <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-500 transition-colors flex items-center gap-2">
                       <span className="text-xs text-gray-400 font-mono">{i+1}.</span>
                       {s._id}
                     </span>
                     <span className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600">
                       {s.count}
                     </span>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                 <Activity className="w-8 h-8 mb-2 opacity-50" />
                 <p className="text-sm">No queries yet.</p>
               </div>
             )}
           </GlassPanel>

           <GlassPanel className="flex-1">
             <div className="flex items-center gap-2 mb-6">
               <Globe className="w-5 h-5 text-gray-400" />
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Network Topology</h3>
             </div>
             {Stats?.activeDomains?.length > 0 ? (
               <ul className="space-y-4">
                 {Stats.activeDomains.map((d, i) => (
                   <li key={i} className="flex justify-between items-center">
                     <span className="text-gray-700 dark:text-gray-300 flex items-center gap-3 font-medium">
                       <img src={`https://www.google.com/s2/favicons?domain=${d._id}&sz=32`} className="w-5 h-5 rounded shadow-sm bg-white" alt=""/>
                       <span className="truncate max-w-[150px]">{d._id}</span>
                     </span>
                     <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                       {d.count} pgs
                     </span>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                 <Globe className="w-8 h-8 mb-2 opacity-50" />
                 <p className="text-sm">No domains mapped.</p>
               </div>
             )}
           </GlassPanel>

         </div>

       </div>

       {/* INDEXED DATA GRID */}
       <GlassPanel>
         <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
           <Database className="w-6 h-6 text-indigo-500" />
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Indexed Web Graph</h2>
           <span className="ml-auto bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
             {Websites.length} Records
           </span>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Websites.map(site => (
             <div key={site._id} className="group bg-white/40 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800 p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
               <div className="mb-4">
                 <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={site.Title}>{site.Title || "Untitled Resource"}</h3>
                 <a href={site.Url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate max-w-full group/link" title={site.Url}>
                   <span className="truncate">{site.Url}</span>
                   <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0" />
                 </a>
               </div>
               
               <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
                 {site.Keywords && site.Keywords.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {site.Keywords.slice(0, 3).map((kw, i) => (
                       <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                         <Tag className="w-3 h-3 opacity-50" />
                         {kw}
                       </span>
                     ))}
                     {site.Keywords.length > 3 && (
                       <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-md font-medium border border-gray-200 dark:border-gray-600">
                         +{site.Keywords.length - 3}
                       </span>
                     )}
                   </div>
                 ) : (
                   <span className="text-xs text-gray-400 italic">No metadata tags</span>
                 )}
               </div>
             </div>
           ))}
           {Websites.length === 0 && (
             <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
               <Database className="w-12 h-12 mb-4 opacity-20" />
               <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Database Empty</p>
               <p className="text-sm mt-1 text-center max-w-md">Run the crawler or inject a website manually to populate the indexed web graph.</p>
             </div>
           )}
         </div>
       </GlassPanel>

     </div>
   </div>
 )
}

// Reusable Components

function StatCard({ icon, label, value, gradient, valueColor = "text-gray-900 dark:text-white" }) {
  return (
    <div className={`relative overflow-hidden bg-white/70 dark:bg-gray-800/70 p-6 rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm w-fit group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold tracking-wider uppercase mb-1">{label}</h3>
          <p className={`text-4xl font-extrabold tracking-tight ${valueColor}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

function GlassPanel({ children, className = "" }) {
  return (
    <div className={`bg-white/60 dark:bg-gray-800/60 p-8 rounded-3xl shadow-xl shadow-gray-200/20 dark:shadow-black/20 border border-white/40 dark:border-gray-700/40 backdrop-blur-2xl ${className}`}>
      {children}
    </div>
  )
}