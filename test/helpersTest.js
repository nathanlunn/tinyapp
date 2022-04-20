const { generateRandomString, getUserByEmail } = require('../helpers');
const { assert } = require('chai');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined if passed an email not found in the database', function() {
    const user = getUserByEmail('userasdf@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

describe('generateRandomString', function() {
  it('should return a string that is 6 characters long', function() {
    const result = generateRandomString();
    assert.equal(result.length, 6);
  });
});