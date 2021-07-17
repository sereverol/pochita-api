const Pool = require('pg').Pool;
const dbConfig = require('../config/db');
const dbQueriesTask = require('../config/queries/task');
const field = require('../utils/field');

const pool = new Pool(dbConfig);

const newReponse = (message, typeResponse, body) => {
  return { message, typeResponse, body };
};

const dataToTask = (rows) => {
  const archives = [];

  rows.forEach((element) => {
    archives.push({
      id: element.task_ide,
      title: element.task_tit,
      dateCreate: element.task_dat_cre,
      dateExpiration: element.task_dat_exp,
      dateNotification: element.task_dat_not,
      note: element.task_des,
      priority: element.task_pin,
      check: element.task_che,
      position: element.task_pos,
    });
  });

  return archives;
};

const getTaskByListId = async (req, res) => {
  const { listId } = req.params;
  const data = await pool.query(dbQueriesTask.getTaskByListId, [listId]);

  if (data) {
    data.rowCount > 0
      ? res.json(newReponse('Task found', 'Success', dataToTask(data.rows)))
      : res.json(newReponse('List without task', 'Success', []));
  } else {
    res.json(newReponse('Error searhing task', 'Error', {}));
  }
};

const createTask = async (req, res) => {
  const { title, listId, position } = req.body;
  const errors = [];

  if (!field.checkFields([title, listId, position])) {
    errors.push({ text: 'Empty fields' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    const data = await pool.query(dbQueriesTask.createTask, [
      title,
      false,
      false,
      new Date(),
      position,
      listId,
    ]);

    data
      ? res.json(
          newReponse('Task created', 'Success', { id: data.rows[0].task_ide })
        )
      : res.json(newReponse('Error create task', 'Error', {}));
  }
};

const updateTaskFieldById = async (req, res) => {
  const { id, field, type } = req.body;
  const errors = [];

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    let data;

    switch (type) {
      case 'title':
        data = await pool.query(dbQueriesTask.updateTasktitleById, [field, id]);
        break;

      case 'note':
        data = await pool.query(dbQueriesTask.updateTaskNoteById, [field, id]);
        break;

      case 'date':
        data = await pool.query(dbQueriesTask.updateTaskDateExpById, [
          field,
          id,
        ]);
        break;

      case 'notification':
        data = await pool.query(dbQueriesTask.updateTaskDateNotificationById, [
          field,
          id,
        ]);
        break;

      case 'priority':
        data = await pool.query(dbQueriesTask.updateTaskPriorityExpById, [
          field,
          id,
        ]);
        break;

      case 'check':
        data = await pool.query(dbQueriesTask.updateTaskCheckExpById, [
          field,
          id,
        ]);
        break;

      default:
        res.json(newReponse('Type not found', 'Error', {}));
        break;
    }

    data
      ? res.json(newReponse('Field updated successfully', 'Success', {}))
      : res.json(newReponse('Error update field', 'Error', {}));
  }
};

const deleteTaskById = async (req, res) => {
  const { taskId } = req.params;
  const data = await pool.query(dbQueriesTask.deleteTaskById, [taskId]);

  data
    ? res.json(newReponse('Task deleted successfully', 'Success', {}))
    : res.json(newReponse('Error on delete with id', 'Error', {}));
};

module.exports = {
  getTaskByListId,
  createTask,
  updateTaskFieldById,
  deleteTaskById,
};
