const express = require('express');
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { UserModel, validUser, validLogin, genToken } = require("../models/userModel");
const { authToken, authAdminToken, authTokenRolesAllow } = require('../middlewares/auth');
const router = express.Router();

/* GET users listing. */
router.get('/', authToken, authAdminToken, async (req, res) => {
  try {

    let data = await UserModel.find({}, { pass: 0 }).sort({ _id: -1 })
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.post("/checkAdmin", authToken, authAdminToken, async (req, res) => {
  res.json({ auth: "success" })
})

router.post("/checkOrganizer", authToken, authTokenRolesAllow(["organizer", "admin"]), async (req, res) => {
  res.json({ auth: "success" })
})



router.get("/myInfo", authToken, async (req, res) => {
  try {
    let user = await UserModel.findOne({ _id: req.userData._id }, { pass: 0 });
    res.json(user);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})


router.get("/singleUser/:userId", authToken, authAdminToken, async (req, res) => {
  let userId = req.params.userId;
  try {
    let data = await UserModel.findOne({ _id: userId }, { pass: 0 });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).send(err)
  }
})



router.post("/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ msg: "user or password invalid " });
    }
    let validPass = await bcrypt.compare(req.body.pass, user.pass);
    if (!validPass) {
      return res.status(400).json({ msg: "user or password invalid" });
    }
    let myToken = genToken(user._id);
    res.json({ token: myToken });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})

router.post("/admin/login", async (req, res) => {
  let validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ msg: "user or password invalid " });
    }
    if (user.role != "admin") {
      return res.status(400).json({ msg: "user is not Admin" });
    }

    let validPass = await bcrypt.compare(req.body.pass, user.pass);
    if (!validPass) {
      return res.status(400).json({ msg: "user or password invalid" });
    }


    let myToken = genToken(user._id);
    res.json({ token: myToken });
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})



// Sign up new user
router.post("/", async (req, res) => {
  let validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  try {
    let user = new UserModel(req.body);
    let salt = await bcrypt.genSalt(10);
    user.pass = await bcrypt.hash(user.pass, salt);
    await user.save();
    res.status(201).json(_.pick(user, ["_id", "email", "date_created", "name", "phone", "address", "avatarImg"]))
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }

})

// change user role regular to organizer and vice versa
router.patch("/changeRole/:userId", authToken, authAdminToken, async (req, res) => {
  let userId = req.params.userId;
  if (userId == req.userData._id) {
    return res.json({ msg: "You can't change your own role" });
  }

  // get data if Organizer or regular
  try {
    let userInfo = await UserModel.findOne({ _id: userId });
    let whatToChange = (userInfo.role == "organizer") ? "regular" : "organizer";
    let data = await UserModel.updateOne({ _id: userId }, { role: whatToChange });
    res.json(data);
  }
  catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
})



module.exports = router;
