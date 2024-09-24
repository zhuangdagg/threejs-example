<template>
    <ul role="list" class="item:text-red-400 space-x-2 p-6">
        <NuxtLink to="/webgl">WebGL 学习</NuxtLink>
        <NuxtLink to="/webgl">WebXR 学习</NuxtLink>
        <NuxtLink to="/webgl/three">ThreeJS 学习</NuxtLink>
        <NuxtLink to="/webgl/example/camera">Camera 学习</NuxtLink>
        <NuxtLink to="/webgl/example/decal">喷涂学习</NuxtLink>
        <NuxtLink to="/webgl/example/gltf_loader">GLTF Loader</NuxtLink>
        <NuxtLink to="/webgl/example/gltf_loader_avif">GLTF AVIF</NuxtLink>
        <NuxtLink to="/webgl/example/InstancedMeshDemo">InstancedMeshDemo</NuxtLink>
        <NuxtLink to="/webgl/example/MorphFaceWebcam">MorphFaceWebcam</NuxtLink>
    </ul>
</template>

<style>
ul > a {
    color: rgb(150, 209, 82);
}
ul > a:hover {
    color: aquamarine;
    text-decoration: underline;
}
</style>