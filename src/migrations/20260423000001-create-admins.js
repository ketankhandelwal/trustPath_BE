'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[migration] create-admins up');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('[migration] uuid-ossp extension ensured');

    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(160),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
    console.log('[migration] admins table created');

    await queryInterface.addIndex('admins', ['email'], { unique: true, name: 'admins_email_uidx' });
    console.log('[migration] admins email index created');
  },

  async down(queryInterface) {
    console.log('[migration] create-admins down');
    await queryInterface.dropTable('admins');
    console.log('[migration] admins table dropped');
  },
};
