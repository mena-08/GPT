class Camera{
    constructor(fov=75, aspect=window.innerWidth / window.innerHeight, near=0.001, far=1000){
        this.Camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        // for the camera transitions for now
        this.orbit_state = null
        this.transition_target = null;
        this.transition_speed = 0.02;
    }

    getPosition(){
        return new THREE.Vector3(this.position.x, this.position.y, this.position.z);
    }
    
    setPositionX(value){
        this.Camera.position.x = value;
    }
    
    setPositionY(value){
        this.Camera.position.y = value;
    }
    
    setPositionZ(value){
        this.Camera.position.z = value;
    }

    setPosition(value){
        this.Camera.position.x = value[0];
        this.Camera.position.y = value[1];
        this.Camera.position.z = value[2];
    }

    //transition for the camera
    //target to vector3 
    makeTransition(target){
        this.transition_target = new THREE.Vector3(target[0], target[1], target[2]);
        this.Camera.lookAt(new THREE.Vector3(earth.position.x,earth.position.y, earth.position.z));
    }

    updateTransition(){
        if (this.transition_target) {
        const distanceToTarget = this.Camera.position.distanceTo(this.transition_target);
        if (distanceToTarget > 6) {
            this.Camera.position.lerp(this.transition_target, this.transition_speed);
        } else {
            this.transition_target = null;
        }

        // Continuously looking at our object
        this.Camera.lookAt(earth.position);
        this.Camera.updateProjectionMatrix();

        }
        if (this.orbit_state) {
            const orbit_speed = 0.01; 
            //convert current position to spherical coordinates
            let spherical = new THREE.Spherical().setFromVector3(this.Camera.position.sub(earth.position));
            switch (this.orbit_state) {
                case 'left':
                    spherical.theta -= orbit_speed;
                    break;
                case 'right':
                    spherical.theta += orbit_speed;
                    break;
                case 'up':
                    spherical.phi -= orbit_speed;
                    break;
                case 'down':
                    spherical.phi += orbit_speed;
                    break;
            }

            //clamp phi to avoid flip at poles
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

            //convert back to Cartesian coordinates
            this.Camera.position.setFromSpherical(spherical).add(earth.position);
            this.Camera.lookAt(earth.position);
        }
    }

    startOrbit(direction) {
        this.orbit_state = direction;
    }

    stopOrbit() {
        this.orbit_state = null;
    }

}

//Camera handlers
//--------------------
function handleZoom(event) {
    const zoom_speed = 0.5;
    const zoom_direction = event.deltaY > 0 ? 1 : -1; 

    camera2.Camera.fov += zoom_direction * zoom_speed;
    camera2.Camera.fov = Math.max(0, Math.min(180, camera2.Camera.fov));
    camera2.Camera.updateProjectionMatrix();
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

//arcball
function handleRotation(camera, delta_move) {
    const rotation_speed = 0.1;
    //calculate angular movement
    const delta_X = toRadians(delta_move.y * rotation_speed);
    const delta_Y = toRadians(delta_move.x * rotation_speed);

    //current camera position
    const current_position = new THREE.Vector3().copy(camera2.Camera.position);

    //rotation around Y axis 
    const horizontal_axis = new THREE.Vector3(0, -1, 0);
    current_position.applyAxisAngle(horizontal_axis, delta_Y);

    //rotation around X axis
    const vertical_axis = new THREE.Vector3(-1, 0, 0);
    current_position.applyAxisAngle(vertical_axis, delta_X);

    camera.Camera.position.copy(current_position);

    //keep looking at the earth
    camera.Camera.lookAt(earth.position);
}
//--------------------


function cameraZoom(camera, direction) {
    //this should be uptaded as well, better approach fs\ 
    if(direction === "out"){
        var new_targe = camera.Camera.position;
        new_targe.z += 2;
        camera.makeTransition(new_targe);
    }
    if(direction === "in"){
        var new_targe = camera.Camera.position;
        new_targe.z -= 2;
        camera.makeTransition(new_targe);
    }
}


function cameraStop(camera) {
    camera.stopOrbit();
}

function cameraRotate(camera, direction){
    camera.startOrbit(direction);
}