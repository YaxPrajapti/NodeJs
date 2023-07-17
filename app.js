const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_URI = 'mongodb://yaxprajapati6504:DJM73pS3xDzHWcC3@ac-zikuyxm-shard-00-00.m7tzssz.mongodb.net:27017,ac-zikuyxm-shard-00-01.m7tzssz.mongodb.net:27017,ac-zikuyxm-shard-00-02.m7tzssz.mongodb.net:27017/Shop?ssl=true&replicaSet=atlas-nbfqym-shard-0&authSource=admin&retryWrites=true&w=majority'; 

const app = express();
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: 'mySessions'
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
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); 

app.use(errorController.get404);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true  })
  .then(() => {
    app.listen(3000);
    console.log("Database connected and server started on 3000!!!!");
  })
  .catch(err => {
    console.log(err);
  })

  

  