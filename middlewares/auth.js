const jwt = require("jsonwebtoken");
const { config } = require("../config/secretData");
const { UserModel } = require("../models/userModel")


exports.authToken = (req, res, next) => {
  let token = req.header("auth-token");
  if (!token) {
    return res.status(400).json({ msg: "you must send token in this url to get data" });
  }
  try {
    let decodeToken = jwt.verify(token, config.jwtSecret);
    req.userData = decodeToken;
    next();
  }
  catch (err) {
    console.log(err);
    res.status(400).json({ msg: "token invalid or expired" });
  }
}

exports.authAdminToken = async (req, res, next) => {
  try {
    let user = await UserModel.findOne({ _id: req.userData._id })
    if (user.role != "admin") {
      return res.status(401).json({ msg: "You must be admin user to send here data" })
    }
    next();
  }
  catch (err) {
    console.log(err);
    res.status(401).json({ msg: "err in admin" });
  }
}
exports.authTokenRolesAllow = (rolesAllowed) => async (req, res, next) => {
  try {
    let user = await UserModel.findOne({ _id: req.userData._id })

    if (!rolesAllowed.includes(user.role)) {
      return res.status(401).json({ msg: "You must be organizer user to send here data" })
    }
    next();
  }
  catch (err) {
    console.log(err);
    res.status(401).json({ msg: "err in Organizer" });
  }
}


