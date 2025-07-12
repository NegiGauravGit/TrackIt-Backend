import mongoose from 'mongoose'
const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName:{type:String},
    lastName:{type:String},
    email:{type:String,unique:true},
    password:{type:String}
})

const userModel = mongoose.model("Users",userSchema)

export default userModel