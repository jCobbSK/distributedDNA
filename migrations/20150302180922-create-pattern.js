"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Patterns", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      chromosome: {
        type: DataTypes.INTEGER
      },
      sequenceStart: {
        type: DataTypes.INTEGER
      },
      sequenceEnd: {
        type: DataTypes.INTEGER
      },
      isForwardStrand: {
        type: DataTypes.BOOLEAN
      },
      data: {
        type: DataTypes.TEXT
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("Patterns").done(done);
  }
};