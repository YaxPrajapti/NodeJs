const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

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
}))

app.use((req, res, next) => {
  User.findById('64abace0271c372330997ca9')
    .then(user => {
      req.user = user; 
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes); 

app.use(errorController.get404);

mongoose.connect('mongodb+srv://yaxprajapati6504:Rss18miIgOrTecWE@cluster0.m7tzssz.mongodb.net/Shop', { useNewUrlParser: true, useUnifiedTopology: true })
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