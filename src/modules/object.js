import * as THREE from 'three';
export class SphereClass {
    constructor(textureURL) {
        this.textureURL = textureURL;
        this.textureLoader = new THREE.TextureLoader();
        this.sphere = this.createSphere();
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const material = new THREE.MeshBasicMaterial({ map: this.textureLoader.load(this.textureURL) });
        return new THREE.Mesh(geometry, material);
    }

    updateTexture(url) {
        const texture = this.textureLoader.load(url);
        this.sphere.material.map = texture;
        this.sphere.material.needsUpdate = true;
    }

    getSphere() {
        return this.sphere;
    }
}
