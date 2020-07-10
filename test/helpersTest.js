const { assert } = require('chai');

const helper = require("../helpers");

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

const noUsers = {

}

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = helper.getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert(user["id"] === expectedOutput);
  });

  it('email is not in users database', function() {
    const user = helper.getUserByEmail("user4@example.com", testUsers)
    const expectedOutput = undefined;
    assert(user === expectedOutput);
  });

  it('database has no users', function() {
    const user = helper.getUserByEmail("user4@example.com", noUsers)
    const expectedOutput = undefined;
    assert(user === expectedOutput);
  });

});