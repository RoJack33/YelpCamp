const express = require('express');
const router = express.Router();
const Campground = require("../models/campground");
const wrapAsync = require("../utilities/wrapAsync");
const ExpressError = require("../utilities/ExpressError");
const campgrounds = require('../controllers/campgrounds')
const BaseJoi = require("joi");
const {isLoggedIn} = require('../middleware');
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

const validateCampground = (req, res, next) => {
  // if (!req.body.campground) throw new ExpressError ('Invalid Campground Data', 400)
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required().escapeHTML(),
      price: Joi.number().required().min(0),
      image: Joi.array().items(Joi.object({
        url: Joi.string().required,
        filename: Joi.string().required
      })).required,
      location: Joi.string().required().escapeHTML(),
      description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
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
  .post(isLoggedIn , upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
  .get(isLoggedIn, wrapAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground))

// router.get('/', wrapAsync(campgrounds.index));


// router.post('/', isLoggedIn ,validateCampground, wrapAsync(campgrounds.createCampground));

// router.get("/:id", isLoggedIn, wrapAsync(campgrounds.showCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(campgrounds.renderEditForm))

// router.put("/:id", isLoggedIn, isAuthor, validateCampground, wrapAsync(campgrounds.updateCampground));

// router.delete("/:id", isLoggedIn, wrapAsync(campgrounds.deleteCampground))

module.exports = router;