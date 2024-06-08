const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const axios = require("axios");

module.exports.campgroundIndex = async(req,res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index.ejs', {campgrounds})
}

module.exports.renderNewForm = (req,res) =>{
  res.render('campgrounds/new.ejs')
}

module.exports.createCampground = async (req, res) => {
  // Fetch Campground Location
  const locationCords = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${req.body.campground.location}&apiKey=${process.env.GEO_API_KEY}`);
  const {features: [{ geometry }],} = locationCords.data;
  const newCampground = new Campground(req.body.campground);
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newCampground.author = req.user._id;
  newCampground.geometry = geometry;
  await newCampground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${newCampground._id}`);
}

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campgrounds = await Campground.findById(id)
    .populate({
      path: "review",
      populate: { path: "author" },
    })
    .populate("author");
  if (!campgrounds) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show.ejs", { campgrounds });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campgrounds = await Campground.findById(id);
  if (!campgrounds) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit.ejs", { campgrounds });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const locationCords = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${req.body.campground.location}&apiKey=${process.env.GEO_API_KEY}`);
  const {features: [{ geometry }],} = locationCords.data;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true, runValidators:true});
  const imgs = req.files.map((f) => ({url: f.path, filename: f.filename}));
  campground.images.push(...imgs);
  campground.geometry = geometry;
  await campground.save();
  //delete images from selected checkbox
  if (req.body.deleteImages) {
    for(let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne( {$pull: {images: {filename: {$in: req.body.deleteImages}}}})
  }
  req.flash("success", "successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  for (let image of campground.images) {
    await cloudinary.uploader.destroy(image.filename);
  } 
  req.flash("success", "Successfully deleted campground");
  res.redirect(`/campgrounds`);
};

