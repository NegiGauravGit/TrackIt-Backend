import mongoose from "mongoose";
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const todoSchema = new Schema({
    category:{type:String},
    title:{type:String},
    description:{type:String},
    status:{type:String},
    startDate: {type:Date},
    endDate:{type:Date},
    creatorId: {type:ObjectId}
})
const todoModel = mongoose.model("Todos",todoSchema)
export default todoModel