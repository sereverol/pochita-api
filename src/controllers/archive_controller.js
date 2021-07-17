const Pool = require('pg').Pool;
const dbConfig = require('../config/db');
const dbQueriesArchive = require('../config/queries/archive');
const field = require('../utils/field');
const path = require('path');
const multer = require('multer');

const pool = new Pool(dbConfig);

const newReponse = (message, typeResponse, body) => {
  return { message, typeResponse, body };
};

const dataToArchives = (rows) => {
  const archives = [];

  rows.forEach((element) => {
    archives.push({
      id: element.archive_ide,
      data: element.archive_jso,
    });
  });

  return archives;
};

const archiveUpload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'archives/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + '_' + file.originalname);
    },
  }),
});

const saveArchive = async (req, res) => {
  const { filename, mimetype, size } = req.file;
  const filepath = req.file.path;
  const { taskId } = req.params;

  const data = await pool.query(dbQueriesArchive.createArchive, [
    taskId,
    filename,
    filepath,
    mimetype,
    size,
  ]);

  data
    ? res.json(
        newReponse('Archive created', 'Success', {
          id: data.rows[0].user_ide,
        })
      )
    : res.json(newReponse('Server Error', 'Error', {}));
};

const getArchivesByTaskId = async (req, res) => {
  const { taskId } = req.params;
  const data = await pool.query(dbQueriesArchive.getArchiveByTaskId, [taskId]);

  if (data) {
    data.rowCount > 0
      ? res.json(
          newReponse('Archives found', 'Success', dataToArchives(data.rows))
        )
      : res.json(newReponse('Task without archives', 'Success', []));
  } else {
    res.json(newReponse('Error searhing archives', 'Error', {}));
  }
};

const getArchive = (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, 'archives/' + filename);
  return res.sendFile(fullfilepath);
};

// const createArchive = async (req, res) => {
//   const { data, taskId } = req.body;
//   const errors = [];

//   if (!field.checkFields([data, taskId])) {
//     errors.push({ text: 'Empty fields' });
//   }

//   if (errors.length > 0) {
//     res.json(newReponse('Errors detected', 'Fail', { errors }));
//   } else {
//     const archiveData = await pool.query(dbQueriesArchive.createArchive, [
//       data,
//       taskId,
//     ]);

//     archiveData
//       ? res.json(
//           newReponse('Archive created successfully', 'Success', {
//             id: archiveData.archive_ide,
//           })
//         )
//       : res.json(newReponse('Error create archive', 'Error', {}));
//   }
// };

const deleteArchiveById = async (req, res) => {
  const { archiveId } = req.params;
  const data = await pool.query(dbQueriesArchive.deleteArchiveById, [
    archiveId,
  ]);

  data
    ? res.json(newReponse('Archive deleted successfully', 'Success', {}))
    : res.json(newReponse('Error on delete with id', 'Error', {}));
};

module.exports = {
  getArchivesByTaskId,
  saveArchive,
  archiveUpload,
  getArchive,
  deleteArchiveById,
};
