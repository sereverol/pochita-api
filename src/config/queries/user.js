const table = 'user_1';

module.exports = {
  createUsers: `INSERT INTO ${table} (user_nam, user_ema, user_pas) VALUES ($1, $2, $3) 
    RETURNING user_ide`,

  getAllUsers: `SELECT * FROM ${table}`,

  getUserById: `SELECT * FROM ${table}  WHERE user_ide = $1`,

  getUserByEmail: `SELECT * FROM ${table} WHERE user_ema = $1`,

  getUsersByEmailAndPassword: `SELECT * FROM ${table}  WHERE user_email = $1 AND user_pas = $2`,

  deleteUserById: `DELETE FROM ${table} WHERE user_ide = $1`,
};
