'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[migration] create-referrals up');
    await queryInterface.createTable('referrals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      doctor_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    console.log('[migration] referrals table created');

    await queryInterface.addIndex('referrals', ['doctor_id'], { name: 'referrals_doctor_idx' });
    console.log('[migration] referrals doctor index created');
    await queryInterface.addIndex('referrals', ['patient_id'], { name: 'referrals_patient_idx' });
    console.log('[migration] referrals patient index created');
  },

  async down(queryInterface) {
    console.log('[migration] create-referrals down');
    await queryInterface.dropTable('referrals');
    console.log('[migration] referrals table dropped');
  },
};
