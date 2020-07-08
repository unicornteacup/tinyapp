const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs"); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}
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

// app.get('/', function (req, res) {
//   // Cookies that have not been signed
//   console.log('Cookies: ', req.cookies)
// });

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
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body.username);
  //const username = req.body.username;
  res.cookie("username", req.body.username);
  
  res.redirect("/urls");
})

app.post("/register", (req, res) => {

  let email = req.body.name;
  console.log(email);
  let password = req.body.password;
  console.log(password);
    // create randon user id
  const id = generateRandomString();;
  console.log(id);
  users[id] = {id: id, email: email, password: password}
  console.log(users);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  //console.log(req.body.username);
  //const username = req.body.username;
  res.clearCookie("username");
  
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


// How do I save it properly to the database and do the redirect?
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
           // Respond with 'Ok' (we will replace this)
  let longURL = req.body.longURL
  console.log(longURL)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { 
    shortURL: shortURL, 
    longURL: longURL,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];// const longURL = ...
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params)
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req, res) => {
  console.log(req.body)
  let shortURL = req.params.shortURL;
  console.log(shortURL.newURL)
  let longURL = req.body.updateUrl;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});