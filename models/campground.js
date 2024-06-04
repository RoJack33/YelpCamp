const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;


const imageSchema = new Schema({
  url: String,
  filename: String
});

imageSchema.virtual('thumbnail').get(function() {
  return this.url.replace('/upload', '/upload/w_200')
});

imageSchema.virtual("cardImage").get(function () {
  return this.url.replace("/upload", "/upload/ar_4:3,c_crop");
});

const campgroundSchema = new Schema({
  title: String,
  images: [imageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  review: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
})

campgroundSchema.post('findOneAndDelete', async function (doc){
  if(doc){
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    }) 
  }
})

module.exports = mongoose.model('Campground', campgroundSchema);