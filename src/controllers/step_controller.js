const Pool = require('pg').Pool;
const dbConfig = require('../config/db');
const dbQueriesStep = require('../config/queries/step');
const field = require('../utils/field');

const pool = new Pool(dbConfig);

const newReponse = (message, typeResponse, body) => {
  return { message, typeResponse, body };
};

const dataToSteps = (rows) => {
  const archives = [];

  rows.forEach((element) => {
    archives.push({
      id: element.step_ide,
      description: element.step_des,
      check: element.step_che,
    });
  });

  return archives;
};

const getStepsByTaskId = async (req, res) => {
  const { taskId } = req.params;
  const data = await pool.query(dbQueriesStep.getStepByTaskId, [taskId]);

  if (data) {
    data.rowCount > 0
      ? res.json(newReponse('Step found', 'Success', dataToSteps(data.rows)))
      : res.json(newReponse('Task without steps', 'Success', []));
  } else {
    res.json(newReponse('Error searhing steps', 'Error', {}));
  }
};

const createStep = async (req, res) => {
  const { description, taskId, check } = req.body;
  const errors = [];

  if (!field.checkFields([description, taskId, check])) {
    errors.push({ text: 'Empty fields' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    const data = await pool.query(dbQueriesStep.createStep, [
      description,
      check,
      taskId,
    ]);

    data
      ? res.json(
          newReponse('Step created successfully', 'Success', {
            id: data.rows[0].step_ide,
          })
        )
      : res.json(newReponse('Error create step', 'Error', {}));
  }
};

const updateStepById = async (req, res) => {
  const { description, check, id, type } = req.body;
  const errors = [];

  if (!field.checkFields([description, id, type, check])) {
    errors.push({ text: 'Empty fields' });
  }

  if (errors.length > 0) {
    res.json(newReponse('Errors detected', 'Fail', { errors }));
  } else {
    let data;

    switch (type) {
      case 'check':
        data = await pool.query(dbQueriesStep.updateStepCheckById, [check, id]);
        break;

      case 'description':
        data = await pool.query(dbQueriesStep.updateStepDescriptionById, [
          description,
          id,
        ]);
        break;

      default:
        data = await pool.query(dbQueriesStep.updateStepById, [
          description,
          check,
          id,
        ]);
        break;
    }

    data
      ? res.json(newReponse('Step updated successfully', 'Success', {}))
      : res.json(newReponse('Error update step', 'Error', {}));
  }
};

const deleteStepById = async (req, res) => {
  const { stepId } = req.params;
  const data = await pool.query(dbQueriesStep.deleteStepById, [stepId]);

  data
    ? res.json(newReponse('step deleted successfully', 'Success', {}))
    : res.json(newReponse('Error on delete with id', 'Error', {}));
};

module.exports = {
  createStep,
  getStepsByTaskId,
  updateStepById,
  deleteStepById,
};
