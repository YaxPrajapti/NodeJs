require('dotenv').config(); 

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf'); 
const flash = require('connect-flash'); 
const morgan = require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI; 

const app = express();
var store = new MongoDBStore({
  uri: MONGO_URI,
  collection: 'mySessions'
});
const csrfProtection = csrf(); 

store.on('error', function(error) {
  console.log(error);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth'); 

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: '8133dfb7811e30632b82d473177a5265c8090132e1d96d6c9beede09190250c4', 
  resave: false, 
  saveUninitialized: false,
  store: store, 
}))
//csrf must be used after creating session. 
app.use(csrfProtection); 
app.use(flash()); 

app.use((req, res, next) => {
  if(!req.session.user){
    return next(); 
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user; 
      next(); 
  })
    .catch(err => {
      console.log(err);
    })
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isloggedIn;
  res.locals.csrfToken = req.csrfToken(); 
  next(); 
}); 

app.use(morgan(':method :url :status :res[content-length] - :response-time ms')); 

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); 

app.use(errorController.get404);

console.log("Starting the server...");
mongoose.connect(MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connceted to database, Now starting server.... ");
    app.listen(3000);
  })
  .then(() => {
    console.log("Connection established successfully.");
  })
  .catch(err => {
    console.log(err);
  })