const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  });
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


// async function seedImg() {
//   try {
//     const resp = await axios.get('https://api.unsplash.com/photos/random', {
//       params: {
//         client_id: '****YOUR CLIENT ID GOES HERE****',
//         collections: 1114848,
//       },
//     })
//     return resp.data.urls.small
//   } catch (err) {
//     console.error(err)
//   }
// }

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) +10;
        const camp = new Campground({
          authir: '6645942006daa67ce4da3ec5',
          location: `${cities[random1000].city}, ${cities[random1000].state}`,
          title: `${sample(descriptors)} ${sample(places)}`,
          // image: "https://source.unsplash.com/random/300x300?camping,${i}",
          description:
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem quia sapiente fugiat ab nulla, hic, dicta maiores fugit, obcaecati eligendi eius laborum illum quam esse placeat quo corporis magni praesentium!",
          price,
          image: [
            {
              url: '',
              filename: ''
            },
            {
              url: '',
              filename: ''
            }
          ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})