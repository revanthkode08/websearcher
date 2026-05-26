import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { Lock, Mail, ArrowRight, UserPlus, AlertCircle, User } from "lucide-react"

export default function Register(){
 const [Name,setName] = useState("")
 const [Email,setEmail] = useState("")
 const [Password,setPassword] = useState("")
 const [Role,setRole] = useState("user")
 const [Loading, setLoading] = useState(false)
 const [ErrorMsg, setErrorMsg] = useState("")
 const [SuccessMsg, setSuccessMsg] = useState("")
 
 const navigate = useNavigate()

 const handleRegister = async(e)=>{
   if(e) e.preventDefault();
   setLoading(true)
   setErrorMsg("")
   setSuccessMsg("")

   try{
     const Res = await axios.post(
       "https://websearcher-p0lw.onrender.com/app/user/register",
       { Name, Email, Password, Role }
     )
     
     setSuccessMsg("Account created successfully! Redirecting to login...")
     
     setTimeout(() => {
       navigate("/login")
     }, 2000)

   } catch(err){
     console.error(err)
     setErrorMsg(err.response?.data?.message || "Registration Failed. Please try again.")
   } finally {
     setLoading(false)
   }
 }

 return(
   <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-6 font-sans">
     
     <div className="w-full max-w-md">
       
       <div className="text-center mb-10">
         <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white mb-6 shadow-xl shadow-purple-500/30">
           <UserPlus className="w-8 h-8 ml-1" />
         </div>
         <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 tracking-tight">
           Create Account
         </h1>
         <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium">
           Join the Crawler Command Center today.
         </p>
       </div>

       <div className="bg-white/60 dark:bg-gray-800/60 p-8 rounded-3xl shadow-2xl shadow-gray-200/20 dark:shadow-black/40 border border-white/40 dark:border-gray-700/40 backdrop-blur-2xl">
         
         {ErrorMsg && (
           <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-red-100 dark:border-red-800 animate-pulse">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             {ErrorMsg}
           </div>
         )}
         
         {SuccessMsg && (
           <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:emerald-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2 border border-emerald-100 dark:border-emerald-800">
             <UserPlus className="w-5 h-5 flex-shrink-0" />
             {SuccessMsg}
           </div>
         )}

         <form onSubmit={handleRegister} className="space-y-5">
           
           <div className="space-y-1.5">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Full Name</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
               </div>
               <input
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                 placeholder="John Doe"
                 value={Name}
                 onChange={(e)=>setName(e.target.value)}
                 required
               />
             </div>
           </div>
           
           <div className="space-y-1.5">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
               </div>
               <input
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                 placeholder="name@company.com"
                 type="email"
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
                 <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
               </div>
               <input
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-4 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm"
                 type="password"
                 placeholder="••••••••"
                 value={Password}
                 onChange={(e)=>setPassword(e.target.value)}
                 required
               />
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Role</label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <UserPlus className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
               </div>
               <select
                 className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-11 pr-10 py-3.5 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                 value={Role}
                 onChange={(e)=>setRole(e.target.value)}
                 required
               >
                 <option value="user">User</option>
                 <option value="author">Author</option>
               </select>
               <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                 <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
           </div>

           <button
             type="submit"
             disabled={Loading || !Email || !Password || !Name}
             className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 group cursor-pointer"
           >
             {Loading ? "Creating Account..." : "Register"}
             {!Loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
           </button>

         </form>

         <div className="mt-8 text-center">
           <p className="text-gray-500 dark:text-gray-400 font-medium">
             Already have an account?{" "}
             <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-bold transition-all">
               Log in here
             </Link>
           </p>
         </div>

       </div>
     </div>

   </div>
 )
}