//Resumindo passei o arquivo de configurações e o resultado foi armazenado no knex
// vou importar as informações do Knexfile para aqui 
const config = require('../knexfile.js')
//vou instanciar o knex passando o arquivo de configurações para ele
const knex = require('knex')(config)

//Para poder acessar a instacia acima ( vou exportar o knex para acessar dentro do arquivo index)
knex.migrate.latest([config])
module.exports = knex 