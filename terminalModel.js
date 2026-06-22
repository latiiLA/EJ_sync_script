import mongoose from "mongoose";

const terminalSchema = mongoose.Schema(
  {
    unitId: {
      type: Number,
      required: [true, "Please enter terminal Unit ID."],
    },
    type: {
      type: String,
      required: [true, "Please enter terminal type."],
      enum: ["CRM", "NCR"],
    },
    terminalId: {
      type: String,
      required: [true, "Please enter terminal Id"],
    },
    terminalName: {
      type: String,
      required: [true, "Please enter terminal name."],
    },
    branchName: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please enter branch name."],
      ref: "Branch",
    },
    district: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please enter district."],
      ref: "District",
    },
    site: {
      type: String,
      required: [true, "Please enter terminal site."],
    },
    cbsAccount: {
      type: String,
      unique: true,
      required: [true, "Please enter cbs account."],
    },
    port: {
      type: Number,
      required: [true, "Please enter port number."],
    },
    ipAddress: {
      type: String,
      // unique: true,
      required: [true, "Please enter ip Address."],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: [true, "Creater user id is required"],
      ref: "User",
    },
    status: {
      type: String,
      default: "New",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

terminalSchema.index({ unitId: 1, type: 1 }, { unique: true });

const Terminal = mongoose.model("Terminal", terminalSchema);

export default Terminal;
