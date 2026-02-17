const bcrypt = require('bcrypt');

async function run() {
  const password = process.argv[2];

  if (!password) {
    console.log('Usage: node hashPassword.js yourpassword');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  console.log('\nHASH:\n');
  console.log(hash);
}

run();
