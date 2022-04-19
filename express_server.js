const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');

const generateRandomString = function() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    let code = Math.floor(Math.random() * 62);
    if (code < 10) {
      result += code.toString();
    } else if (code > 9 && code < 36) {
      result +=  String.fromCharCode(code + 55);
    } else {
      result += String.fromCharCode(code + 61);
    }
  }
  return result;
};

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase, users, userId: req.cookies['user_id']};
  console.log(users[req.cookies['user_id']]);
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = { users,  userId: req.cookies['user_id'] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, users, userId: req.cookies['user_id'] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    return res.send('<h1>We could not find that shortURL.\n</h1><p>head back to <a href="/urls">URL list</p>');
  }
  res.redirect(longURL);
});

app.get('/login', (req, res) => {
  const templateVars = {urls: urlDatabase, users, userId: req.cookies['user_id']};
  res.render('login', templateVars);
});

app.post('/login', (req, res) =>{
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = { users, userId: req.cookies['user_id'] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email.length === 0 || password.length === 0) {
    res.status(400);
    throw new Error('Must Fill in Email and Password field');
  }
  for (let user in users) {
    if (users[user].email === email) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }
  users[id] = { id, email, password };

  res.cookie('user_id', users[id].id);
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});