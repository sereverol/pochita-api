const Pool = require('pg').Pool;
const bcryt = require('bcryptjs');
const dbConfig = require('../config/db');
const dbQueriesUser = require('../config/queries/user');
const passwordUtil = require('../utils/password');
const field = require('../utils/field');

// Variables
const pool = new Pool(dbConfig);

// Utilities
const newReponse = (message, typeResponse, body) => {
  return { message, typeResponse, body };
};

const dataToUser = (rows) => {
  const users = [];

  rows.forEach((element) => {
    users.push({
      name: element.user_nam,
      email: element.user_ema,
      id: element.user_ide,
    });
  });

  return users;
};

const checkEmail = async (email, callBack) => {
  const data = await pool.query(dbQueriesUser.getUserByEmail, [email]);

  if (data) {
    if (data.rows.length > 0) {
      return callBack(null, dataToUser(data.rows));
    } else {
      return callBack(null, null);
    }
  } else {
    return callBack('Error on query');
  }
};

// Logic
const login = async (req, res) => {
  const { email, password } = req.body;
  const data = await pool.query(dbQueriesUser.getUserByEmail, [email]);

  if (data) {
    if (data.rowCount > 0) {
      const users = dataToUser(data.rows);

      (await bcryt.compare(password, data.rows[0].user_pas))
        ? res.json(newReponse('Logged successfully', 'Success', users))
        : res.json(newReponse('Incorrect password', 'Error', {}));
    } else {
      res.json(newReponse('Email not found', 'Error', {}));
    }
  } else {
    res.json(newReponse('Error searching user with email', 'Error', {}));
  }
};

const getUser = async (req, res) => {
  const data = await pool.query(dbQueriesUser.getAllUsers);

  if (data) {
    data.rowCount > 0
      ? res.json(newReponse('All users', 'Success', dataToUser(data.rows)))
      : res.json(newReponse('Error searhing the users', 'Error', {}));
  } else {
    res.json(newReponse('Without users', 'Success', {}));
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;
  const data = await pool.query(dbQueriesUser.getUserById, [userId]);

  if (data) {
    data.rowCount > 0
      ? res.json(newReponse('User found', 'Success', dataToUser(data.rows)))
      : res.json(newReponse('User not found', 'Error', {}));
  } else {
    res.json(newReponse('Error searching user with id', 'Error', {}));
  }
};

const createUsers = (req, res) => {
  const { name, password, confirmPassword, email } = req.body;
  const errors = [];

  if (!field.checkFields([name, password, confirmPassword, email])) {
    errors.push({ text: 'Please fill in all the spaces' });
  }

  if (!passwordUtil.checkPass(password, confirmPassword)) {
    console.log('aqui deberia quedar');
    errors.push({
      text: 'passwords must be uppercase, lowercase, special characters, have more than 8 digits and match each other',
    });
  }

  if (errors.length > 0) {
    console.log('aqui deberia salir');
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    checkEmail(email, (err, users) => {
      if (err) {
        res.json(newReponse(err, 'Error', {}));
      } else if (users) {
        res.json(newReponse(`Email ${email} already use`, 'Error', {}));
      } else {
        passwordUtil.encryptPass(password, async (err, hash) => {
          if (err) {
            res.json(newReponse(err, 'Error', {}));
          } else {
            const data = await pool.query(dbQueriesUser.createUsers, [
              name,
              email,
              hash,
            ]);

            data
              ? res.json(
                  newReponse('User created', 'Success', {
                    id: data.rows[0].user_ide,
                  })
                )
              : res.json(newReponse('Error create user', 'Error', {}));
          }
        });
      }
    });
  }
};

const updateUserById = (req, res) => {
  const { name, email } = req.body;
  const { userId } = req.params;
  const errors = [];

  if (!field.checkFields([name, email])) {
    errors.push({ text: 'Please fill in all the spaces' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    checkEmail(email, async (err, users) => {
      if (err) {
        res.json(newReponse(err, 'Error', {}));
      } else if (!users) {
        res.json(newReponse('User not found', 'Error', {}));
      } else {
        if (users[0].id != userId) {
          res.json(newReponse(`Email ${email} already use`, 'Error', {}));
        } else {
          const data = await pool.query(dbQueriesUser.updateUserById, [
            name,
            email,
            userId,
          ]);

          data
            ? res.json(newReponse('User updated', 'Success', {}))
            : res.json(newReponse('Error on update', 'Error', {}));
        }
      }
    });
  }
};

const updatePassById = async (req, res) => {
  const { password, confirmPassword, oldPassword } = req.body;
  const { userId } = req.params;
  const errors = [];

  if (!field.checkFields([password, confirmPassword, oldPassword, userId])) {
    errors.push({ text: 'Please fill in all the spaces' });
  }

  if (!passwordUtil.checkPass(password, confirmPassword)) {
    errors.push({
      text: 'passwords must be uppercase, lowercase, special characters, have more than 8 digits and match each other',
    });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    const user = await pool.query(dbQueriesUser.getUserById, [userId]);

    if (user) {
      if (user.rowCount <= 0) {
        res.json(newReponse('User not found', 'Error', {}));
      } else {
        if (await bcryt.compare(oldPassword, user.rows[0].user_pas)) {
          passwordUtil.encryptPass(password, async (err, hash) => {
            if (err) {
              res.json(newReponse(err, 'Error', {}));
            } else {
              const data = await pool.query(dbQueriesUser.updatePassById, [
                hash,
                userId,
              ]);

              data
                ? res.json(newReponse('Pass updated', 'Success', {}))
                : res.json(newReponse('Error on update', 'Error', {}));
            }
          });
        } else {
          res.json(newReponse('Old password no match', 'Error', {}));
        }
      }
    } else {
      res.json(newReponse('Error searshing user', 'Error', {}));
    }
  }
};

const deleteUserById = async (req, res) => {
  const { userId } = req.params;
  const data = await pool.query(dbQueriesUser.deleteUserById, [userId]);

  data
    ? res.json(newReponse('User deleted successfully', 'Success', {}))
    : res.json(newReponse('Error on delete with id', 'Error', {}));
};

// Export
module.exports = {
  login,
  getUser,
  createUsers,
  getUserById,
  updateUserById,
  updatePassById,
  deleteUserById,
};
