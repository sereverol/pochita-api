const router = require('express').Router();
const user = require('../controllers/user_controller');

router.get('/user', user.getUser);

router.get('/:userId', user.getUserById);

router.post('/signup', user.createUsers);

router.post('/signin', user.login);

router.delete('/:userId', user.deleteUserById);

module.exports = router;
