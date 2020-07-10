const express = require("express");

const helperFunctions = {
  
  getUserByEmail: function(email, database) {
    for (let user in database) {
      if (database[user].email === email) {
        return database[user];
      } 
    } 
  },

  urlsForUser: function(user_id, database) {
    let urlList = {
    }
    for (let shortURL in database) {
      if (database[shortURL].userID === user_id) {
        urlList[shortURL] = database[shortURL]
      }
    }
    return(urlList);
  },
  
  
  generateRandomString: function() {
    String.random = function (length) {
      let radom13chars = function () {
        return Math.random().toString(16).substring(2, 15)
      }
      let loops = Math.ceil(length / 13)
      return new Array(loops).fill(radom13chars).reduce((string, func) => {
        return string + func()
      }, '').substring(0, length)
    }
    return (String.random(6))
  }
};

module.exports = helperFunctions;