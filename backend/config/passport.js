const { authSecret } = require('../.env')
const passport = require('passport') 
const passportJwt = require('passport-jwt')
const { Strategy, ExtractJwt } = passportJwt

module.exports = app => {
    //Aqui vamos pegar alguns parametros dentro desse objeto, para depois criar a estrategia
    const params = {
        //passo o segredo
        secretOrKey: authSecret,
        //o token que foi extraido da request vai ser extraido apartir da requisição
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }

    //Criamos a estrategia, passando um parametro e vou passar uma função payload (callback,lá do sigin do arquivo .auth) e função done 
    const strategy = new Strategy(params, (payload, done) => {
        app.db('users')
            //obtemos usuarios pelo id
            .where({ id: payload.id })
            .first()//unique usuario
            //recendo usuario com a função done, primeiro parametro vai ser nulo e o segundo será usuário,
            //se user estiver setado, vou oegar o payload e colocar dentro de uma requisição e retornar o propio payload
            //Caso o usuario nao estiver setado vou retornar falso
            .then(user => done(null, user ? { ...payload } : false))
            //caso tenha algum erro, tambem vai cair em um erro (falso)
            .catch(err => done(err, false))
    })
    //Vai usar a strategy pra aplicar
    passport.use(strategy)

    //Vou retornar o metodo authenticate,la nas rotas pra filtrar as requisições e não permitir que sejam feita em cima dos web service
    // que precisam passar pelo passport,
    return {
        authenticate: () => passport.authenticate('jwt', { session: false })
    }
}