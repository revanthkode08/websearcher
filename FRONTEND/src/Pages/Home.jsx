import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { UseAuthStore } from "../Store/AuthStore"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Loader2, Link2, ExternalLink, Activity, Clock, Plus, Command } from "lucide-react"

export default function Home() {
  const [Query, setQuery] = useState("")
  const [Suggestions, setSuggestions] = useState([])
  const [SearchHistory, setSearchHistory] = useState([])
  const [ShowSuggestions, setShowSuggestions] = useState(false)
  const [Results, setResults] = useState([])
  const [HasSearched, setHasSearched] = useState(false)
  const [IsLoading, setIsLoading] = useState(false)
  const [ShowAuthPrompt, setShowAuthPrompt] = useState(false)
  
  // Pagination & Filters
  const [Page, setPage] = useState(1)
  const [TotalPages, setTotalPages] = useState(1)
  const [DomainFilter, setDomainFilter] = useState("")
  const [SearchStats, setSearchStats] = useState(null)
  const [isFocused, setIsFocused] = useState(false)

  const Token = UseAuthStore(state => state.Token)
  const User = UseAuthStore(state => state.User)
  const searchContainerRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const qParam = params.get("q")
    if (qParam && Token) {
      setQuery(qParam)
      executeSearch(qParam, 1)
    }
  }, [location.search, Token])

  useEffect(() => {
    if (User) fetchHistory()
  }, [User])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`https://websearcher-p0lw.onrender.com/app/user/history/${User._id}`)
      const uniqueHistory = [...new Set(res.data.map(h => h.query))].reverse().slice(0, 5)
      setSearchHistory(uniqueHistory)
    } catch (e) {
      console.error("History fetch error", e)
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setIsFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSuggestions = async (q) => {
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    try {
      const res = await axios.get(`https://websearcher-p0lw.onrender.com/app/user/suggest?q=${q}`)
      setSuggestions(res.data)
    } catch(e) {
      console.error("Suggestions error", e)
    }
  }

  const handleQueryChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setShowSuggestions(true)
    if (val.trim()) fetchSuggestions(val)
  }

  const executeSearch = async (q, pageToFetch = 1) => {
    if (!q.trim()) return

    if (!Token) {
      setShowAuthPrompt(true)
      return
    }
    setShowAuthPrompt(false)
    setIsLoading(true)
    setShowSuggestions(false)
    setIsFocused(false)

    try {
      const startTime = performance.now()
      const Res = await axios.get(
        `https://websearcher-p0lw.onrender.com/app/user/search?q=${q}&page=${pageToFetch}&limit=10&domain=${DomainFilter}`
      )
      const endTime = performance.now()
      
      if (User && pageToFetch === 1) {
        await axios.post('https://websearcher-p0lw.onrender.com/app/user/history', { userId: User._id, query: q }).catch(e=>console.error(e))
        fetchHistory()
      }

      setResults(Res.data.results || [])
      setPage(Res.data.currentPage || 1)
      setTotalPages(Res.data.totalPages || 1)
      setSearchStats({
        time: ((endTime - startTime) / 1000).toFixed(2),
        count: Res.data.totalResults || 0
      })
      setHasSearched(true)
    } catch(err) {
      console.error(err)
      setResults([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") executeSearch(Query, 1)
  }

  const suggestionClick = (s) => {
    setQuery(s)
    executeSearch(s, 1)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col relative overflow-hidden">
      
      {/* Background subtle glow */}
      {!HasSearched && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      )}

      <main className={`flex w-full flex-col items-center px-4 transition-all duration-700 ease-out z-10 ${HasSearched ? 'pt-8' : 'pt-[20vh] flex-grow'}`}>
        
        {/* LOGO */}
        <motion.div 
          layout
          className={`flex items-center gap-3 ${HasSearched ? 'mb-8 self-start md:ml-32 lg:ml-48' : 'mb-10'}`}
        >
          {!HasSearched && (
             <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
               What do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">find?</span>
             </h1>
          )}
        </motion.div>

        {/* SEARCH BAR CONTAINER */}
        <motion.div 
          layout
          className={`w-full ${HasSearched ? 'max-w-3xl self-start md:ml-32 lg:ml-48' : 'max-w-2xl'}`}
          ref={searchContainerRef}
        >
          <motion.div 
            animate={{ 
              scale: isFocused && !HasSearched ? 1.02 : 1,
              boxShadow: isFocused ? '0 0 0 1px rgba(139, 92, 246, 0.5), 0 8px 32px -8px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border rounded-2xl px-4 py-3.5"
          >
            <Search className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
            <input
              className="flex-grow bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
              placeholder="Ask anything..."
              value={Query}
              onChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { setShowSuggestions(true); setIsFocused(true); }}
            />
            {Query && (
              <button 
                onClick={() => { setQuery(''); setShowSuggestions(false); setResults([]); setHasSearched(false); }} 
                className="rounded-full p-1 hover:bg-muted text-muted-foreground transition-colors mr-2"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            )}
            <button 
              onClick={() => executeSearch(Query, 1)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <Command className="h-3 w-3" /> Return
            </button>
          </motion.div>

          {/* SUGGESTIONS DROPDOWN */}
          <AnimatePresence>
            {ShowSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute w-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-20"
              >
                {!Query.trim() && SearchHistory.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 py-1.5 flex items-center gap-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <Clock className="h-3 w-3" /> Recent Searches
                    </div>
                    {SearchHistory.map((s, i) => (
                      <div key={i} onClick={() => suggestionClick(s)} className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-3 text-sm text-foreground transition-colors">
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {Query.trim() && Suggestions.length > 0 && (
                  <div className="py-2">
                    {Suggestions.map((s, i) => (
                      <div key={i} onClick={() => suggestionClick(s)} className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-3 text-sm text-foreground transition-colors">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AUTH PROMPT */}
        {ShowAuthPrompt && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-card border border-border rounded-xl max-w-md w-full text-center shadow-lg">
            <h3 className="font-semibold text-foreground mb-2">Authentication Required</h3>
            <p className="text-sm text-muted-foreground mb-5">You must be logged in to access the search engine.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Log In</Link>
              <Link to="/register" className="bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">Register</Link>
            </div>
          </motion.div>
        )}

        {/* RESULTS AREA */}
        {HasSearched && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-full flex flex-col md:flex-row mt-8 max-w-6xl mx-auto md:ml-32 lg:ml-48 pb-20"
          >
            {/* MAIN RESULTS COLUMN */}
            <div className="w-full md:w-[700px] pr-0 md:pr-8">
              
              {!IsLoading && SearchStats && (
                <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground font-mono">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Found {SearchStats.count} results in {SearchStats.time}s</span>
                </div>
              )}

              {IsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                      </div>
                      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                      <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : Results.length === 0 ? (
                <div className="py-12 border border-dashed border-border rounded-2xl text-center">
                  <p className="text-foreground font-medium mb-2">No results found for "{Query}"</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your keywords or using broader terms.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {Results.map((PageData, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      key={i} 
                      className="group flex flex-col bg-card hover:bg-muted/30 rounded-2xl p-5 border border-transparent hover:border-border transition-all"
                    >
                      {/* Result Header */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border overflow-hidden">
                          {PageData.Domain ? (
                            <img src={`https://www.google.com/s2/favicons?domain=${PageData.Domain}&sz=64`} alt="" className="w-3.5 h-3.5 object-contain" />
                          ) : <Link2 className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-foreground">{PageData.Domain || 'Unknown Source'}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="text-muted-foreground truncate max-w-[200px]">{PageData.Url}</span>
                        </div>
                      </div>

                      {/* Result Title */}
                      <a href={PageData.Url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 hover:underline mb-2 line-clamp-2">
                        {PageData.Title}
                      </a>

                      {/* Result Snippet */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {PageData.Description || (PageData.Content?.substring(0, 200) + "...")}
                      </p>

                      {/* AI Semantic Data */}
                      {PageData.WebsitePurpose && (
                        <div className="mt-3 pl-3 border-l-2 border-primary/50 text-[13px] text-muted-foreground/90 italic">
                          {PageData.WebsitePurpose}
                        </div>
                      )}

                      {(PageData.CompanyCategory?.length > 0 || PageData.SemanticSearchTags?.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {PageData.CompanyCategory?.map((cat, idx) => (
                            <span key={`cat-${idx}`} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded border border-primary/20">
                              {cat}
                            </span>
                          ))}
                          {PageData.SemanticSearchTags?.slice(0, 4).map((tag, idx) => (
                            <span key={`tag-${idx}`} className="px-2 py-0.5 text-[11px] text-muted-foreground bg-muted rounded border border-border">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Relevance Footer */}
                      {PageData.RelevanceScores && (
                         <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/40 text-[11px] font-medium text-muted-foreground">
                           {PageData.RelevanceScores.technical_content_score > 0 && (
                             <span className="flex items-center gap-1.5">
                               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                               Technical: {PageData.RelevanceScores.technical_content_score}%
                             </span>
                           )}
                           {PageData.RelevanceScores.job_related_score > 0 && (
                             <span className="flex items-center gap-1.5">
                               <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                               Jobs: {PageData.RelevanceScores.job_related_score}%
                             </span>
                           )}
                           {PageData.score && (
                             <span className="ml-auto text-muted-foreground/60">
                               Match Score: {PageData.score.toFixed(2)}
                             </span>
                           )}
                         </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {TotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button disabled={Page === 1} onClick={() => executeSearch(Query, Page - 1)} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors">Prev</button>
                      <span className="text-xs text-muted-foreground font-medium px-4">Page {Page} of {TotalPages}</span>
                      <button disabled={Page === TotalPages} onClick={() => executeSearch(Query, Page + 1)} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-muted disabled:opacity-50 transition-colors">Next</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FILTERS SIDEBAR */}
            {!IsLoading && Results.length > 0 && (
              <div className="w-full md:w-64 mt-8 md:mt-0 pt-2 border-t md:border-t-0 md:border-l border-border md:pl-8">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">Refine Results</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Domain Match</label>
                    <input 
                      type="text" 
                      placeholder="e.g. github.com"
                      value={DomainFilter}
                      onChange={(e)=>setDomainFilter(e.target.value)}
                      className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button onClick={() => executeSearch(Query, 1)} className="w-full bg-primary/10 text-primary hover:bg-primary/20 font-medium py-2 rounded-md text-xs transition-colors">
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  )
}