<template>
    <div class="ideia">
        <div class="ideia-info">
            <span class="ideia-title">{{ title }}</span>
            <span class="ideia-text">Estudantes da universidade Pontifícia Universidade Católica de Campinas, com objetivo no aprendizado,
                 o sistema foi desenvolvido por: Diego Barbosa, Enzo Vaz Pinheiro, Kaio Corredor e Samir Ahamad.</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Ideia',
    props: ['title', 'color', 'text'],
    computed: {
        style() {
            return "color: " + (this.color || "#000")
        }
    }
}
</script>

<style>
    .ideia {
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

        .ideia-text {
        flex: 1;
        display: flex;
        background-color: #FFF;
    }

    .ideia-icon {
        display: flex;
        align-items: center;
    }

    .ideia-icon i {
        font-size: 5rem;
    }

    .ideia-info {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .ideia-title {
        font-size: 1.2rem;
    }

    .ideia-value {
        font-size: 3rem;
    }
</style>
