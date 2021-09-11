const express = require("express");
const { authToken, authAdminToken } = require("../middlewares/auth");
const { validOrder, OrderModel } = require("../models/orderModel");

const router = express.Router();
router.get("/", (req, res) => {
  res.json({ msg: "Order work" });
})

router.get("/singleOrder/:orderId", authToken, authAdminToken, async (req, res) => {
  let orderId = req.params.orderId;
  try {
    let data = await OrderModel.findOne({ _id: orderId });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

router.get("/allOrders", authToken, authAdminToken, async (req, res) => {
  let perPage = (req.query.perPage) ? Number(req.query.perPage) : 100;
  let page = (req.query.page) ? Number(req.query.page) : 0;
  let sortQ = (req.query.sort) ? req.query.sort : "_id";
  let filterCat = (req.query.cat) ? { category_s_id: req.query.cat } : {};

  try {
    let data = await OrderModel.find(filterCat)
      .sort({ [sortQ]: -1 })
      .limit(perPage)
      .skip(page * perPage)
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


router.post("/:eventId", authToken, async (req, res) => {

  try {
    let order = new OrderModel(req.body);
    order.user_id = req.userData._id;
    order.event_id = req.params.eventId
    await order.save();
    res.status(201).json(order);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


router.post("/", authToken, async (req, res) => {

  let validBody = validOrder(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {

    let orderData = await OrderModel.findOne({ user_id: req.userData._id, status: "pending" });
    // update order if already exists
    if (orderData) {
      let data = await OrderModel.updateOne({ _id: orderData._id }, req.body);
      return res.json(data);
    }
    let newData = new OrderModel(req.body);
    newData.user_id = req.userData._id;
    //TODO: send email to the shop owner and maybe also to customer
    await newData.save();
    return res.status(201).json(newData);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})


router.patch("/status/:idOrder", authToken, authAdminToken, async (req, res) => {
  if (!req.body.status) {
    return res.status(400).json({ msg: "You must send status in body" });
  }
  try {
    let data = await OrderModel.updateOne({ _id: req.params.idOrder }, req.body);
    return res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})

module.exports = router;