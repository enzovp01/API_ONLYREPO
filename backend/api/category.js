module.exports = app => {
    //Importamos as funções de validação, que vem do validation.js
    const { existsOrError, notExistsOrError } = app.api.validation
    //Vamos criar a função save, seguindo o mesmo padrão do user(post e put)
    const save = (req, res) => {
        const category = {
            id: req.body.id,
            name: req.body.name,
            parentId: req.body.parentId
        }
        
        //se vier nos parametros da requisição o ID
        if(req.params.id) category.id = req.params.id

        try {
            //Apenas uma validação, se existe o nome, caso não vai gerar um erro
            existsOrError(category.name, 'Nome não informado')
        } catch(msg) {
            return res.status(400).send(msg)
        }
        
        //se category tiver um id setado, vai realizar um update
        if(category.id) {
            app.db('categories')
                .update(category)
                //seleciona a category por id, para pegar apenas ela
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            //caso não encontre id, vamos realizar uma inserção
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }
    //Category tem alto relacionamento, então precisamos de varias validações para remover uma categoria
    const remove = async (req, res) => {
        try {
            existsOrError(req.params.id, 'Código da Categoria não informado.')
            //Criamos consulta no banco com await, para validarmos se existe subcategory's
            const subcategory = await app.db('categories')
                .where({ parentId: req.params.id })
            notExistsOrError(subcategory, 'Categoria possui subcategorias.')

            const articles = await app.db('articles')
                .where({ categoryId: req.params.id })
            notExistsOrError(articles, 'Categoria possui artigos.')

            const rowsDeleted = await app.db('categories')
                .where({ id: req.params.id }).del()
            existsOrError(rowsDeleted, 'Categoria não foi encontrada.')

            res.status(204).send()
        } catch(msg) {
            res.status(400).send(msg)
        }
    }
    //Vou puxar a lista de categories, só que adiconar um atributo a mais
    const withPath = categories => {
        //Pegar a categoria pai e passar o parentId
        const getParent = (categories, parentId) => {
            //vou chamar a função filter que recebe uma callback, e nela vou receber cada uma das categories
            //e no final sera retornado apenas uma Categoria que bateu exatamente do pai que selecionamos
            const parent = categories.filter(parent => parent.id === parentId)
            //Se a array for maior que 0, vai retornar verdadeiro, caso ao contraio vai retornar nulo
            return parent.length ? parent[0] : null
        }
        //Vamos fazer um map, tranformar uma array de categorias em um outro array só que um atributo a mais, chamado path
        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)
            //Enquanto exister um parent,continue concatenando o path(caminho) completo, até ser nulo
            while(parent) {
                //concateno
                path = `${parent.name} > ${path}`
                //Busco o proximo path
                parent = getParent(categories, parent.parentId)
            }
            //Retorno o objeto category(o jeito que ele é, mais o atributo path)
            return { ...category, path }
        })
        //Ordenação das categories, defino que a é uma categoria e b é outra
        categoriesWithPath.sort((a, b) => {
            //menor
            if(a.path < b.path) return -1
            //maior
            if(a.path > b.path) return 1
            //os dois são iguais
            return 0
        })

        return categoriesWithPath
    }
    //Função get que vai retornar as categorias
    const get = (req, res) => {
        app.db('categories')
            //Passo o array de categorias com o atributo a mais(o withPath)
            .then(categories => res.json(withPath(categories)))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('categories')
            .where({ id: req.params.id })
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }
    //Função que é responsavel por transformar um array de categorias em uma estrutura de arvore
    //Então recebe um array de categories e recebe uma arvore
    const toTree = (categories, tree) => {
        //vou pegar todas categoies e vou retornar que não tem parentID setado
        //E assim montando um estrutura de arvore com os primeiras categories no topo da arvore  
        if(!tree) tree = categories.filter(c => !c.parentId)
        //Transformar a arvore, pegando os filhos com parentNode
        tree = tree.map(parentNode => {
            //Uma função é filho que vai receber com parametro um nó e fazer uma validação de igualdade
            //para filtrar filhos diretos do no, para chamar a arvore de forma recursiva
            const isChild = node => node.parentId == parentNode.id
            //Passo as categoires passando os filhos
            parentNode.children = toTree(categories, categories.filter(isChild))
            return parentNode
        })
        return tree
    }

    const getTree = (req, res) => {
        app.db('categories')
            //Vou recerber a lista de categories do banco e passo pra um json, pra retornar como respostas, convertando pra arvore
            .then(categories => res.json(toTree(categories)))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getTree }
}