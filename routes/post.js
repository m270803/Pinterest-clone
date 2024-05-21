const mongoose = require('mongoose');


const postSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  title: String,
  description: String,
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }] // Array of user IDs who liked the post
});


module.exports = mongoose.model("post",postSchema);


