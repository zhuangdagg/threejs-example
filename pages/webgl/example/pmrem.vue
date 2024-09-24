<template>
    <div ref="containRef" class="h-full">
        <ul>
            <li>webgl pmrem</li>
        </ul>
    </div>
</template>

<script setup lang="ts">
const instance = useThreeCamera()
const containRef = ref<HTMLElement>()
onMounted(() => {
    instance.mount(containRef.value!).addControls()
})

</script>