//Importe do bcrypt, para podermos criptografar 
const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    //Em vez de ficar repetindo codigo pra chamar as função de validação, vamos utilizar um Destructuring
    const { existsOrError, notExistsOrError, equalsOrError } = app.api.validation
    //Aqui vamos criar uma função que seja responsavel por criptografar as senhas
    //Função recebe uma senha
    const encryptPassword = password => {
        //Primeiro vamos calcular o nosso *TEMPERO*, para gerar nossa senha(HASH)
        const salt = bcrypt.genSaltSync(10)
        //Retornamos o hash da senha de forma sincrona sem precisar de um callback
        return bcrypt.hashSync(password, salt)
    }
// Criamos uma função save, seria metodo de inserção ou atualizar de usuario
    const save = async (req, res) => {
        //Peguamos o body espalhei os atributos que vieram nele com o(...) e coloquei dentro de um outro objeto {}
        const user = { ...req.body }
        //O nosso método serve tanto para criação/como alteração, então caso o usuario deseje alterar o seu user
        //o sistema interpreta que é uma alteração, então ele sobrescreve os parametros da requição do ID
        if(req.params.id) user.id = req.params.id

        if(!req.originalUrl.startsWith('/users')) user.admin = false
        if(!req.user || !req.user.admin) user.admin = false

        //Serie de validações
        try {
            //Se não existir ele apresenta as mensg
            existsOrError(user.name, 'Nome não informado')
            existsOrError(user.email, 'E-mail não informado')
            existsOrError(user.password, 'Senha não informada')
            existsOrError(user.confirmPassword, 'Confirmação de Senha inválida')
            equalsOrError(user.password, user.confirmPassword,'Senhas não conferem')

            //Precisamos de uma validação para saber se o usuario já esta cadastrado em nosso banco de dados
            //Atraves de uma constante utilizamos o await do async(sincronização utilizada no nosso save) pra chamar o nosso db dentro de app(ou seja knex)
            const userFromDB = await app.db('users')
                //onde o email é exatamente o email, e como não quero pegar uma lista de usuários insiro o first(primeiro) para vir apenas um na requisição
                .where({ email: user.email }).first()
                //Essa validação só vai ocorrer caso o id estiver setado, para que não ocorra duplicação de usuario cadastrados, já que o email é unique
            if(!user.id) {
                notExistsOrError(userFromDB, 'Usuário já cadastrado')
            }
        //Qualquer violação de nossa validações, retornamos um erro
        } catch(msg) {
            //Erro do lado do client então um erro 400, retornado a msg de erro da validação violada
            return res.status(400).send(msg)
        }

        //Vamos pegar a senha do usuario e passar para a função da criptografia
        user.password = encryptPassword(user.password)
        //Vamos deletar a confirmação da senha do usuário, pois  não vamos utiliza-la no banco
        delete user.confirmPassword

        //Vamos fazer um teste, se tiver um id
        if(user.id) {
            //Damos um update no banco de dados
            app.db('users')
                .update(user)
                .where({ id: user.id })
                .whereNull('deletedAt')
                //caso der tudo certo, retornamos um 204
                .then(_ => res.status(204).send())
                //caso der errado rerotnamos um erro 500 -> do lado do servidor
                .catch(err => res.status(500).send(err))
        } else {
            //caso não exista um id, seguimos com uma inserção
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }
    //Nosso get vai obter todos os nossos usuários cadastrados no banco
    const get = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            //Traga todos os usuários que essa coluna esteja nulo(quer dizer não excluida)
            .whereNull('deletedAt')
            //passamos os usuários que recebemos do select para um json
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }
    //Não tem nenhuma funcionalidade em nosso sistema, mas foi uma função criada para teste
    //Para poder validar no postman se poderiamos chamar um user por ID
    const getById = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({ id: req.params.id })
            .whereNull('deletedAt')
            .first()
            .then(user => res.json(user))
            .catch(err => res.status(500).send(err))
    }

    //O nosso remove não vai ser como outros,vamos utilizar o softdelet(remover de forma temporaria/virtual)
    const remove = async (req, res) => {
        try {
            //Vamos validar caso o usuário tenha algum artigo
            const articles = await app.db('articles')
                .where({ userId: req.params.id })
            //caso exista algum user vinculado ao um article irá aparecer um erro
            notExistsOrError(articles, 'Usuário possui artigos.')

            //se a quantidade de linhas que foi atualizado no banco de dados for 1,significa que ele conseguiu atualizar
            //caso retorne 0, significa que não encontrou o usuario por ID
            const rowsUpdated = await app.db('users')
                .update({deletedAt: new Date()})
                .where({ id: req.params.id })
            existsOrError(rowsUpdated, 'Usuário não foi encontrado.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }

    return { save, get, getById, remove }
}