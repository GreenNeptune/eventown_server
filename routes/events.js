const express = require("express");
const { authToken, authAdminToken, authTokenRolesAllow } = require("../middlewares/auth");
const { CityModel } = require("../models/cityModel");
const { validEvent, EventModel, generateShortId } = require("../models/eventModel");

const router = express.Router();



router.get("/all", authToken, authAdminToken, async (req, res) => {

  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;


  try {
    let data = await EventModel.find()
      .sort({ [sortQ]: ifReverse })

    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


router.get("/", async (req, res) => {
  console.log("get events")

  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 4;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let ifReverse = (req.query.reverse == "yes") ? -1 : 1;

  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};

  try {
    let data = await EventModel.find(filterCat)
      .sort({ [sortQ]: ifReverse })
      .limit(perPage)
      .skip(page * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.get("/count", async (req, res) => {
  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};
  try {
    let data = await EventModel.countDocuments(filterCat)
    res.json({ count: data });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

// get one event by  id
router.get("/single/:id", async (req, res) => {
  try {
    let data = await EventModel.findOne({ _id: req.params.id });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})





router.get("/search", async (req, res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 3;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let searchQ = req.query.q;
  let searchRexExp = new RegExp(searchQ, "i");
  let searchText = {}

  if (searchRexExp) {
    searchText = { $or: [{ title: searchRexExp }, { info: searchRexExp }] }
  }


  // location tel Aviv-Yafo
  let defaultLocation = {
    lat: 32.08088,
    lng: 34.78057
  }

  let nearLocation = {}
  let distance = (req.query.distance * 1000) || (1000 * 100);
  let lat = parseFloat(req.query.lat) || defaultLocation.lat;
  let lng = parseFloat(req.query.lng) || defaultLocation.lng;


  // if params has city take city instead of user current location
  if (req.query.city) {
    let city = await CityModel.findOne({ name: req.query.city }).lean();
    lat = city.lat
    lng = city.lng
  }


  if ((req.query.distance && (req.query.lat && req.query.lng))) {
    nearLocation = { location: { $near: { $maxDistance: distance, $geometry: { type: "Point", coordinates: [lat, lng] } } } }
  }


  const search = {
    ...searchText,
    ...nearLocation,
  }


  const isOnline = req.query.isOnline === "yes" ? true : false;
  filterIsOnline = req.query.isOnline ? { isOnline, } : {};

  let filterIsFree = {}
  if (req.query.isFree === "yes") {
    filterIsFree = { price: { $eq: 0 } }
  } else if (req.query.isFree === "no") {
    filterIsFree = { price: { $gt: 0 } }
  }


  let filterCategory = (req.query.category_s_id) ? { category_s_id: req.query.category_s_id } : {};

  const filter = {
    ...filterIsOnline,
    ...filterIsFree,
    ...filterCategory
  }

  try {

    let data = await EventModel.find({ ...filter, ...search })
      .limit(perPage)
      .skip(page * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})




router.post("/", authToken, async (req, res) => {
  let validBody = validEvent(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let event = new EventModel(req.body);
    event.user_id = req.userData._id;
    event.s_id = await generateShortId();
    await event.save();
    res.status(201).json(event);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})



router.put("/:editId", authToken, authTokenRolesAllow(["organizer", "admin"]), async (req, res) => {
  let editId = req.params.editId;
  let validBody = validEvent(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {

    let data = await EventModel.updateOne({ _id: editId }, req.body)
    res.status(201).json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

router.delete("/:idDel", authToken, authTokenRolesAllow(["organizer", "admin"]), async (req, res) => {
  let idDel = req.params.idDel;
  try {
    let data = await EventModel.deleteOne({ _id: idDel });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

router.patch("/status/:idCart", authToken, authAdminToken, async (req, res) => {
  if (!req.body.status) {
    return res.status(400).json({ msg: "You must send status in body" });
  }
  try {
    let data = await CartModel.updateOne({ _id: req.params.idCart }, req.body);
    return res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

router.patch("/attend/:eventId", authToken, async (req, res) => {


  let eventData = await EventModel.findOne({ _id: req.params.eventId });


  if (eventData.attendees.length === eventData.attendees.limit) {
    return res.status(400).json({ msg: "event is full" });
  }



  if (eventData.attendees.includes(req.userData._id)) {
    return res.status(400).json({ msg: "You already subscribed for this event" });
  }

  let newAttendees = [...eventData.attendees, req.userData._id]
  let updateEventData = {
    attendees: newAttendees
  }

  try {
    let data = await EventModel.updateOne({ _id: req.params.eventId }, updateEventData);
    console.log(data)
    return res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})



router.get("/organizer", authToken, async (req, res) => {

  try {
    let event = await EventModel.find({ user_id: req.userData._id });
    res.status(201).json(event);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


module.exports = router;