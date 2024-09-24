<template>
    <div class="h-full border-2" ref="containRef"></div>
</template>

<script setup lang="ts">

const containRef = ref<HTMLElement>()

onMounted(() => {
    const instance = useThreeDecal()
    instance.mount(containRef.value!)
})
</script>