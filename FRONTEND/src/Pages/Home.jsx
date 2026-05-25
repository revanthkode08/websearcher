import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { UseAuthStore } from "../Store/AuthStore"
import { Link, useLocation } from "react-router-dom"

export default function Home(){
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

 const Token = UseAuthStore(state=>state.Token)
 const User = UseAuthStore(state=>state.User)
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

 // Shortcuts state
 const getStorageKey = () => User ? `google_shortcuts_${User._id}` : null;
 const [shortcuts, setShortcuts] = useState([]);
 const [showModal, setShowModal] = useState(false);
 const [newShortcutName, setNewShortcutName] = useState("");
 const [newShortcutUrl, setNewShortcutUrl] = useState("");

 useEffect(() => {
   const key = getStorageKey();
   if(key) {
     const saved = localStorage.getItem(key);
     setShortcuts(saved ? JSON.parse(saved) : []);
   } else {
     setShortcuts([]);
   }
   
   if (User) {
     fetchHistory()
   }
 }, [User]);

 const fetchHistory = async () => {
   try {
     const res = await axios.get(`http://localhost:5000/app/user/history/${User._id}`)
     // Get unique recent searches
     const uniqueHistory = [...new Set(res.data.map(h => h.query))].reverse().slice(0, 5)
     setSearchHistory(uniqueHistory)
   } catch (e) {
     console.error("History fetch error", e)
   }
 }

 // Close suggestions when clicking outside
 useEffect(() => {
   function handleClickOutside(event) {
     if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
       setShowSuggestions(false)
     }
   }
   document.addEventListener("mousedown", handleClickOutside)
   return () => document.removeEventListener("mousedown", handleClickOutside)
 }, [])

 const fetchSuggestions = async (q) => {
   if(q.length < 2) {
     setSuggestions([])
     return
   }
   try {
     const res = await axios.get(`http://localhost:5000/app/user/suggest?q=${q}`)
     setSuggestions(res.data)
   } catch(e) {
     console.error("Suggestions error", e)
   }
 }

 const handleQueryChange = (e) => {
   const val = e.target.value
   setQuery(val)
   setShowSuggestions(true)
   if (val.trim()) {
     fetchSuggestions(val)
   }
 }

 const handleAddShortcut = () => {
   if(!newShortcutName.trim() || !newShortcutUrl.trim()) return;
   try {
     const urlObj = new URL(newShortcutUrl.startsWith('http') ? newShortcutUrl : `https://${newShortcutUrl}`);
     const newShortcut = {
       name: newShortcutName,
       url: urlObj.href,
       icon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`
     };
     const updated = [...shortcuts, newShortcut];
     setShortcuts(updated);
     const key = getStorageKey();
     if(key) localStorage.setItem(key, JSON.stringify(updated));
     setShowModal(false);
     setNewShortcutName("");
     setNewShortcutUrl("");
   } catch (e) {
     alert("Please enter a valid URL.");
   }
 };

 const executeSearch = async(q, pageToFetch = 1) => {
   if(!q.trim()) return;

   if(!Token) {
     setShowAuthPrompt(true);
     return;
   }
   setShowAuthPrompt(false);
   setIsLoading(true)
   setShowSuggestions(false)

   try{
     const startTime = performance.now()
     const Res = await axios.get(
       `http://localhost:5000/app/user/search?q=${q}&page=${pageToFetch}&limit=10&domain=${DomainFilter}`
     )
     const endTime = performance.now()
     
     // Save history
     if(User && pageToFetch === 1) {
       await axios.post('http://localhost:5000/app/user/history', { userId: User._id, query: q }).catch(e=>console.error(e))
       fetchHistory() // Refresh history after searching
     }

     setResults(Res.data.results || [])
     setPage(Res.data.currentPage || 1)
     setTotalPages(Res.data.totalPages || 1)
     setSearchStats({
       time: ((endTime - startTime) / 1000).toFixed(2),
       count: Res.data.totalResults || 0
     })
     setHasSearched(true)
   }
   catch(err){
     console.error(err)
     setResults([])
     setHasSearched(true)
   } finally {
     setIsLoading(false)
   }
 }

 const handleKeyDown = (e) => {
   if (e.key === "Enter") executeSearch(Query, 1)
 }

 const suggestionClick = (s) => {
   setQuery(s)
   executeSearch(s, 1)
 }

 return(
   <div className="flex flex-col min-h-screen font-sans bg-white dark:bg-gray-900 transition-colors">
     {/* MAIN CONTENT WRAPPER */}
     <div className={`flex flex-col items-center w-full px-4 ${HasSearched ? 'pt-8' : 'pt-32 justify-center flex-grow mb-32'}`}>
       
       {/* LOGO */}
       <div className={`transition-all duration-500 ease-in-out ${HasSearched ? 'text-3xl mb-4 self-start md:ml-24 lg:ml-36' : 'text-7xl mb-8'} font-medium tracking-tight select-none`}>
         <span className="text-blue-500">W</span>
         <span className="text-red-500">e</span>
         <span className="text-yellow-500">b</span>
         <span className="text-blue-500">s</span>
         <span className="text-green-500">e</span>
         <span className="text-red-500">a</span>
         <span className="text-yellow-500">r</span>
         <span className="text-blue-500">c</span>
         <span className="text-green-500">h</span>
         <span className="text-red-500">e</span>
         <span className="text-blue-500">r</span>
       </div>

       {/* SEARCH BAR AREA */}
       <div className={`w-full max-w-2xl ${HasSearched ? 'self-start md:ml-24 lg:ml-36' : ''}`} ref={searchContainerRef}>
         <div className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:shadow-md px-4 py-3 focus-within:shadow-md focus-within:border-blue-300 transition-all z-20">
           <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
           </svg>
           <input
             className="flex-grow focus:outline-none text-[16px] text-gray-800 dark:text-gray-100 bg-transparent"
             placeholder="Search Websearcher or type a URL"
             value={Query}
             onChange={handleQueryChange}
             onKeyDown={handleKeyDown}
             onFocus={()=>setShowSuggestions(true)}
           />
           {Query && (
             <button onClick={() => {setQuery(''); setShowSuggestions(false); setResults([]); setHasSearched(false);}} className="text-gray-400 hover:text-gray-600 mr-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
           )}
           <svg onClick={()=>executeSearch(Query, 1)} className="w-5 h-5 text-blue-500 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
           </svg>
         </div>

         {/* AUTO SUGGESTIONS & RECENT HISTORY */}
         {ShowSuggestions && (
           <div className="absolute w-full max-w-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl mt-1 py-2 z-10 top-full">
             
             {/* Show Recent History if query is empty */}
             {!Query.trim() && SearchHistory.length > 0 && (
               <>
                 <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                   Recent Searches
                 </div>
                 {SearchHistory.map((s, i) => (
                   <div key={`history-${i}`} onClick={()=>suggestionClick(s)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                     <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     <span className="text-purple-700 dark:text-purple-300 font-medium">{s}</span>
                   </div>
                 ))}
               </>
             )}

             {/* Show Suggestions if query is typed */}
             {Query.trim() && Suggestions.length > 0 && Suggestions.map((s, i) => (
               <div key={`suggest-${i}`} onClick={()=>suggestionClick(s)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3">
                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                 <span className="text-gray-700 dark:text-gray-200">{s}</span>
               </div>
             ))}

             {!Query.trim() && SearchHistory.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No recent searches.
                </div>
             )}
             
             {Query.trim() && Suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Press Enter to search for "{Query}"
                </div>
             )}
           </div>
         )}
         
         {/* BUTTONS (Only show on initial home view) */}
         {!HasSearched && (
           <div className="flex justify-center gap-3 mt-6">
             <button onClick={()=>executeSearch(Query, 1)} className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border border-transparent px-4 py-2 rounded text-sm hover:shadow-sm transition-all">
               Websearcher Search
             </button>
             <button className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 border border-transparent px-4 py-2 rounded text-sm hover:shadow-sm transition-all">
               I'm Feeling Lucky
             </button>
           </div>
         )}
       </div>

       {/* AUTH PROMPT OR SHORTCUTS OR RESULTS */}
       {ShowAuthPrompt ? (
         <div className="mt-10 p-6 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700/50 rounded-xl max-w-sm text-center shadow-sm">
           <p className="mb-4 font-medium">You must be logged in to search the web.</p>
           <div className="flex gap-4 justify-center">
             <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded shadow hover:bg-blue-700 font-medium transition-colors">Login</Link>
             <Link to="/register" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-5 py-2 rounded shadow hover:bg-blue-50 dark:hover:bg-gray-700 font-medium transition-colors">Register</Link>
           </div>
         </div>
       ) : !HasSearched ? (
         Token ? (
           <div className="mt-10 flex gap-4 max-w-2xl flex-wrap justify-center">
             {shortcuts.map((item, idx) => (
               <a href={item.url} target="_blank" rel="noreferrer" key={idx} className="flex flex-col items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer transition-colors w-28 group">
                 <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600 group-hover:shadow-md transition-shadow">
                   <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
                 </div>
                 <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate w-full text-center">{item.name}</span>
               </a>
             ))}
             <div onClick={() => setShowModal(true)} className="flex flex-col items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer transition-colors w-28 group">
               <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-dashed rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-gray-300 transition-all">
                 <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
               </div>
               <span className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate w-full text-center">Add shortcut</span>
             </div>
           </div>
         ) : null
       ) : (
         <div className="w-full flex flex-col md:flex-row mt-6 max-w-6xl mx-auto md:ml-24 lg:ml-36">
           
           {/* MAIN RESULTS COLUMN */}
           <div className="w-full md:w-[650px] pr-0 md:pr-8">
             
             {/* Search Stats */}
             {!IsLoading && SearchStats && (
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                 About {SearchStats.count} results ({SearchStats.time} seconds)
               </p>
             )}

             {/* LOADING STATE */}
             {IsLoading ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                 <p className="text-gray-500 dark:text-gray-400 font-medium">Searching Websearcher...</p>
                 <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded mt-4 overflow-hidden">
                   <div className="h-full bg-blue-500 animate-pulse w-full"></div>
                 </div>
               </div>
             ) : Results.length === 0 ? (
               <div className="py-10">
                 <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">Your search - <b>{Query}</b> - did not match any documents.</p>
                 <p className="text-gray-600 dark:text-gray-400">Suggestions:</p>
                 <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-400">
                   <li>Make sure all words are spelled correctly.</li>
                   <li>Try different keywords.</li>
                   <li>Try more general keywords.</li>
                 </ul>
               </div>
             ) : (
               <div className="flex flex-col gap-8 mb-10">
                 {Results.map((PageData, i)=>(
                   <div key={i} className="flex flex-col bg-white dark:bg-gray-900 rounded-lg p-4 border border-transparent hover:border-gray-100 dark:hover:border-gray-800 hover:shadow-sm transition-all group">
                     <div className="flex items-center gap-3 mb-2">
                       <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                         {PageData.Domain ? (
                           <img src={`https://www.google.com/s2/favicons?domain=${PageData.Domain}&sz=128`} alt="" className="w-4 h-4 object-contain rounded-full" />
                         ) : (
                           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                         )}
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-full">
                           {PageData.Domain || 'Unknown Source'}
                         </span>
                         <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full">
                           {PageData.Url}
                         </span>
                       </div>
                     </div>
                     <a href={PageData.Url} target="_blank" rel="noopener noreferrer" className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mb-1 font-medium decoration-1 underline-offset-2">
                       {PageData.Title}
                     </a>
                     <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] leading-snug">
                       {PageData.Description ? PageData.Description : PageData.Content?.substring(0, 160) + "..."}
                     </p>
                     
                     {/* Metadata Footer */}
                     <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-50 dark:border-gray-800/50">
                       {PageData.Domain && (
                         <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md">
                           🏷️ {PageData.Domain.split('.')[0]}
                         </span>
                       )}
                       {PageData.score && (
                         <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                           <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                           Score: {PageData.score.toFixed(2)}
                         </span>
                       )}
                     </div>
                   </div>
                 ))}

                 {/* PAGINATION */}
                 {TotalPages > 1 && (
                   <div className="flex items-center justify-center gap-4 mt-8 pb-8">
                     <button 
                       disabled={Page === 1}
                       onClick={() => executeSearch(Query, Page - 1)}
                       className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                       Previous
                     </button>
                     <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                       Page {Page} of {TotalPages}
                     </span>
                     <button 
                       disabled={Page === TotalPages}
                       onClick={() => executeSearch(Query, Page + 1)}
                       className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                       Next
                     </button>
                   </div>
                 )}
               </div>
             )}
           </div>

           {/* FILTERS SIDEBAR */}
           {!IsLoading && Results.length > 0 && (
             <div className="w-full md:w-64 mt-8 md:mt-0 pt-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pl-0 md:pl-8">
               <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Filters</h3>
               
               <div className="mb-6">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Domain Filter</label>
                 <div className="flex items-center gap-2">
                   <input 
                     type="text" 
                     placeholder="e.g. github.com"
                     value={DomainFilter}
                     onChange={(e)=>setDomainFilter(e.target.value)}
                     className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                   />
                 </div>
               </div>

               <button 
                 onClick={() => executeSearch(Query, 1)}
                 className="w-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium py-2 px-4 rounded-md text-sm transition-colors"
               >
                 Apply Filters
               </button>
             </div>
           )}

         </div>
       )}

     </div>

     {/* Add Shortcut Modal */}
     {showModal && (
       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
         <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
           <h3 className="text-lg font-bold mb-5 text-gray-900 dark:text-white">Add shortcut</h3>
           <div className="mb-4">
             <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Name</label>
             <input 
               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors" 
               value={newShortcutName} 
               onChange={e=>setNewShortcutName(e.target.value)} 
             />
           </div>
           <div className="mb-8">
             <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">URL</label>
             <input 
               className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors" 
               value={newShortcutUrl} 
               onChange={e=>setNewShortcutUrl(e.target.value)} 
               placeholder="e.g. google.com"
             />
           </div>
           <div className="flex justify-end gap-3">
             <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
             <button onClick={handleAddShortcut} className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-all ${newShortcutName.trim() && newShortcutUrl.trim() ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg' : 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'}`} disabled={!newShortcutName.trim() || !newShortcutUrl.trim()}>Done</button>
           </div>
         </div>
       </div>
     )}

   </div>
 )
}