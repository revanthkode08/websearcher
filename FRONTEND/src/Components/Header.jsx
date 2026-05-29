import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UseAuthStore } from "../Store/AuthStore"
import { cn } from "../lib/utils"

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = UseAuthStore(state => state.Logout)
  const token = UseAuthStore(state => state.Token)
  const user = UseAuthStore(state => state.User)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Force dark mode for premium SaaS feel
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  }, [])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo Section */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary bg-gradient-to-tr from-primary to-primary/70 shadow-sm shadow-primary/20">
            <span className="text-sm font-bold text-primary-foreground leading-none">W</span>
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">
            Websearcher
          </span>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-3">
          {token ? (
            <div className="flex items-center gap-1 sm:gap-3">
              <Link 
                to="/history" 
                className="group flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
                title="Search History"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {/* Tooltip */}
                <span className="absolute top-full mt-1.5 hidden whitespace-nowrap rounded bg-foreground px-2 py-1 text-[10px] font-medium text-background group-hover:block z-50">
                  Search History
                </span>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-muted transition-colors border border-transparent outline-none ring-primary focus-visible:ring-2"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-semibold text-white shadow-inner">
                    {user?.Name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-[13px] font-medium text-foreground">
                    {user?.Name || 'User'}
                  </span>
                  <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border bg-card p-1 shadow-xl shadow-black/20 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2.5 border-b border-border/50 mb-1">
                      <p className="text-[13px] font-medium text-foreground truncate">{user?.Name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.Email}</p>
                    </div>
                    
                    <Link onClick={() => setDropdownOpen(false)} to="/" className="flex items-center rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      Web Search
                    </Link>
                    
                    {user?.Role === 'author' && (
                      <Link onClick={() => setDropdownOpen(false)} to="/author" className="flex items-center rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        Author Dashboard
                      </Link>
                    )}
                    
                    {user?.Role === 'admin' && (
                      <Link onClick={() => setDropdownOpen(false)} to="/admin" className="flex items-center rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <div className="h-px bg-border/50 my-1"></div>
                    
                    <button onClick={handleLogout} className="flex w-full items-center rounded-md px-3 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link to="/register" className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}