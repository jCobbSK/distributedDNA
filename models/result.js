"use strict";
module.exports = function(sequelize, DataTypes) {
  var Result = sequelize.define("Result", {
    result: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Result.belongsTo(models.Pattern);
        Result.belongsTo(models.Sample);
      }
    }
  });
  return Result;
};