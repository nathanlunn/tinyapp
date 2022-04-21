
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ["thisisalongsecretkeyithink"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');

let { generateRandomString, getUserByEmail } = require('./helpers');


// databases
const urlDatabase = {};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};



// home
app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  res.redirect('/login');
});


// Browse urls
app.get('/urls', (req, res) => {
  const filteredDatabase = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === req.session.user_id) {
      filteredDatabase[url] = urlDatabase[url];
    }
  }
  const templateVars = {urls: filteredDatabase, users, userId: req.session.user_id};
  res.render('urls_index', templateVars);
});


// Making a new shortURL
app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect('/login');
  }
  const templateVars = { users,  userId: req.session.user_id, blank: false };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    const statusCode = 403;
    const errorMessage = 'You must be logged in to create a shortURL';
    const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
    return res.render('error', templateVars);
  }
  if (req.body.longURL === '') {
    const templateVars = { users,  userId: req.session.user_id, blank: true };
    res.render('urls_new', templateVars);
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id, dateCreated: new Date(), visits: 0, uniqueVisits: [] };
  console.log(urlDatabase[shortURL].dateCreated);
  console.log(urlDatabase[shortURL].visits);
  console.log(urlDatabase[shortURL].uniqueVisits.length);
  res.redirect(`/urls/${shortURL}`);
});


// Read, edit, and delete specific shortURL
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] === undefined) {
    res.status(404);
    const statusCode = 404;
    const errorMessage = 'This shortURL does not exist';
    const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
    return res.render('error', templateVars);
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, users, urls: urlDatabase, userId: req.session.user_id, blank: false };
  res.render('urls_show', templateVars);
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(403);
    const statusCode = 403;
    const errorMessage = 'shortURL does not exist';
    const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
    return res.render('error', templateVars);
  }
  let longURL = req.body.longURL;
  if (!req.session.user_id) {
    res.status(403);
    const statusCode = 403;
    const errorMessage = 'You must be logged in to edit shortURLs';
    const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
    return res.render('error', templateVars);
  }
  if (longURL === '') {
    res.status(403);
    const templateVars = { shortURL, longURL, users, urls: urlDatabase, userId: req.session.user_id, blank: true };
    return res.render('urls_show', templateVars);
  }
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    urlDatabase[shortURL].longURL = longURL;
    return res.redirect('/urls');
  }
  res.status(403);
  const statusCode = 403;
  const errorMessage = 'You can\'t edit a shortURL you don\'t own';
  const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
  return res.render('error', templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL].userID === req.session.user_id) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  }
  res.status(403);
  const statusCode = 403;
  const errorMessage = 'You can\'t delete a shortURL you don\'t own';
  const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
  return res.render('error', templateVars);
});


// follow shortURL to longURL website
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.status(404);
    const statusCode = 404;
    const errorMessage = 'We could not find that shortURL.';
    const templateVars = { users,  userId: req.session.user_id, statusCode, errorMessage };
    return res.render('error', templateVars);
  }
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].visits++;
  if (!urlDatabase[shortURL].uniqueVisits.includes(req.session.user_id)) {
    urlDatabase[shortURL].uniqueVisits.push(req.session.user_id);
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


// login, register, and logout functionality
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = {urls: urlDatabase, users, userId: req.session.user_id, failed: false};
  res.render('login', templateVars);
});

app.post('/login', (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email, users)) {
    const user = getUserByEmail(email, users);
    if (bcrypt.compareSync(password, users[user].password)) {
      req.session.user_id = users[user].id;
      return res.redirect('/urls');
    }
  }
  res.status(403);
  const templateVars = {urls: urlDatabase, users, userId: req.session.user_id, failed: true};
  res.render('login', templateVars);
});

app.post('/logout', (req, res) => {
  req.session.user_id = undefined;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const templateVars = { users, userId: req.session.user_id, blank: false, inUse: false };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email.length === 0 || password.length === 0) {
    res.status(400);
    const templateVars = {urls: urlDatabase, users, userId: req.session.user_id, blank: true, inUse: false};
    return res.render('register', templateVars);
  }
  if (getUserByEmail(email, users)) {
    res.status(400);
    const templateVars = {urls: urlDatabase, users, userId: req.session.user_id, blank: false, inUse: true};
    return res.render('register', templateVars);
  }
  users[id] = { id, email, password };

  req.session.user_id = users[id].id;
  res.redirect('/urls');
});


// Other
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});


// listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});