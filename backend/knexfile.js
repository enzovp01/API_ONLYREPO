// Update with your config settings.

module.exports = {
  //Cliente vai depender do banco que utilizarmos
  client: 'mysql',
  //Informações do Banco
  connection: {
    host: '127.0.0.1',
    user: 'root',
    database: 'db_pi', 
    password: "@teste123",
    charset: 'utf8'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
};