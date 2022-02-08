//Aqui vamos configurar o Middlewares, do Express
//2 o body parser/ cors (a partir de outro aplicação pode acessar a API que vamos construir no backend)

//Importamos as duas dependencias (*Necessita ser instalados)
const bodyParser = require('body-parser')
const cors = require('cors')

//Padrão utilizado pelo consign para nao ter que ficar utilizando require o tempo todo
//Utilizando o padrão abaixo, ou seja exportar uma função que recebe um determinado parametro(que nomeamos de app), esse paramentro será exatamente o app que criamos no index.js (instancia do express)
module.exports = app => {
    app.use(bodyParser.json())
    app.use(cors())
}