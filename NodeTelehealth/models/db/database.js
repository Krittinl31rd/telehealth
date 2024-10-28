const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('telehealth', 'root', '123456789', {
  host: 'localhost',
  dialect: 'mysql', // or 'postgres', 'sqlite', 'mariadb', etc.
});

module.exports = sequelize;
