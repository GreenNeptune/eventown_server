const express = require("express");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { validLocation, LocationModel } = require("../models/locationModel");

const router = express.Router();


router.get("/", async (req, res) => {

  try {

    let data = await LocationModel.find({}).sort({ _id: -1 });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})
router.get("/single", async (req, res) => {
  let searchQ = req.query.q;
  let searchRexExp = new RegExp(searchQ, "i");
  try {

    let data = await LocationModel.findOne({ name: searchRexExp })
    res.json(data);
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

    let data = await LocationModel.find({ name: searchRexExp })
      .limit(5)

    console.log(data)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.post("/", authToken, authAdminToken, async (req, res) => {


  let validBody = validLocation(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {

    let location = new LocationModel(req.body);

    await location.save();
    res.status(201).json(location);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


module.exports = router;