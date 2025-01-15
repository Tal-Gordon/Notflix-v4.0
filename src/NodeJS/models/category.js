const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  promoted: { type: Boolean, default: false },
  movie_list: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movies",
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("Category", categorySchema, "Categories");
