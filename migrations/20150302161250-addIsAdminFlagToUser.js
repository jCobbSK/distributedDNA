"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn('Users','isAdmin',{
      type: DataTypes.BOOLEAN,
      default: false
    });
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn('Users', 'isAdmin');
    done();
  }
};
