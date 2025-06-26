const mongoose = require("mongoose");

const subAdminRentSchema = new mongoose.Schema(
  {
    subadmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
      required: true,
    },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubAdminRent", subAdminRentSchema);
