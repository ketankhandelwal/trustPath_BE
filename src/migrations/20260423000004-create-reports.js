'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('[migration] create-reports up');
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      report_name: { type: Sequelize.STRING(200), allowNull: false },
      sample_date: { type: Sequelize.DATEONLY, allowNull: true },
      reg_no: { type: Sequelize.STRING(80), allowNull: true },
      lab_no: { type: Sequelize.STRING(80), allowNull: true },
      patient_name: { type: Sequelize.STRING(160), allowNull: false },
      age: { type: Sequelize.INTEGER, allowNull: true },
      sex: { type: Sequelize.STRING(20), allowNull: true },
      patient_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'patients', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      referred_by_doctor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'doctors', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      referred_by_self: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      panel: { type: Sequelize.STRING(160), allowNull: true },
      investigation: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'in_progress',
      },
      file_path: { type: Sequelize.STRING(500), allowNull: true },
      file_type: { type: Sequelize.STRING(20), allowNull: true },
      file_original_name: { type: Sequelize.STRING(255), allowNull: true },
      file_size_bytes: { type: Sequelize.BIGINT, allowNull: true },
      uploaded_by_admin_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'admins', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
    console.log('[migration] reports table created');

    await queryInterface.sequelize.query(
      "ALTER TABLE reports ADD CONSTRAINT reports_status_chk CHECK (status IN ('completed','incomplete','in_progress'));"
    );
    console.log('[migration] reports status CHECK constraint added');

    await queryInterface.addIndex('reports', ['referred_by_doctor_id'], { name: 'reports_doctor_idx' });
    console.log('[migration] reports doctor index created');
    await queryInterface.addIndex('reports', ['status'], { name: 'reports_status_idx' });
    console.log('[migration] reports status index created');
    await queryInterface.addIndex('reports', ['patient_name'], { name: 'reports_patient_name_idx' });
    console.log('[migration] reports patient_name index created');
    await queryInterface.addIndex('reports', ['created_at'], { name: 'reports_created_at_idx' });
    console.log('[migration] reports created_at index created');
  },

  async down(queryInterface) {
    console.log('[migration] create-reports down');
    await queryInterface.dropTable('reports');
    console.log('[migration] reports table dropped');
  },
};
