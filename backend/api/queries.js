module.exports = {
    //Criamos uma tabela temporaria dentro da nossa consulta chamada de subcategories com unico atributo 
    //que vai me retornar o id da propia categoria que eu passei por parametro no '?'
    //e fazendo uma união com a consulta que vai ser responsavel de forma recursiva
    //selecionando o id de subcategories fazendo um join com tabela de categories
    //no qual o parentId vai ser subcategories.id
    //Ou seja fazendo a união das categorias pais e filhas
    categoryWithChildren: `
        WITH RECURSIVE subcategories (id) AS (
            SELECT id FROM categories WHERE id = ?
            UNION ALL
            SELECT c.id FROM subcategories, categories c
                WHERE "parentId" = subcategories.id
        )
        SELECT id FROM subcategories
    `
}