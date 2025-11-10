import mongoose ,{Schema}from "mongoose";

const countrySchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    code:{
        type:String,
        required:true,
        trim:true,
    },
    status:{
        type:Boolean,
        default:true
    }

},{timestamps:true});

const CountryModel=mongoose.model('Country',countrySchema);
export default CountryModel; 