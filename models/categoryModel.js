const mongoose = require("mongoose");
const Joi = require("joi");
const { EventModel } = require("./eventModel");


const categorySchema = new mongoose.Schema({
  s_id: Number,
  name: String,
})

exports.CategoryModel = mongoose.model("categories", categorySchema);

exports.validCategory = (_bodyData) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    s_id: Joi.number().min(1).max(999).required()
  })
  return joiSchema.validate(_bodyData);
}

// פונקציה שמייצרת מספר רנדומלי עד 6 ספרות
// בשביל לייצר איידי קצר
exports.generateShortId = async () => {
  let rnd;
  // משתנה בוליאן שבודק אם המספר הרנדומלי לא קיים לאף מוצר אחר
  let okFlag = false;

  while (!okFlag) {
    rnd = random(1, 999999);
    let data = await this.EventModel.findOne({ s_id: rnd });

    if (!data) {
      okFlag = true;
    }
  }
  return rnd;
}