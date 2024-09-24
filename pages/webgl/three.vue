<template>
    <main class="h-full">
        <h1>ThreeJS</h1>
        <div class="bg-red fixed top-10">666</div>
        <div ref="contain" class="w-3/5 h-2/5 border-2" ></div>
    </main>
</template>

<script setup lang="ts">

const contain = ref<HTMLDivElement>()

onMounted(() => {
    const { render } = useThreeDemo(contain.value!)
    render()
})

</script>