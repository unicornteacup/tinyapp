const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs"); 

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
}

const emailLookup = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    } else {
      return false
    }
  } 
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
  
  if (!req.body.email) {
    res.send("Error 400, No email entered");
  } else if (!req.body.password) {
    res.send("Error 400, No password entered");
  } else if (emailLookup(email)) {
    for (let user in users) {
      let id = users[user].id
      if (users[user].email === email && users[user].password !== password) {
        res.send("Error Password incorrect");
      } else if (users[user].email === email && users[user].password === password) {
        res.cookie("user_id", id);
        res.redirect("/urls");
      } 
    }
  } else {
    res.send("Error 403, User not found");
  }
}) 

app.post("/register", (req, res) => {
  
  if (!req.body.name) {
    res.send("Error 400, No email entered");
  } else if (!req.body.password) {
    res.send("Error 400, No password entered");
  } else if (emailLookup(req.body.name)) {
    res.send("Error 400, user already exists");
  } else {  // access entered email from form
    let email = req.body.name;
    // access entered pw from form
    let password = req.body.password;
    // create randon user id
    const id = generateRandomString();;
    // add new user to database
    users[id] = {id: id, email: email, password: password}
    // add cookie for user_id
    res.cookie("user_id", id);
    //redirect
    res.redirect("/urls");
  }
})

app.post("/logout", (req, res) => {
  //console.log(req.body.username);
  //const username = req.body.username;
  res.clearCookie("user_id");
  
  res.redirect("/login");
})

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    let templateVars = { 
      urls: urlDatabase,
      email: users[req.cookies["user_id"]].email
    };
    res.render("urls_new", templateVars);
  }
});


// How do I save it properly to the database and do the redirect?
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
           // Respond with 'Ok' (we will replace this)
  let longURL = req.body.longURL
  let userID = users[req.cookies["user_id"]].id
  console.log(longURL)
  console.log(userID)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: userID}
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
  
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(shortURL)
  console.log(urlDatabase[shortURL])
  let longURL = urlDatabase[shortURL]["longURL"];
  
  let templateVars = { 
    shortURL: shortURL, 
    longURL: longURL
    //email: users[req.cookies["user_id"]].email
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  console.log(urlDatabase[shortURL]["longURL"])
  const longURL = urlDatabase[shortURL]["longURL"];// const longURL = ...
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