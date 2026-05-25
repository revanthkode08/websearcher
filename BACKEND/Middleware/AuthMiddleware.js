import jwt from "jsonwebtoken"

const AuthMiddleware = (req,res,next)=>{

 try{

 const Header = req.headers.authorization

 if(!Header){
 return res.status(401).json({
 message:"Access Denied. No Token Provided"
 })
 }

 const Token = Header.split(" ")[1]

 const Verified = jwt.verify(Token,process.env.JWT_SECRET)

 req.User = Verified

 next()

 }

 catch(err){

 res.status(401).json({
 message:"Invalid Token"
 })

 }

}

export default AuthMiddleware