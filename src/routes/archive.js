const router = require('express').Router();
const archive = require('../controllers/archive_controller');

router.get('/task/:taskId', archive.getArchivesByTaskId);

router.get('/:filename', archive.getArchive);

router.post(
  '/:taskId',
  archive.archiveUpload.single('archive'),
  archive.saveArchive,
  (req, res) => {
    console.log(req.file);
  }
);

router.delete('/:archiveId', archive.deleteArchiveById);

module.exports = router;
