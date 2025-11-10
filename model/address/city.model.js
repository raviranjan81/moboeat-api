import mongoose, { Schema } from "mongoose";

const citySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    countryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const CityModel = mongoose.model("City", citySchema);
export default CityModel;
