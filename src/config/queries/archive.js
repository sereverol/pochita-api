const table = 'archive';

module.exports = {
  createArchive: `INSERT INTO ${table} (task_ide, filename, filepath, mimetype, size) VALUES ($1, $2, $3, $4, $5)`,

  getAllArchives: `SELECT * FROM ${table}`,

  getArchiveById: `SELECT * FROM ${table} WHERE archive_ide = $1`,

  getArchiveByTaskId: `SELECT * FROM ${table} WHERE task_ide = $1`,

  deleteArchiveById: `DELETE FROM ${table} WHERE archive_ide = $1`,

  deleteArchiveByTaskId: `DELETE FROM ${table} WHERE task_ide = $1`,
};
