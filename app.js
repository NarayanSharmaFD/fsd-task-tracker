const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
//const csrf = require('csurf');

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb://dhriti:Tiger2024@ac-j9kdgql-shard-00-00.b0eomnh.mongodb.net:27017,ac-j9kdgql-shard-00-01.b0eomnh.mongodb.net:27017,ac-j9kdgql-shard-00-02.b0eomnh.mongodb.net:27017/users?replicaSet=atlas-qr4v3u-shard-0&tls=true&authSource=admin";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "session",
});

//const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//app.use(csrfProtection);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    /*User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Dhriti",
          email: "dss@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });*/
    console.log("Database Connected");
    app.listen(3000);
  })
  .catch((err) => {
    console.log("Database Connection failed", err);
  });
