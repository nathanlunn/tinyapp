const generateHelperFunctions = function(users, urlDatabase) {
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
  
  const getUserByEmail = function(email, database) {
    for (let user in database) {
      if (database[user].email === email) {
        return user;
      }
    }
    return;
  };
  
  // NEEDED TO SOLVE ERROR DUE TO LACK OF DATABASE
  const validCookie = (cookie, users) => {
    for (let user in users) {
      if (users[user].id === cookie) {
        return true;
      }
    }
    return false;
  };

  const urlsOwnedByUser = function(cookie) {
    const filteredDatabase = {};
    for (let url in urlDatabase) {
      if (urlDatabase[url].userID === cookie) {
        filteredDatabase[url] = urlDatabase[url];
      }
    }
    return filteredDatabase;
  };

  return { generateRandomString, getUserByEmail, validCookie, urlsOwnedByUser };
};

module.exports = generateHelperFunctions;