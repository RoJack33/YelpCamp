const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utilities/wrapAsync");
const ExpressError = require("../utilities/ExpressError");
const Campground = require("../models/campground");
const BaseJoi = require('joi');
const Review = require("../models/review");
const reviews = require('../controllers/reviews');
const {isLoggedIn} = require('../middleware');
const sanitizeHtml = require("sanitize-html");

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

const validateReview = (req, res, next) => {
  const reviewSchema = Joi.object({
    review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      body: Joi.string().required().escapeHTML(),
    }).required(),
  });
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const messages = error.details.map((el) => el.message);
    const result = messages.join(",");
    throw new ExpressError("result.error.details", 400);
  } else {
    next();
  }
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    res.redirect(`/campgrounds/${id}`);
  }
  next();
};

router.post("/", isLoggedIn, validateReview, wrapAsync(reviews.createReview))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))

module.exports = router;