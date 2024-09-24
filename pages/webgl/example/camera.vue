<template>
    <div ref="containRef" class="h-full"></div>
</template>

<script setup lang="ts">

const containRef = ref<HTMLElement>()

onMounted(() => {
    const { mount } = useThreeCamera()

    mount(containRef.value!).addControls()
})
</script>