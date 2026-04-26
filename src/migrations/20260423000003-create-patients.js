'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[migration] create-patients up');
    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING(160), allowNull: false },
      age: { type: Sequelize.INTEGER, allowNull: true },
      sex: { type: Sequelize.STRING(20), allowNull: true },
      phone: { type: Sequelize.STRING(20), allowNull: true },
      email: { type: Sequelize.STRING(160), allowNull: true },
      address: { type: Sequelize.TEXT, allowNull: true },
      referred_by_doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    console.log('[migration] patients table created');

    await queryInterface.addIndex('patients', ['referred_by_doctor_id'], { name: 'patients_referred_by_idx' });
    console.log('[migration] patients referred_by_doctor_id index created');
    await queryInterface.addIndex('patients', ['name'], { name: 'patients_name_idx' });
    console.log('[migration] patients name index created');
  },

  async down(queryInterface) {
    console.log('[migration] create-patients down');
    await queryInterface.dropTable('patients');
    console.log('[migration] patients table dropped');
  },
};
