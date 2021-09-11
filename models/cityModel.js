const mongoose = require("mongoose");
const Joi = require("joi");


const citySchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
})

exports.CityModel = mongoose.model("cities", citySchema);

exports.validCity = (_bodyData) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
  })
  return joiSchema.validate(_bodyData);
}