const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let urlDataTemplate = { urls: urlDatabase };
  res.render("urls_index", urlDataTemplate);
});

app.get("/urls/:shortURL", (req, res) => {
  let urlDataTemplate = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", urlDataTemplate);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});