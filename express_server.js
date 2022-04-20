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

// const checkCookieToUsers = function(users, cookie, callback) {
//   for (let user in users) {
//     if (users[user].id === cookie) {
//       return true;
//     }
//   }
//   if (cookie === undefined) {
//     return;
//   }
//   callback();
// };

const urlDatabase = {};

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


// Browse urls
app.get('/urls', (req, res) => {
  const filteredDatabase = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.cookies['user_id']) {
      filteredDatabase[url] = { longURL: urlDatabase[url].longURL, userID: urlDatabase[url].userId };
    }
  }
  const templateVars = {urls: filteredDatabase, users, userId: req.cookies['user_id']};
  console.log(req.cookies.user_id);
  res.render('urls_index', templateVars);
});


// Making a new shortURL
app.get('/urls/new', (req, res) => {
  if (req.cookies['user_id'] === undefined) {
    res.status(403);
    return res.redirect('/urls');
  }
  const templateVars = { users,  userId: req.cookies['user_id'] };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies['user_id'] };
  res.redirect(`/urls/${shortURL}`);
});


// Read, edit, and delete specific shortURL
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404);
    throw new Error('ShortURL does not exist');
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, users, urls: urlDatabase, userId: req.cookies['user_id'] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  if (urlDatabase[shortURL].userID === req.cookies.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect('/urls');
  }
  res.status(403);
  throw new Error('You can\'t edit a shortURL you don\'t own');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.cookies.user_id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.status(403);
  throw new Error('You can\'t delete a shortURL you don\'t own');
});


// follow shortURL to longURL website
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    return res.send('<h1>We could not find that shortURL.\n</h1><p>head back to <a href="/urls">URL list</p>');
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// login, register, and logout functionality
app.get('/login', (req, res) => {
  const templateVars = {urls: urlDatabase, users, userId: req.cookies['user_id']};
  res.render('login', templateVars);
});

app.post('/login', (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  for (let user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie('user_id', users[user].id);
        return res.redirect('/urls');

      }
    }
  }
  res.status(403);
  throw new Error('Email or Password was not correct');
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



// OTher
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});