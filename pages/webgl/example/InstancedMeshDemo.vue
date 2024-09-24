<template>
    <div class="h-full border-2" ref="containRef">
    </div>
</template>

<script setup lang="ts">
import useInstancedMeshDemo from '~/composables/useInstancedMeshDemo';

const containRef = ref<HTMLElement>() 

let instance: ReturnType<typeof useInstancedMeshDemo>

onMounted(() => {
    instance = useInstancedMeshDemo()

    instance.init(containRef.value!)
})
</script>