const { mongoose, Types } = require("mongoose");

const TagSchema = mongoose.Schema({
  name: [{ type: String }],
  review: {
    type: Types.ObjectId,
    ref: "Review",
  },
});
const Tag = mongoose.model("tag", TagSchema);
module.exports = Tag;
