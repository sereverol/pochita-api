const router = require('express').Router();
const list = require('../controllers/list_controller');

router.get(`/user/:userId`, list.getMegaListByUserId);

router.post('/', list.createList);

router.put('/', list.updateListById);

router.delete('/:listId', list.deleteListById);

module.exports = router;
