<template>
    <div class="h-full border-2" ref="containRef">
        <select class="fixed top-6 left-6" @change="onSelect">
            <option v-for="item in options" :value="item.value">{{ item.label }}</option>
        </select>
    </div>
</template>

<script setup lang="ts">
import useGLTFLoader from '~/composables/useGLTFLoader';

const containRef = ref<HTMLElement>()

let instance: ReturnType<typeof useGLTFLoader>;

const options = [
{ label: 'moonless_golf_1k', value: 'moonless_golf_1k'},
{ label: 'blouberg_sunrise_2_1k', value: 'blouberg_sunrise_2_1k'},
{ label: 'pedestrian_overpass_1k', value: 'pedestrian_overpass_1k'},
{ label: 'quarry_01_1k', value: 'quarry_01_1k'},
{ label: 'san_giuseppe_bridge_2k', value: 'san_giuseppe_bridge_2k'},
{ label: 'royal_esplanade_1k', value: 'royal_esplanade_1k'},
{ label: 'spot1Lux', value: 'spot1Lux'},
{ label: 'spruit_sunrise_1k', value: 'spruit_sunrise_1k'},
{ label: 'venice_sunset_1k', value: 'venice_sunset_1k'},
]

const onSelect = ({ target }: Event) => {
    const { value } = target as any
    if(value)
        instance.selectBg(value)
}

onMounted(() => {
    instance = useGLTFLoader()

    instance.init(containRef.value!)
})
</script>