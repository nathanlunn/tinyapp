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

module.exports = { getUserByEmail, generateRandomString };