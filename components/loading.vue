<template>
    <div>加载中...</div>
</template>

<script lang="ts">
export default {
    name: 'Loading',
    data() {
        return {
            loading: false
        }
    },
    methods: {
        start() {
            console.log('start loading')
        },
        finish() {
            console.log('finish loading')
        }
    }
}
</script>