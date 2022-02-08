
// Para exportar nossas funções para app
module.exports = app => {
    //Nessas funções vou mandar uma mensagem ao usuario caso exista um erro.
    //Essa funçãeo testa se o valor existe ou não, caso não, gera uma mensagem de erro)
    function existsOrError(value, msg) {
        //O primeiro teste é pra saber se o valor não está setado
        if(!value) throw msg
        //O segundo teste é pra saber se o valor é uma Array ou uma Array for vazia ou 0 = significa que não existe
        if(Array.isArray(value) && value.length === 0) throw msg
        // Terceira vou testar se a string está vazia ou em branco
        if(typeof value === 'string' && !value.trim()) throw msg
    }
    
    // Aqui podemos criar mais regras de validação no futuro
    //Faço a validação de cima só que ao contrario 
    function notExistsOrError(value, msg) {
        //se não der erro ele simplesmente return
        try {
            existsOrError(value, msg)
        } catch(msg) {
            return
        }
        throw msg
    }
    
    //Essa ultima função é para testar se dois valores são iguais ou não
    function equalsOrError(valueA, valueB, msg) {
        if(valueA !== valueB) throw msg
    }
    //Retorna as tres funções no module exports
    return { existsOrError, notExistsOrError, equalsOrError }
}