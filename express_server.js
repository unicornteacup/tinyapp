// REQUIREMENTS

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const helper = require("./helpers");
const cookieSession = require('cookie-session');

// APP.USE REQUIREMENTS

app.use(cookieSession({
  name: 'session',
  keys: ['thisismysuperlongstringtouseforcookiesessions', 'thisisasecondlongstring']
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// TEST DATABASES

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// LOGIN, REGISTER & LOGOUT ENDPOINTS

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    const urlList = helper.urlsForUser(req.session.user_id, urlDatabase);
    let templateVars = {
      urls: urlList,
      email: users[req.session.user_id].email
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      email: ""
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      email: ""
    };
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body.email) {
    return res.send("Error 400, No email entered");
  }
  if (!req.body.password) {
    return res.send("Error 400, No password entered");
  }
  const user = helper.getUserByEmail(email, users);
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send("Error Password incorrect");
    }
  } else {
    res.send("Error 403, User not found");
  }
});

app.post("/register", (req, res) => {
  if (!req.body.name) {
    res.send("Error 400, No email entered");
  } else if (!req.body.password) {
    res.send("Error 400, No password entered");
  } else if (helper.getUserByEmail(req.body.name, users)) {
    res.send("Error 400, user already exists");
  } else {
    const email = req.body.name;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = helper.generateRandomString();
    users[id] = {id: id, email: email, hashedPassword: hashedPassword};
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/notloggedin", (req, res) => {
  let templateVars = {
    email: ""
  };
  res.render("logReg", templateVars);
});

//  CREATING AND VIEWING URLS

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      urls: urlDatabase,
      email: users[req.session.user_id].email
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/notloggedin");
  } else {
    const userID = users[req.session.user_id].id;
    const urlList = helper.urlsForUser(userID, urlDatabase);
    let templateVars = {
      urls: urlList,
      email: users[req.session.user_id].email
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const userID = users[req.session.user_id].id;
  const shortURL = helper.generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: userID};
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect("/notloggedin");
  }
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("This URL does not exist");
  }
  const userID = users[req.session.user_id].id;
  const urlList = helper.urlsForUser(userID, urlDatabase);
  if (urlDatabase[shortURL].userID !== userID) {
    return res.send(`This URL does not belong to ${users[req.session.user_id].email}`);
  } else {
    const longURL = urlDatabase[shortURL]["longURL"];
    let templateVars = {
      shortURL: shortURL,
      longURL: longURL,
      email: users[req.session.user_id].email
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.send("There is no URL associated with this link");
  } else {
    const longURL = urlDatabase[shortURL]["longURL"];
    res.redirect(longURL);
  }
});

// EDIT OR DELETE URL

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!users[req.session.user_id] || urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.send("This URL can only be edited by the owner");
  } else {
    const longURL = req.body.updateUrl;
    urlDatabase[shortURL]["longURL"] = longURL;
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlList = helper.urlsForUser(req.session.user_id, urlDatabase);
  if (!req.session.user_id || urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.send("This URL can only be deleted by the owner");
  } else {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});