'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[migration] create-doctors up');
    await queryInterface.createTable('doctors', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(160), allowNull: false },
      phone: { type: Sequelize.STRING(20), allowNull: false },
      email: { type: Sequelize.STRING(160), allowNull: false, unique: true },
      speciality: { type: Sequelize.STRING(120), allowNull: false },
      hospital: { type: Sequelize.STRING(200), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      login_id: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_by: { type: Sequelize.UUID, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    console.log('[migration] doctors table created');

    await queryInterface.addIndex('doctors', ['email'], { unique: true, name: 'doctors_email_uidx' });
    console.log('[migration] doctors email index created');
    await queryInterface.addIndex('doctors', ['login_id'], { unique: true, name: 'doctors_login_id_uidx' });
    console.log('[migration] doctors login_id index created');
    await queryInterface.addIndex('doctors', ['phone'], { name: 'doctors_phone_idx' });
    console.log('[migration] doctors phone index created');
    await queryInterface.addIndex('doctors', ['name'], { name: 'doctors_name_idx' });
    console.log('[migration] doctors name index created');
    await queryInterface.addIndex('doctors', ['created_at'], { name: 'doctors_created_at_idx' });
    console.log('[migration] doctors created_at index created');
  },

  async down(queryInterface) {
    console.log('[migration] create-doctors down');
    await queryInterface.dropTable('doctors');
    console.log('[migration] doctors table dropped');
  },
};
