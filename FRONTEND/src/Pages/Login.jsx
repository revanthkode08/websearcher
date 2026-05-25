import { useState } from "react"
import axios from "axios"
import { UseAuthStore } from "../Store/AuthStore"
import { useNavigate, Link } from "react-router-dom"
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react"

export default function Login(){
 const [Email,setEmail] = useState("")
 const [Password,setPassword] = useState("")
 const [Loading, setLoading] = useState(false)
 const [ErrorMsg, setErrorMsg] = useState("")

 const login = UseAuthStore(state=>state.Login)
 const navigate = useNavigate()

 const handleLogin = async(e)=>{
   if(e) e.preventDefault();
   setLoading(true)
   setErrorMsg("")

   try{
     const Res = await axios.post(
       "http://localhost:5000/app/user/login",
       { Email, Password }
     )
     
     login(Res.data)
     const role = Res.data.Data.UserData.Role
     
     if(role === "author"){
       navigate("/author")
     } else if(role === "admin"){
       navigate("/admin")
     } else{
       navigate("/")
     }
   } catch(err){
     console.error(err)
     setErrorMsg(err.response?.data?.message || "Invalid credentials provided.")
   } finally {
     setLoading(false)
   }
 }

 return(
   <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-6 font-sans">
     
     <div className="w-full max-w-md">
       
       <div className="text-center mb-10">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white mb-6 shadow-xl shadow-blue-500/30">
           <ShieldCheck className="w-8 h-8" />
         </div>
         <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
           Welcome Back
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium">
           Authenticate to access the Crawler Command Center.
         </p>
       </div>

       <div className="bg-white/60 dark:bg-gray-800/60 p-8 rounded-3xl shadow-2xl shadow-gray-200/20 dark:shadow-black/40 border border-white/40 dark:border-gray-700/40 backdrop-blur-2xl">
         
         {/* Admin Helper Box */}
         <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4 mb-8 text-sm flex gap-4 items-start">
           <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
           <div className="text-blue-900 dark:text-blue-200">
             <p className="font-bold mb-1">Demo Credentials</p>
             <p className="font-mono text-xs opacity-80">Email: author@gmail.com</p>
             <p className="font-mono text-xs opacity-80">Pass: password123</p>
           </div>
         </div>

         {ErrorMsg && (
           <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100 dark:border-red-800">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             {ErrorMsg}
           </div>
         )}

         <form onSubmit={handleLogin} className="space-y-5">
           
           <div className="space-y-1.5">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
               </div>
               <input
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                 placeholder="name@company.com"
                 value={Email}
                 onChange={(e)=>setEmail(e.target.value)}
                 required
               />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
               </div>
               <input
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                 type="password"
                 placeholder="••••••••"
                 value={Password}
                 onChange={(e)=>setPassword(e.target.value)}
                 required
               />
             </div>
           </div>

           <button
             type="submit"
             disabled={Loading || !Email || !Password}
             className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 group cursor-pointer"
           >
             {Loading ? "Authenticating..." : "Sign In"}
             {!Loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
           </button>

         </form>

         <div className="mt-8 text-center">
           <p className="text-gray-500 dark:text-gray-400 font-medium">
             Don't have an account?{" "}
             <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-bold transition-all">
               Create one
             </Link>
           </p>
         </div>

       </div>
     </div>

   </div>
 )
}