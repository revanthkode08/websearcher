import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UseAuthStore } from "../Store/AuthStore"

export default function Header(){

 const location = useLocation()
 const navigate = useNavigate()
 const logout = UseAuthStore(state => state.Logout)
 const token = UseAuthStore(state => state.Token)
 const user = UseAuthStore(state => state.User)
 const [dropdownOpen, setDropdownOpen] = useState(false)
 const [darkMode, setDarkMode] = useState(
   localStorage.getItem('theme') === 'dark'
 )

 useEffect(() => {
   if (darkMode) {
     document.documentElement.classList.add('dark')
     localStorage.setItem('theme', 'dark')
   } else {
     document.documentElement.classList.remove('dark')
     localStorage.setItem('theme', 'light')
   }
 }, [darkMode])

 const handleLogout = () => {
   logout()
   setDropdownOpen(false)
   navigate("/")
 }

 return(
   <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
     <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
       
       <Link to="/" className="flex items-center gap-2 group">
         <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:shadow-md transition-shadow">
           W
         </div>
         <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
           Websearcher
         </span>
       </Link>

       <div className="flex items-center gap-4">
         <button 
           onClick={() => setDarkMode(!darkMode)} 
           className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
           aria-label="Toggle Dark Mode"
         >
           {darkMode ? (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
           ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
           )}
         </button>

          {token ? (
            <div className="flex items-center gap-2">
              <Link 
                to="/history" 
                className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors tooltip-trigger relative group"
                title="Search History"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {/* Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Search History
                </div>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 pr-3 rounded-full transition-colors border border-transparent dark:border-gray-700"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white flex items-center justify-center font-bold shadow-inner">
                    {user?.Name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                    {user?.Name || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

             {dropdownOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                 <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                   <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.Name}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.Email}</p>
                 </div>
                 <Link onClick={() => setDropdownOpen(false)} to="/" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                   Web Search
                 </Link>
                 {user?.Role === 'author' && (
                   <Link onClick={() => setDropdownOpen(false)} to="/author" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                     Author Dashboard
                   </Link>
                 )}
                 {user?.Role === 'admin' && (
                   <Link onClick={() => setDropdownOpen(false)} to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                     Admin Dashboard
                   </Link>
                 )}
                 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                   Logout
                 </button>
               </div>
             )}
           </div>
         </div>
       ) : (
           <div className="flex gap-2">
             <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
               Login
             </Link>
             <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">
               Register
             </Link>
           </div>
         )}
       </div>
     </div>
   </header>
 )
}