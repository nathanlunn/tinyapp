const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

function generateRandomString() {
  let result = "";
  for (let i = 0; i < 6; i++) {
    let code = Math.floor(Math.random() * 62);
    if (code < 10) {
      result += code.toString();
    } else if (code > 9 && code < 36) {
      result +=  String.fromCharCode(code + 55)
    } else {
      result += String.fromCharCode(code + 61);
    }
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
}); 

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL };
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    return res.send('<h1>We could not find that shortURL.\n</h1><p>head back to <a href="/urls">URL list</p>' )
  }
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});