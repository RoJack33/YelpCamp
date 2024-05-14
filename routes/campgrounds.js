const express = require('express');
const router = express.Router();
const Campground = require("../models/campground");
const wrapAsync = require("../utilities/wrapAsync");
const ExpressError = require("../utilities/ExpressError");
const campgrounds = require('../controllers/campgrounds')
const Joi = require("joi");
const {isLoggedIn} = require('../middleware');

const validateCampground = (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError ('Invalid Campground Data', 400)
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().required().min(0),
      image: Joi.string().required(),
      location: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
  });
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const messages = error.details.map((el) => el.message);
    const result = messages.join(",");
    throw new ExpressError(result, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) =>{
  const { id } = req.params;
  const foundCamp = await Campground.findById(id);
  if (!foundCamp.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    res.redirect(`/campgrounds/${id}`);
  }
  next();
}

router.route('/')
  .get(wrapAsync(campgrounds.campgroundIndex))
  .post(isLoggedIn ,validateCampground, wrapAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(isLoggedIn, wrapAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, validateCampground, wrapAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, wrapAsync(campgrounds.deleteCampground))

// router.get('/', wrapAsync(campgrounds.index));


// router.post('/', isLoggedIn ,validateCampground, wrapAsync(campgrounds.createCampground));

// router.get("/:id", isLoggedIn, wrapAsync(campgrounds.showCampground))

router.get('/:id/edit', isAuthor, wrapAsync(campgrounds.renderEditForm))

// router.put("/:id", isLoggedIn, isAuthor, validateCampground, wrapAsync(campgrounds.updateCampground));

// router.delete("/:id", isLoggedIn, wrapAsync(campgrounds.deleteCampground))

module.exports = router;