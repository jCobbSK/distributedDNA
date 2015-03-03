"use strict";
module.exports = function(sequelize, DataTypes) {
  var Pattern = sequelize.define("Pattern", {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    data: DataTypes.TEXT,
    chromosome: DataTypes.INTEGER,
    sequenceStart: DataTypes.INTEGER,
    sequenceEnd: DataTypes.INTEGER,
    isForwardStrand: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Pattern;
};