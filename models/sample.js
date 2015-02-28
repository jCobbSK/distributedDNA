"use strict";
module.exports = function(sequelize, DataTypes) {
  var Sample = sequelize.define("Sample", {
    data: DataTypes.BLOB,
    patientName: DataTypes.STRING,
    additionalInfo: DataTypes.STRING,
    isDone: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Sample.belongsTo(models.User,{foreignKey: 'userId'});
      }
    }
  });
  return Sample;
};