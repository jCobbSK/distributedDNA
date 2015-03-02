"use strict";
module.exports = function(sequelize, DataTypes) {
  var Sample = sequelize.define("Sample", {
    dataPath: DataTypes.STRING,
    patientName: DataTypes.STRING,
    additionalInfo: DataTypes.STRING,
    isDone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Sample.belongsTo(models.User);
        Sample.hasMany(models.Result, {as:'Results'});
      }
    }
  });
  return Sample;
};