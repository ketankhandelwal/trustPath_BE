'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    console.log('[migration] seed-initial-admin up');
    const email = 'admin@nidanpathology.com';
    const plainPassword = 'Admin@123';
    console.log('[migration] Default admin email:', email);

    const hash = await bcrypt.hash(plainPassword, 10);
    console.log('[migration] Password hash generated for default admin');

    await queryInterface.sequelize.query(
      `INSERT INTO admins (name, email, password_hash, is_active)
       VALUES (:name, :email, :hash, TRUE)
       ON CONFLICT (email) DO NOTHING;`,
      {
        replacements: { name: 'Nidan Admin', email, hash },
      }
    );
    console.log('[migration] Default admin row inserted (if not existing)');
    console.log('[migration] LOGIN:', email, '/ password:', plainPassword, '(change via Settings)');
  },

  async down(queryInterface) {
    console.log('[migration] seed-initial-admin down');
    await queryInterface.sequelize.query(
      `DELETE FROM admins WHERE email = 'admin@nidanpathology.com';`
    );
    console.log('[migration] Default admin row removed');
  },
};
