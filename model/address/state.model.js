import mongoose , { Schema} from "mongoose";
const stateSchema = new Schema({
    name:{
        type:String,
        trim:true,
        required:true,
    },
    code:{
        type:String,
        trim:true,
        required:true,
    },
    countryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Country",
    },
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true});

const StateModel = mongoose.model('State',stateSchema);

export default StateModel;