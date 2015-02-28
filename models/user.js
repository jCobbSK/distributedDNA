"use strict";
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isClient: DataTypes.BOOLEAN,
    computedTime: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        User.hasMany(Sample,{as: 'Samples'})
      }
    }
  });
  return User;
};