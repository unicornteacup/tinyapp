const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const helper = require("./helpers");
const cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ['thisismysuperlongstringtouseforcookiesessions', 'thisisasecondlongstring']
}));
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.set("view engine", "ejs");

//*** EXAMPLE */
//const password = "purple-monkey-dinosaur"; // found in the req.params object
//const hashedPassword = bcrypt.hashSync(password, 10);

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

const urlsForUser = function(user_id) {
  let urlList = {
  }
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      urlList[shortURL] = urlDatabase[shortURL]
    }
  }
  return(urlList);
};


function generateRandomString() {
  String.random = function (length) {
    let radom13chars = function () {
      return Math.random().toString(16).substring(2, 15)
    }
    let loops = Math.ceil(length / 13)
    return new Array(loops).fill(radom13chars).reduce((string, func) => {
      return string + func()
    }, '').substring(0, length)
  }
  return(String.random(6))
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/register", (req, res) => {
  let templateVars = { 
    email: ""
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { 
    email: ""
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {

  console.log(req.body.email);
  const email = req.body.email;
  const password = req.body.password;
  console.log(password)
  
  if (!req.body.email) {
    return res.send("Error 400, No email entered");
  } 
  if (!req.body.password) {
    return res.send("Error 400, No password entered");
  } 
  const user = helper.getUserByEmail(email, users)
  console.log(user);
  if (user) {
    if (bcrypt.compareSync(password, user.hashedPassword)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.send("Error Password incorrect");
    } 
  } else{
    res.send("Error 403, User not found");
  }
}) 

app.post("/register", (req, res) => {
  
  if (!req.body.name) {
    res.send("Error 400, No email entered");
  } else if (!req.body.password) {
    res.send("Error 400, No password entered");
  } else if (helper.getUserByEmail(req.body.name, users)) {
    res.send("Error 400, user already exists");
  } else {  
    let email = req.body.name;
    let password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = generateRandomString();;
    users[id] = {id: id, email: email, hashedPassword: hashedPassword}
    console.log(users)
    // add cookie for user_id
    req.session.user_id = id;
    //redirect
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  //console.log(req.body.username);
  //const username = req.body.username;
  req.session = null;
  
  res.redirect("/login");
})

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/notloggedin");
  } else {
    console.log(req.session.user_id);
    urlList = urlsForUser(req.session.user_id)

    let templateVars = { 
      urls: urlList,
      email: users[req.session.user_id].email
    };
  res.render("urls_index", templateVars);
  };
});

app.get("/notloggedin", (req, res) => {
  let templateVars = { 
    email: ""
  };
  res.render("logReg", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = { 
      urls: urlDatabase,
      email: users[req.session.user_id].email
    };
    res.render("urls_new", templateVars);
  };
});


// How do I save it properly to the database and do the redirect?
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
           // Respond with 'Ok' (we will replace this)
  let longURL = req.body.longURL
  let userID = users[req.session.user_id].id
  console.log(longURL)
  console.log(userID)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: userID}
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const urlList = urlsForUser(users[req.session.user_id])
  console.log(urlList)
  if (!req.session.user_id) {
    res.redirect("/notloggedin");
  } else if (urlList[shortURL].userID !== users[req.session.user_id]) {
    res.send(`This URL does not belong to ${users[req.session.user_id].email}`)
  } else {
    
    console.log(shortURL)
    console.log(urlDatabase[shortURL])
    let longURL = urlDatabase[shortURL]["longURL"];
    
    let templateVars = { 
      shortURL: shortURL, 
      longURL: longURL,
      email: users[req.session.user_id].email
    };
  res.render("urls_show", templateVars);
  };
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL]["longURL"])
  const longURL = urlDatabase[shortURL]["longURL"];// const longURL = ...
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlList = urlsForUser(req.session.user_id);
  let shortURL = req.params.shortURL;
  if (!req.session.user_id || urlDatabase[shortURL].userID !== req.session.user_id) {
    res.send("This URL can only be deleted by the owner");
  } else {
    console.log(req.params)
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
})

app.post("/urls/:shortURL/update", (req, res) => {
  const urlList = urlsForUser(req.session.user_id);
  let shortURL = req.params.shortURL;
  if (!req.session.user_id || urlList[shortURL].userID !== req.session.user_id) {
    res.send("This URL can only be edited by the owner");
  } else {
    console.log(req.body)

    console.log(shortURL.newURL)
    let longURL = req.body.updateUrl;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
  }
  
  
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});