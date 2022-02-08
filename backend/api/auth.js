const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    //Criamos uma função chamada signin recebe requisição e resposta
    const signin = async (req, res) => {
        //Validar o email e a senha que vem no body da requisição
        if (!req.body.email || !req.body.password) {
            //se não tiver presente nenhum dos dois retornamos um erro
            return res.status(400).send('Informe usuário e senha!')
        }

        //Vamos obter usuario do banco de dados
        const user = await app.db('users')
            //onde email é exatamente o email que recebi no body da requisição
            .where({ email: req.body.email })
            .whereNull('deletedAt')//Para que o usuario deletado não consiga passar pela authentificação
            // o primeiro
            .first()

        //Se esse usuario não existir, você esta tentando logar com usuário não cadastrado
        if (!user) return res.status(400).send('Usuário não encontrado!')

        //Comparar a senhas, pra ver se deu match
        //Vou passar a senha nua que recebi e a senha do usuario criptografia como parametros, com função de comparar elas
        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        //caso não der match vou retornar um erro com msg
        if (!isMatch) return res.status(401).send('Email/Senha inválidos!')

        /*Para gerar um token vamos precisar pegar a data como referencia, realizamos conversão em segundos, pois ela vem em milisegundos
        uso math.floor para arrendodar a data em segundos, pois ela vem quebrada
        tudo isso pra validar em que momento foi gerado aquele token*/
        const now = Math.floor(Date.now() / 1000) 
        //Criamos o token do conteudo
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            //essa função iat significa(issued at: now. emitido em: agora)
            iat: now,
            //definimos a data de expiração do token:
            // now + 60 seg * 60 mintuos * 24 horas * 3 = token equivalente a 3 dias, não precisa logar por 3 dias
            exp: now + (60 * 60 * 24 * 3)
        }

        //Resposta pro usuario
        res.json({
            //vou mandar o payload(dentro ele tem id,name,email e admin do usuario)
            ...payload,
            //token vai receber jwt, passando o payload e authsecret como parametro
            token: jwt.encode(payload, authSecret)
        })
    }

    //Validação
    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            //se userData estiver setado
            if(userData) {
                //Vou chamar o token com jwt para decodificar , passando userdata e token juntamente com authSecret
                const token = jwt.decode(userData.token, authSecret)
                //Para essa decodificação, precisamos de um teste, se token experição for maior que a data atual.
                if(new Date(token.exp * 1000) > new Date()) {
                    //Está valido ainda
                    return res.send(true)
                }
            }
        } catch(e) {
            // problema com o token
        }

        res.send(false)
    }

    return { signin, validateToken }
}