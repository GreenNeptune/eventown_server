const mongoose = require("mongoose");
const Joi = require("joi");

const orderSchema = new mongoose.Schema({
  user_id: String,
  event_id: String,
  paypal_id: String,
  total: Number,
  status: {
    type: String, default: "pending"
  },
  date_created: {
    type: Date, default: Date.now()
  },
  comments: String
})


exports.OrderModel = mongoose.model("orders", orderSchema);

exports.validOrder = (_bodyData) => {
  let joiSchema = Joi.object({
    total: Joi.number().min(1).max(999999).required(),
    paypal_id: Joi.string().min(1).max(9999).allow(null, '')
  })

  return joiSchema.validate(_bodyData);
}
