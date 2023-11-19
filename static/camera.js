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
        
            //interpolate position - https://threejs.org/docs/?q=posit#api/en/math/Vector3
            this.Camera.position.lerp(this.transition_target, this.transition_speed);
    
            //continuosly looking at our object
            //TODO: transfer any new object we want to watch
            this.Camera.lookAt(earth.position);
    
             //if we're close enough we should stop
            if (this.Camera.position.distanceTo(this.transition_target) < 1) {
                this.Camera.position.set(this.transition_target.x, this.transition_target.y, this.transition_target.z);
                this.transition_target = null;
            }
            this.Camera.updateProjectionMatrix();
        }
        if (this.orbit_state) {
            const orbit_speed = 0.1;
            switch (this.orbit_state) {
                case 'left':
                    this.Camera.position.x -= orbit_speed;
                    break;
                case 'right':
                    this.Camera.position.x += orbit_speed;
                    break;
                case 'up':
                    this.Camera.position.y += orbit_speed;
                    break;
                case 'down':
                    this.Camera.position.y -= orbit_speed;
                    break;
            }
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
    if(direction === "far"){
        var new_targe = camera.getPosition();
        new_targe.z += 5;
        camera.makeTransition(new_targe);
    }
    if(direction === "in"){
        var new_targe = camera.getPosition();
        new_targe.z += 5;
        camera.makeTransition(new_targe);
    }
}

function cameraRotate(camera, direction){
    camera.startOrbit(direction);
}