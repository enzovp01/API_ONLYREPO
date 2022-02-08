module.exports = middleware => {
    return (req, res, next) => {
        //Validação se o usuario é um admin
        if(req.user.admin) {
            //vou chamar o middleware passando os parametros
            middleware(req, res, next)
        } else {
            //Caso não seja admin, vamos mandar msg de erro
            res.status(401).send('Usuário não é administrador.')
        }
    }
}