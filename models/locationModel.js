const mongoose = require("mongoose");
const Joi = require("joi");


const locationSchema = new mongoose.Schema({
  city_id: String,
  name: String,
  lat: String,
  lng: String

})

exports.LocationModel = mongoose.model("location", locationSchema);

exports.validLocation = (_bodyData) => {
  let joiSchema = Joi.object({
    city_id: Joi.string().min(2).max(30),
    name: Joi.string().min(2).max(100).required(),
    lat: Joi.string().min(2).max(100).required(),
    lng: Joi.string().min(2).max(100).required(),
  })
  return joiSchema.validate(_bodyData);
}