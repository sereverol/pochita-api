const Pool = require('pg').Pool;
const dbConfig = require('../config/db');
const dbQueriesList = require('../config/queries/list');
const dbQueriesTask = require('../config/queries/task');
const dbQueriesArchive = require('../config/queries/archive');
const dbQueriesStep = require('../config/queries/step');
const field = require('../utils/field');

const pool = new Pool(dbConfig);

const newReponse = (message, typeResponse, body) => {
  return { message, typeResponse, body };
};

const dataToList2 = (rows) => {
  const archives = [];

  rows.forEach((element) => {
    archives.push({
      id: element.list_ide,
      title: element.list_tit,
      background: element.list_img,
    });
  });

  return archives;
};

const dataToList = (list, tasks) => {
  return {
    id: list.list_ide,
    title: list.list_tit,
    background: list.list_img,
    tasks,
  };
};

const dataToTask = (task, archives, steps) => {
  return {
    id: task.task_ide,
    title: task.task_tit,
    dateCreate: task.task_dat_cre,
    dateExpiration: task.task_dat_exp,
    dateNotification: task.task_dat_not,
    note: task.task_des,
    priority: task.task_pin,
    check: task.task_che,
    position: task.task_pos,
    listId: task.list_ide,
    archives,
    steps,
  };
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

const dataToSteps = (rows) => {
  const steps = [];

  rows.forEach((element) => {
    steps.push({
      id: element.step_ide,
      description: element.step_des,
      check: element.step_che,
    });
  });

  return steps;
};

const getArchivesAndStepsWithTask = async (task) => {
  const archiveData = await pool.query(dbQueriesArchive.getArchiveByTaskId, [
    task.id,
  ]);
  const stepData = await pool.query(dbQueriesStep.getStepByTaskId, [task.id]);
  let aux = task;

  if (archiveData.rowCount > 0) {
    aux = { ...aux, steps: dataToSteps(stepData.rows) };
  }

  if (stepData.rowCount > 0) {
    aux = { ...aux, archives: dataToArchives(archiveData.rows) };
  }

  return aux;
};

const getTasksWithList = async (list) => {
  const taskData = await pool.query(dbQueriesTask.getTaskByListId, [list.id]);
  let tasks = [];

  if (taskData.rowCount > 0) {
    for (let i = 0; i < taskData.rowCount; i++) {
      tasks.push(
        await getArchivesAndStepsWithTask(dataToTask(taskData.rows[i], [], []))
      );
    }
    return { ...list, tasks: tasks };
  } else {
    return list;
  }
};

const getMegaListByUserId = async (req, res) => {
  const { userId } = req.params;
  const data = await pool.query(dbQueriesList.getListByUserId, [userId]);

  if (!data) {
    res.json(newReponse('Error searshing list', 'Error', {}));
  } else {
    if (data.rowCount <= 0) {
      res.json(newReponse('User without list', 'Success', []));
    } else {
      let resAux = [];

      for (let i = 0; i < data.rowCount; i++) {
        resAux.push(await getTasksWithList(dataToList(data.rows[i], [])));
      }

      res.json(newReponse('List found', 'Success', resAux));
    }
  }
};

const getListByUserId = async (req, res) => {
  const { userId } = req.params;
  const data = await pool.query(dbQueriesList.getListByUserId, [userId]);

  if (data) {
    data.rowCount > 0
      ? res.json(newReponse('List found', 'Success', dataToList2(data.rows)))
      : res.json(newReponse('User without list', 'Success', []));
  } else {
    res.json(newReponse('Error searhing list', 'Error', {}));
  }
};

const createList = async (req, res) => {
  const { title, userId, background } = req.body;
  const errors = [];

  if (!field.checkFields([title, userId])) {
    errors.push({ text: 'Empty fields' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    const data = await pool.query(dbQueriesList.createList, [
      title,
      background,
      userId,
    ]);

    data
      ? res.json(
          newReponse('List created', 'Success', { id: data.rows[0].list_ide })
        )
      : res.json(newReponse('Error create list', 'Error', {}));
  }
};

const updateListById = async (req, res) => {
  const { title, background, id } = req.body;
  const errors = [];

  if (!field.checkFields([title, background])) {
    errors.push({ text: 'Empty fields' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    const data = await pool.query(dbQueriesList.updateListById, [
      title,
      background,
      id,
    ]);

    data
      ? res.json(newReponse('List updated', 'Success', {}))
      : res.json(newReponse('Error update list', 'Error', {}));
  }
};

const deleteListById = async (req, res) => {
  const { listId } = req.params;
  const data = await pool.query(dbQueriesList.deleteListById, [listId]);

  data
    ? res.json(newReponse('List deleted successfully', 'Success', {}))
    : res.json(newReponse('Error on delete with id', 'Error', {}));
};

module.exports = {
  getListByUserId,
  getMegaListByUserId,
  createList,
  updateListById,
  deleteListById,
};
