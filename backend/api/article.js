const queries = require('./queries')

module.exports = app => {
    //Vamos chamar com Destructuring as funções de validações que vamos utilizar nesse arquivo
    const { existsOrError } = app.api.validation

    //Mesma funcionalidade dos save de user e category(ele vai tanto salvar como alterar)
    //recebe requisição e resposta
    const save = (req, res) => {
        //pegar o body da requisição
        const article = { ...req.body }
        //se a requisição tiver o parametro de id, recebe que parametros id
        if(req.params.id) article.id = req.params.id

        //Try catch de validação
        try {
            existsOrError(article.name, 'Nome não informado')
            existsOrError(article.description, 'Descrição não informada')
            existsOrError(article.categoryId, 'Categoria não informada')
            existsOrError(article.userId, 'Autor não informado')
            existsOrError(article.content, 'Conteúdo não informado')
        } catch(msg) {
            //caso der erro gera o msg
            res.status(400).send(msg)
        }
        // se receber o id ela vai dar um update
        if(article.id) {
            app.db('articles')
                .update(article)
                .where({ id: article.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            //caso não tenha id, irá realizar uma inserção
            app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const remove = async (req, res) => {
        try {
            //vou verificar se o resultado da exclusão gerou uma quantidade de linhas excluidas
            const rowsDeleted = await app.db('articles')
                //seria apenas uma consulta, mas como temos o .del(),ele irá realizar a exclusão do id solicitado
                .where({ id: req.params.id }).del()
            
            try {
                //caso não encontre o id requisitado
                existsOrError(rowsDeleted, 'Artigo não foi encontrado.')
            } catch(msg) {
                return res.status(400).send(msg)    
            }
            //caso der tudo certo mandamos um 204
            res.status(204).send()
        } catch(msg) {
            //caso der erro mandamos um erro 500(motivo de estrutura do lado do servidor)
            res.status(500).send(msg)
        }
    }

    //Criamos uma consulta paginada
    const limit = 10 // usado para paginação
    const get = async (req, res) => {
        //requisição espera uma query da pagina caso não esteja padrão ele utiliza da 1 como padrão
        const page = req.query.page || 1
        //Pegar resultado e atraves do count vamos saber quantos registros tem na base se dados
        const result = await app.db('articles').count('id').first()
        //Pegar resultado e armazenar em uma constante, 
        const count = parseInt(result.count)

        app.db('articles')
            //nesse select não trago o conteudo, pois ele pode ser muito grande, não faz sentido nessa consulta
            .select('id', 'name', 'description')
            //Vou trazer o limite de *10 que setamos acima, calcular o offset
            //Então se estiver na pagina 2, ele vai fazer 2 * limit(10) - (10) = resultado vai ser 10 na pag 2, calcullando o deslocamento
            .limit(limit).offset(page * limit - limit)
            //Vai retornar apenas um atributo chamado data e dentro dele vamos ter artigos, quantidade e limite
            //Pra montar o paginador no frontend
            .then(articles => res.json({ data: articles, count, limit }))
            .catch(err => res.status(500).send(err))
    }
    //Pegar um article especifico por ID
    const getById = (req, res) => {
        app.db('articles')
            .where({ id: req.params.id })
            .first()
            .then(article => {
                //O arquivo vem em um formato binario, então precisamos converter o binario para uma string antes de mostrar para usuario
                article.content = article.content.toString()
                return res.json(article)
            })
            .catch(err => res.status(500).send(err))
    }
    //Função que pega os artigos por ID, através de uma consulta
    const getByCategory = async (req, res) => {
        const categoryId = req.params.id
        const page = req.query.page || 1
        //Vamos passar um query crua em mysql dentro do nosso arquivo queries como parametro, junto com id
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId)
        //Criamos um map, um array de id's categorias pai com as categorias filhas
        const ids = categories[0].map(c => c.id)

        //Vamos realziar uma consulta,só que diferente dessa vez, tanto em articles como users
        app.db({a: 'articles', u: 'users'})
            .select('a.id', 'a.name', 'a.description', 'a.imageUrl', { author: 'u.name' })
            .limit(limit).offset(page * limit - limit)
            //Encontrar de fato o usuario que é autor do artigo
            .whereRaw('?? = ??', ['u.id', 'a.userId'])
            //WhereIN com categorias e seus ids pertecentes
            .whereIn('categoryId', ids)
            //Ordenação do tipo decrescente maior id pro menor id
            .orderBy('a.id', 'desc')
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getByCategory }
}