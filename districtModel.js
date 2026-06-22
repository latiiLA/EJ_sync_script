import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    districtName: {
      type: String,
      unique: true,
      required: [true, "Please enter a district name."],
    },
    address: {
      type: String,
      required: [true, "Please enter the district address."],
    },
    mnemonic: {
      type: String,
      unique: true,
      required: [true, "Please enter a mnemonic."],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: [true, "Creator user ID is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const District = mongoose.model("District", districtSchema);

export default District;
