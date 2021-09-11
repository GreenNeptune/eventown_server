const express = require("express");
const { validCity, CityModel } = require("../models/cityModel");

const router = express.Router();


router.get("/", async (req, res) => {
  try {

    let data = await CityModel.find({}).sort({ _id: -1 });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})
router.get("/info/:cityName", async (req, res) => {

  let cityName = req.params.cityName;
  try {

    let data = await CityModel.findOne({ name: cityName }).sort({ _id: -1 });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// TODO authToken, authAdminToken,
router.post("/", async (req, res) => {
  let validBody = validCity(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let city = new CityModel(req.body);

    // console.log(city.s_id);
    await city.save();
    res.status(201).json(city);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


router.get("/convertToLocation/:countryName/:cityName", async (req, res) => {
  try {
    let cityName = req.params.cityName;
    let countryName = req.params.countryName;



    let location = [
      place.lat,
      place.lng
    ]


    return res.json(location);

  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.get("/search", async (req, res) => {
  let searchQ = req.query.q;
  let searchRexExp = new RegExp(searchQ, "i");

  try {

    let data = await CityModel.find({ name: searchRexExp })
      .limit(5)

    console.log(data)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

module.exports = router;