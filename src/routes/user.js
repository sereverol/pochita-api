const router = require('express').Router();
const user = require('../controllers/user_controller');

// Get
router.get('/user', user.getUser);
router.get(`/:userId`, user.getUserById);

// Post
router.post('/signup', user.createUsers);
router.post(`/singin`, user.login);

// Put
router.put(`/:userId`, user.updateUserById);
router.put(`/pass/:userId`, user.updatePassById);

// Delete
router.delete(`/:userId`, user.deleteUserById);

// Export
module.exports = router;
