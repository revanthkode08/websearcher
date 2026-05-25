import {create} from "zustand"

export const UseAuthStore = create((set)=>({

 User:null,
 Token:null,

 Login:(data)=>set({
 User:data.Data.UserData,
 Token:data.Data.Token
 }),

 Logout:()=>set({
 User:null,
 Token:null
 })

}))