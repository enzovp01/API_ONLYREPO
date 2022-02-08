<template>
    <div class="welcome">
        <div class="welcome-info">
            <span class="welcome-title">{{ title }}</span>
            <span class="welcome-text">Uma plataforma de repositórios online para quem quer estudar sem sair de casa. 
                O site do serviço permite que você aprenda por meio de cursos (através de Links) e artigos gratuitos,
                ou ministre seus próprios cursos. Como a plataforma EAD é conveniente para publicação de conteúdo e não
                pode definir os padrões de publicações. Além de materiais audiovisuais, as publicações também podem disponibilizar livros e artigos,
                bem como oportunidades de acesso vitalício a cursos de outras plataformas. Nossa aplicação possui um aplicativo para telefones Android e iPhone (iOS),
                para que os usuários possam continuar aprendendo em seus smartphones ou tablets.</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Welcome',
    props: ['title', 'color', 'text'],
    computed: {
        style() {
            return "color: " + (this.color || "#000")
        }
    }
}
</script>

<style>
    .welcome {
        flex: 1;
        display: flex;
        border-radius: 8px;
        margin-right: 20px;
        margin-bottom: 20px;
        background-color: #FFF;
        padding: 20px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
    }

        .welcome-text {
        flex: 1;
        display: flex;
        background-color: #FFF;
    }

    .welcome-icon {
        display: flex;
        align-items: center;
    }

    .welcome-icon i {
        font-size: 5rem;
    }

    .welcome-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .welcome-title {
        font-size: 1.2rem;
    }

    .welcome-value {
        font-size: 3rem;
    }
</style>
