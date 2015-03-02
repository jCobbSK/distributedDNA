"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Results", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      SampleId: {
        type: DataTypes.INTEGER,
        references: 'Samples',
        referencesKey: 'id',
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      PatternId: {
        type: DataTypes.INTEGER,
        references: 'Patterns',
        referencesKey: 'id',
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      result: {
        type: DataTypes.BOOLEAN
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
    migration.dropTable("Results").done(done);
  }
};