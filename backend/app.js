const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
require('dotenv').config()
const cors = require("cors");

const port = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI
const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "session",
  });

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const projectRoutes = require('./routes/project-routes');
const taskRoutes = require('./routes/task-routes');
const userRoutes = require('./routes/user-routes');
const auditRoutes = require('./routes/audit');

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://delightful-island-036c67200.6.azurestaticapps.net"
    ],
    credentials: true,
  })
);

//app.use(bodyParser.urlencoded()); // x-www-form-urlencoded
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get("/check", (req, res) => {
  res.send("3");
});

app.use("/admin", adminRoutes);
app.use(authRoutes);
app.use(projectRoutes);
app.use(taskRoutes);
app.use(userRoutes);
app.use(auditRoutes);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    
    console.log("Database Connected");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection failed", err);
  });
