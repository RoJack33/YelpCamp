if(process.env.NODE_ENV !== "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const Campground = require('./models/campground');
// const wrapAsync = require("./utilities/wrapAsync");
const ExpressError = require('./utilities/ExpressError');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require("method-override");
// const Joi = require('joi');
// const campground = require("./models/campground");
const Review = require("./models/review");
const usersRoute = require('./routes/users');
const campgroundRoute = require('./routes/campgrounds');
const reviewRoute = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');




main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
    // useFindAndModify: false
  });
}

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () =>{
  console.log("Database connected")
});

app.engine('ejs', ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
const sessionConfig = {
  secret: 'YelpcampSessionSecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expire: Date.now() + 1000* 60 * 60 *24 *7, //cookie auto delted after 7 days
    maxAge: 1000* 60 * 60 *24 *7
  }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use('/', usersRoute); //route use
app.use('/campgrounds', campgroundRoute); //route campground
app.use('/campgrounds/:id/reviews', reviewRoute); //route review


app.get('/', (req,res) =>{
  res.send('HOME YELPCAMP!')
})


app.all('*', (req,res,next)=>{
  next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) =>{
  const {status = 500} = err;
  if(!err.message) err.message = 'Oh No, Something Went Wrong!'
  res.status(status).render('error.ejs', {err});
})

app.listen('3000', ()=>{
  console.log('CONNECTING TO PORT 3000')
})