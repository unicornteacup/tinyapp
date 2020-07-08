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

app.get("/urls", (req, res) => {
  let urlDataTemplate = { 
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", urlDataTemplate);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  let urlDataTemplate = { shortURL: shortURL, longURL: longURL};
  res.render("urls_show", urlDataTemplate);
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

app.post("/login", (req, res) => {
  console.log(req.body.username);
  //const username = req.body.username;
  res.cookie('username', req.body.username);
  
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});