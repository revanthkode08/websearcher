import { useState, useEffect } from "react"
import axios from "axios"
import { 
  Globe, Users, Activity, Database, Search, 
  Plus, Cpu, RefreshCw, ExternalLink, Tag, 
  X, ChevronRight, Hash, Server, BarChart2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../lib/utils"

export default function AuthorDashboard() {
  const [Url, setUrl] = useState("")
  const [Title, setTitle] = useState("")
  const [Content, setContent] = useState("")
  const [Keywords, setKeywords] = useState("")
  const [CrawlUrl, setCrawlUrl] = useState("")
  const [Stats, setStats] = useState(null)
  const [Websites, setWebsites] = useState([])
  const [Message, setMessage] = useState("")
  const [Loading, setLoading] = useState(false)
  const [SelectedSite, setSelectedSite] = useState(null)

  useEffect(() => {
    fetchStats()
    fetchWebsites()
  }, [])

  const fetchWebsites = async () => {
    try {
      const res = await axios.get("https://websearcher-p0lw.onrender.com/app/admin/websites")
      setWebsites(res.data)
    } catch(e) {
      console.error("Failed to fetch websites", e)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get("https://websearcher-p0lw.onrender.com/app/admin/stats")
      setStats(res.data)
    } catch(e) {
      console.error("Failed to fetch stats", e)
    }
  }

  const showToast = (msg) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleAddWebsite = async() => {
    setLoading(true)
    try {
      await axios.post(
        "https://websearcher-p0lw.onrender.com/app/author/add-page",
        { Url, Title, Content, Keywords: Keywords.split(",").map(k => k.trim()) }
      )
      showToast("Website Added Successfully")
      fetchStats()
      fetchWebsites()
      setUrl(""); setTitle(""); setContent(""); setKeywords("")
    } catch(err) {
      showToast("Error adding website")
    } finally {
      setLoading(false)
    }
  }

  const handleCrawl = async() => {
    if (!CrawlUrl) return
    setLoading(true)
    try {
      const res = await axios.post("https://websearcher-p0lw.onrender.com/app/admin/crawl", { Url: CrawlUrl })
      showToast(res.data.message || "Crawled successfully")
      fetchStats()
      fetchWebsites()
      setCrawlUrl("")
    } catch(e) {
      const err = e.response?.data?.error || e.response?.data?.message || "Crawl failed"
      showToast(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 p-4 md:p-8">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {Message && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-card border border-border shadow-2xl px-4 py-3 rounded-lg"
          >
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{Message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-border/50">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Infrastructure Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitor distributed crawler nodes and index metrics.</p>
          </div>
          <button 
            onClick={() => { fetchStats(); fetchWebsites(); }}
            className="mt-4 md:mt-0 flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Data
          </button>
        </header>

        {/* Top KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Total Indexed Pages" value={Stats?.totalPages || 0} icon={<Database className="h-4 w-4 text-blue-500" />} />
          <MetricCard title="Registered Users" value={Stats?.totalUsers || 0} icon={<Users className="h-4 w-4 text-emerald-500" />} />
          <MetricCard title="Active Root Domains" value={Stats?.activeDomains?.length || 0} icon={<Globe className="h-4 w-4 text-purple-500" />} />
          <MetricCard title="Crawler Status" value={Stats?.crawlStatus || "Offline"} icon={<Server className="h-4 w-4 text-orange-500" />} highlight />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Console Left - 8 cols */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Run Crawler Task */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground tracking-tight">Deploy Crawler Job</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Initialize the distributed spider to crawl, extract semantics via Gemini, and build text indexes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <input
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
                    placeholder="https://example.com"
                    value={CrawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleCrawl}
                  disabled={Loading || !CrawlUrl}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {Loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  {Loading ? "Executing..." : "Run Job"}
                </button>
              </div>
            </div>

            {/* Manual Injection */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="h-5 w-5 text-emerald-500" />
                <h2 className="font-semibold text-foreground tracking-tight">Manual Database Injection</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputBox label="Resource URL" placeholder="https://..." value={Url} onChange={setUrl} />
                  <InputBox label="Document Title" placeholder="Page Title" value={Title} onChange={setTitle} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Raw Content / Semantic Block</label>
                  <textarea
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors h-24 resize-none font-mono"
                    placeholder="Extract data..."
                    value={Content}
                    onChange={(e)=>setContent(e.target.value)}
                  />
                </div>
                <InputBox label="Keywords (Comma separated)" placeholder="react, tailwind, UI" value={Keywords} onChange={setKeywords} />
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleAddWebsite}
                    disabled={Loading || !Url}
                    className="bg-muted hover:bg-muted/80 text-foreground border border-border px-5 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Insert Record
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Side Analytics Right - 4 cols */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <BarChart2 className="h-4 w-4" /> Search Telemetry
              </h3>
              <div className="space-y-3">
                {Stats?.mostSearched?.length > 0 ? (
                  Stats.mostSearched.map((s, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                        {s._id}
                      </span>
                      <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
                        {s.count} hits
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No telemetry available.</p>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Node Distribution
              </h3>
              <div className="space-y-3">
                {Stats?.activeDomains?.length > 0 ? (
                  Stats.activeDomains.map((d, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2 text-foreground truncate">
                        <img src={`https://www.google.com/s2/favicons?domain=${d._id}&sz=32`} className="w-3.5 h-3.5 rounded-sm" alt=""/>
                        <span className="truncate max-w-[150px]">{d._id}</span>
                      </span>
                      <span className="text-[10px] font-mono text-primary">
                        {d.count} nodes
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No topology data.</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Data Grid */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mt-8">
          <div className="flex items-center justify-between p-5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">Indexed Web Graph</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{Websites.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="px-5 py-3 font-medium text-muted-foreground">Resource</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Metadata</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground hidden lg:table-cell">Indexed At</th>
                  <th className="px-5 py-3 font-medium text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {Websites.map(site => (
                  <tr key={site._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4 w-1/2">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground truncate max-w-sm">{site.Title || "Untitled"}</span>
                        <a href={site.Url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-500 hover:underline flex items-center gap-1 mt-1 truncate max-w-sm">
                          {site.Url}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                        {site.SemanticSearchTags?.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[10px] bg-muted border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                            {tag}
                          </span>
                        )) || (
                          <span className="text-xs text-muted-foreground italic">No AI tags</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-[12px] text-muted-foreground font-mono">
                      {site.CrawledAt ? new Date(site.CrawledAt).toISOString().split('T')[0] : 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSite(site)}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center"
                      >
                        Inspect <ChevronRight className="h-3 w-3 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))}
                {Websites.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-muted-foreground text-sm">
                      No records found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* INSPECT MODAL */}
      <AnimatePresence>
        {SelectedSite && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSite(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 truncate pr-4">
                  <Hash className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground truncate">{SelectedSite.Title}</h3>
                </div>
                <button onClick={() => setSelectedSite(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Source URL</p>
                  <a href={SelectedSite.Url} target="_blank" rel="noreferrer" className="text-sm font-mono text-blue-500 hover:underline flex items-center gap-2">
                    {SelectedSite.Url} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Primary Domain</p>
                    <p className="text-sm text-foreground">{SelectedSite.Domain}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Ingestion Date</p>
                    <p className="text-sm font-mono text-foreground">{SelectedSite.CrawledAt ? new Date(SelectedSite.CrawledAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                {SelectedSite.Description && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Meta Description</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{SelectedSite.Description}</p>
                  </div>
                )}

                {SelectedSite.WebsitePurpose && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">AI Deduced Purpose</p>
                    <div className="p-3 bg-muted/50 rounded-lg border border-border text-sm text-foreground/90 leading-relaxed">
                      {SelectedSite.WebsitePurpose}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Extracted Vectors / Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {/* Combine AI Tags and standard Keywords, filtering duplicates */}
                    {Array.from(new Set([...(SelectedSite.SemanticSearchTags || []), ...(SelectedSite.Keywords || [])])).map((kw, i) => (
                      <span key={i} className="px-2 py-1 text-[11px] bg-primary/10 text-primary border border-primary/20 rounded-md">
                        {kw}
                      </span>
                    ))}
                    {!(SelectedSite.SemanticSearchTags?.length > 0) && !(SelectedSite.Keywords?.length > 0) && (
                      <span className="text-xs text-muted-foreground">No tags or keywords generated.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Raw Text Buffer (Preview)</p>
                  <div className="p-4 bg-background border border-border rounded-lg text-[12px] font-mono text-muted-foreground h-40 overflow-y-auto">
                    {SelectedSite.Content || "No raw text available."}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

function MetricCard({ title, value, icon, highlight }) {
  return (
    <div className={cn(
      "bg-card border rounded-xl p-5 flex flex-col gap-3 transition-colors",
      highlight ? "border-primary/50 shadow-[0_0_15px_-3px_rgba(124,58,237,0.1)]" : "border-border"
    )}>
      <div className="flex justify-between items-start">
        <h3 className="text-xs font-medium text-muted-foreground">{title}</h3>
        <div className="p-1.5 bg-muted rounded-md">{icon}</div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function InputBox({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}