const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306
    });

    console.log('CONNECTED TO MYSQL');
    await conn.end();
  } catch (err) {
    console.error('CONNECTION FAILED:', err);
  }
})();