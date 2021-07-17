const table = 'archive';

module.exports = {
  createArchive: `INSERT INTO ${table} (archive_jso, task_ide) VALUES ($1, $2)`,

  getAllArchives: `SELECT * FROM ${table}`,

  getArchiveById: `SELECT * FROM ${table} WHERE archive_ide = $1`,

  getArchiveByTaskId: `SELECT * FROM ${table} WHERE task_ide = $1`,

  deleteArchiveById: `DELETE FROM ${table} WHERE archive_ide = $1`,

  deleteArchiveByTaskId: `DELETE FROM ${table} WHERE task_ide = $1`,
};
