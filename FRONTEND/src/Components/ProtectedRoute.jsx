import {Navigate} from "react-router-dom"
import {UseAuthStore} from "../Store/AuthStore"

export default function ProtectedRoute({children}){

 const Token = UseAuthStore(state=>state.Token)

 if(!Token){
 return <Navigate to="/login"/>
 }

 return children
}