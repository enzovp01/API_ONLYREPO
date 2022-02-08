const app = require('express')()
const consign = require('consign')
//vou importar o arquivo  db que criei dentro de config
const db = require('./config/db')
//vou adicionar dentro o App o DB

app.db = db

//Injetamos com consign cada uma das dependencias na aplicação
consign()
.include('./config/passport.js')
.then('./config/middlewares.js')
.then('./api/validation.js')
//Faço consign carregar todos os arquivos que estiverem dentro de /api
.then('./api')
//Faço consign carregar todos os arquivos que estiverem nas routas 
.then('./config/routes.js')
.into(app)

//Eu vou escutar na porta 3001, que vai validar quando fizer um bind na porta solicitada vai printar uma msg que está funcional
//Caso encontrar um erro nessa linha apenas alterar a porta(*PROCESSOS DO SEU PC, PODEM ESTAR UTILIZANDO ESSA PORTA*)
app.listen(3001, () =>{
    console.log('Backend executando ...')
})