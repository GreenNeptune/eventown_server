const mongoose = require("mongoose");
const Joi = require("joi");
const { random } = require("lodash");


const GeoSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
  }
});

const eventSchema = new mongoose.Schema({
  user_id: String,
  title: String,
  isOnline: Boolean,
  onlineLink: String,
  category_s_id: Number,
  s_id: Number,
  price: Number,
  info: String,
  address: String,

  img: String,

  location: GeoSchema,

  dateStart: Date,
  date_created: {
    type: Date, default: Date.now
  },
  attendeesLimit: {
    type: Number,
    default: 5
  },
  attendees: [String],
  topics: {
    type: Array
  },
  status: {
    type: String, default: "published"
  },

})

exports.EventModel = mongoose.model("events", eventSchema);


exports.validEvent = (_bodyData) => {
  let joiSchema = Joi.object({
    title: Joi.string().min(2).max(75).required(),
    isOnline: Joi.boolean().required(),
    category_s_id: Joi.number().min(1).max(999999).required(),
    info: Joi.string().min(2).max(2000).required(),
    address: Joi.string().min(5).max(50).allow(null, ''),
    price: Joi.number().min(0).max(9999),
    img: Joi.string().max(500).allow(null, ''),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).required()
    }),
    topics: Joi.array().allow(null, ''),
    attendeesLimit: Joi.number().min(3).max(1000),
    dateStart: Joi.date(),
    onlineLink: Joi.string().min(10).max(300),
    status: Joi.string().valid("published", "canceled", "past")
  })

  return joiSchema.validate(_bodyData);
}


// פונקציה שמייצרת מספר רנדומלי עד 6 ספרות
// בשביל לייצר איידי קצר
exports.generateShortId = async () => {
  let rnd;
  // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף אירוע אחר
  let okFlag = false;

  // while(okFlag == false) {
  while (!okFlag) {
    rnd = random(1, 999999);
    let data = await this.EventModel.findOne({ s_id: rnd });
    // במידה והדאטא לא נמצא זה אומר שאין איי די כזה לאף
    // אירוע והוא יצא המלופ ויחזיר את המספר הרנדומלי
    if (!data) {
      okFlag = true;
    }
  }
  return rnd;
}