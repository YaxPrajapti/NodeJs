const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGO_URI = 'mongodb+srv://yaxprajapati6504:Rss18miIgOrTecWE@cluster0.m7tzssz.mongodb.net/Shop'; 

const app = express();
var store = new MongoDBStore({
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
  saveUnfinitialized: false,
  store: store, 
}))



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); 

app.use(errorController.get404);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    User.findOne()
      .then(user => {
        if (!user) {
          const user = new User({
            name: 'Yax',
            email: 'yaxprjpt@gmail.com',
            cart: {
              items: [],
            }
          });
          user.save();
        }
      })
    app.listen(3000);
    console.log("Database connected and server started on 3000");
  })
  .catch(err => {
    console.log(err);
  })