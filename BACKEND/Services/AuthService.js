import User from "../Models/UserModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const RegisterUser = async (Data) => {

 if (!Data || typeof Data.Password !== "string" || !Data.Password.trim()) {
  throw new Error("Password is required for registration")
 }

 const HashedPassword = await bcrypt.hash(Data.Password,10)

 const UserData = new User({
  ...Data,
  Password: HashedPassword
 })

 try {
  return await UserData.save()
 } catch (error) {
  if (error.code === 11000) {
   throw new Error("Email already registered. Please login or use a different email.")
  }
  throw error
 }

}

export const LoginUser = async (Email,Password)=>{

 const UserData = await User.findOne({Email})

 if(!UserData) throw new Error("User Not Found")

 const Match = await bcrypt.compare(Password,UserData.Password)

 if(!Match) throw new Error("Invalid Password")

 const Token = jwt.sign(
 {Id:UserData._id,Role:UserData.Role},
 process.env.JWT_SECRET
 )

 return {UserData,Token}

}