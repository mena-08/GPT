import * as THREE from 'three';
export class EarthSphereClass {
    constructor(textureURL, bumpMapURL, specularMapURL) {
        this.textureURL = textureURL;
        this.bumpMapURL = bumpMapURL;
        this.specularMapURL = specularMapURL;
        this.textureLoader = new THREE.TextureLoader();
        this.sphere = this.createSphere();
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(5, 64, 64);

        const texture = this.textureLoader.load(this.textureURL, (tex) => {
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
        });

        const bump_map = this.textureLoader.load(this.bumpMapURL, (tex) => {
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
        });

        const specular_map = this.textureLoader.load(this.specularMapURL, (tex) => {
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipMapLinearFilter;
        });

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpMap: bump_map,
            bumpScale: 0.05,
            specularMap: specular_map,
            specular: new THREE.Color('white')
        });

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