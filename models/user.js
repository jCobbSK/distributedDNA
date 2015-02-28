"use strict";
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    isClient: DataTypes.BOOLEAN,
    email: DataTypes.STRING,
    computedTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        User.hasMany(models.Sample,{as: 'Samples'})
      }
    }
  });
  return User;
};