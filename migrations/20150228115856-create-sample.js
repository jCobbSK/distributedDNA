"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("Samples", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },

      userId: {
        type: DataTypes.INTEGER,
        references: 'Users',
        referencesKey: 'id',
        onUpdate: 'cascade',
        onDelete: 'restrict'
      },
      data: {
        type: DataTypes.BLOB
      },
      patientName: {
        type: DataTypes.STRING
      },
      additionalInfo: {
        type: DataTypes.STRING
      },
      isDone: {
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
    migration.dropTable("Samples").done(done);
  }
};