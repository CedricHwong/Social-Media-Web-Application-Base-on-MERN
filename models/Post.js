
const { model, Schema } = require('mongoose');

const userRef = {
  type: Schema.Types.ObjectId,
  ref: 'User',
};

const postSchema = new Schema({
  body: String,
  author: userRef,
  createdAt: String,
  comments: [{
    body: String,
    author: userRef,
    createdAt: String,
  }, ],
  likes: [{
    user: userRef,
    createdAt: String,
  }, ],
});

module.exports = model('Post', postSchema);
