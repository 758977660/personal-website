const express = require("express");
const expressEdge = require("express-edge");
const edge = require("edge.js");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const connectFlash = require("connect-flash");

const createPostController = require("./controllers/createPost");
const homePageController = require("./controllers/homePage");
const storePostController = require("./controllers/storePost");
const getPostController = require("./controllers/getPost");
const createUserController = require("./controllers/createUser");
const storeUserController = require("./controllers/storeUser");
const loginController = require("./controllers/login");
const loginUserController = require("./controllers/loginUser");
const logoutController = require("./controllers/logout");
const deletePostController = require("./controllers/deletePost");
//const pagingController = require("./controllers/paging");

const app = new express();

app.use(
  expressSession({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

app.use(connectFlash());

const connectionString = process.env.mongo_uri;
mongoose
  .connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => console.log("You are now connected to Mongo!"))
  .catch(err => console.error("Something went wrong", err));

const mongoStore = connectMongo(expressSession);

app.use(
  expressSession({
    secret: "secret",
    saveUninitialized: true,
    resave: true,
    store: new mongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);

app.use(express.static("public"));
app.use(expressEdge.engine);
app.set("views", __dirname + "/views");

app.use(fileUpload());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const storePost = require("./middleware/storePost");
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require("./middleware/redirectIfAuthenticated");

app.use("/posts/store", storePost);

app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", auth, storePost, storePostController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.get("/auth/login", redirectIfAuthenticated, loginController);
app.get("/auth/logout", logoutController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/post/delete/:id", auth, deletePostController);

//app.get("/p/:page", pagingController);

app.listen(4000, () => {
  console.log("app listening to port 4000");
});
