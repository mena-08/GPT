class SphereObject {
    constructor(radius = 5, widthSegments = 128, heightSegments = 128, texturePath = '10KEARTH.jpg', normalTexturePath = '8k_earth_normal_map.png') {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const texture = new THREE.TextureLoader().load(texturePath);
        const normal_map = new THREE.TextureLoader().load(normalTexturePath);
        const material = new THREE.MeshStandardMaterial({ map: texture, normalMap:normal_map });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    setTexture(texturePath) {
        const texture = new THREE.TextureLoader().load(texturePath);
        this.mesh.material.map = texture;
        //uodate the material 
        this.mesh.material.needsUpdate = true; 
    }

    getMesh() {
        return this.mesh;
    }

    setObjectPosition(position){
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
    }

    getPosition(){
        return [this.position.x, this.position.y, this.position.z];
    }
    
    getModelViewMatrix(){
        return this.modelViewMatrix();
    }
    
    translateY(value){
        this.translateY(value);
    }
    
    translateX(value){
        this.translateX(value);
    }
    
    translateZ(value){
        this.translateZ(value);
    }
    
    rotateY(value){
        this.rotateY(value);
    }
    
    rotateX(value){
        this.rotateX(value);
    }
    
    rotateZ(value){
        this.rotateZ(value);
    }
    //world to local
    worldToLocal(){
        return this.worldToLocal();
    }

    clone(){
        return this.clone();
    }
}

class CubeObject {
    constructor(placing, dimensions = [0.2, 0.2, 0.2], color = 0xff0000) {
        const geometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
        geometry.translate(placing.x, placing.y, placing.z);
        const material = new THREE.MeshBasicMaterial({ color });
        this.mesh = new THREE.Mesh(geometry, material);
        
    }
    
    getMesh() {
        return this.mesh;
    }

    setObjectPosition(position){
        this.position.x = position[0];
        this.position.y = position[1];
        this.position.z = position[2];
    }

    getPosition(){
        return [this.position.x, this.position.y, this.position.z];
    }
    
    translateY(value){
        this.translateY(value);
    }
    
    translateX(value){
        this.translateX(value);
    }
    
    translateZ(value){
        this.translateZ(value);
    }
}

function latLongToCartesian(lat, lon, radius) {
    let latRad = THREE.MathUtils.degToRad(90 - lat);
    let lonRad = THREE.MathUtils.degToRad(lon);

    let x = radius * Math.sin(latRad) * Math.cos(lonRad);
    let y = radius * Math.cos(latRad);
    let z = radius * Math.sin(latRad) * Math.sin(lonRad);

    return { x, y, z };
}
