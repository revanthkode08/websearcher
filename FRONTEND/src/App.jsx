import {BrowserRouter,Routes,Route} from "react-router-dom"

import RootLayout from "./Layout/RootLayout"
import Home from "./Pages/Home"
import Login from "./Pages/Login"
import Register from "./Pages/Register"
import ProtectedRoute from "./Components/ProtectedRoute"
import AuthorDashboard from "./Pages/AuthorDashBoard"
import HistoryPage from "./Pages/History"

export default function App(){

 return(

 <BrowserRouter>

 <Routes>

 <Route path="/login" element={<Login/>}/>
 <Route path="/register" element={<Register/>}/>
 <Route path="/admin" element={<h1>Admin Dashboard</h1>}/>
 <Route path="/" element={<RootLayout/>}>

 <Route
 index
 element={<Home/>}
 />
 <Route path="/history" element={<HistoryPage/>}/>
 <Route path="/author" element={<AuthorDashboard/>}/>

 </Route>

 </Routes>

 </BrowserRouter>

 )

}