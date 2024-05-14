const Campground = require("../models/campground");
const wrapAsync = require("../utilities/wrapAsync");

module.exports.campgroundIndex = wrapAsync(async(req,res) => {
  const campgrounds = await Campground.find({})
  res.render('campgrounds/index.ejs', {campgrounds})
})

module.exports.renderNewForm = (req,res) =>{
  res.render('campgrounds/new.ejs')
}

module.exports.createCampground = async (req, res) => {
  const newCampground = new Campground(req.body.campground);
  newCampground.author = req.user._id;
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
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/show.ejs", { campgrounds });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campgrounds = await Campground.findById(id);
  if (!campgrounds) {
    req.flash("error", "Cannot find that campground!");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit.ejs", { campgrounds });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
  req.flash("success", "successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground");
  res.redirect(`/campgrounds`);
};