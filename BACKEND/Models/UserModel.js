import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
 Name: { type: String, required: true },
 Email: { type: String, required: true, unique: true },
 Password: { type: String, required: true },
 Role: { type: String, required: true },
 SearchHistory: [{
   query: String,
   date: { type: Date, default: Date.now }
 }],
 ResetPasswordToken: String,
 ResetPasswordExpires: Date
})

export default mongoose.model("User",UserSchema)