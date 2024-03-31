import { mat4, glMatrix } from 'gl-matrix';

class Camera {
    constructor() {
        this.position = [0, 0, 0];
        this.target = [0, 0, 0];
        this.up = [0, 1, 0];
        this.fov = 90;
        this.aspectRatio = 1;
        this.near = 0.1;
        this.far = 1000;
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }

    getViewMatrix() {
        return this.viewMatrix || null;
    }

    getProjectionMatrix() {
        return this.projectionMatrix || null;
    }

    updateProjectionMatrix() {
        mat4.perspective(
            this.projectionMatrix,
            glMatrix.toRadian(this.fov),
            this.aspectRatio,
            this.near,
            this.far
        );
    }

    setViewport(width, height) {
        this.aspectRatio = width / height;
        this.updateProjectionMatrix();
    }

    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
        this.updateViewMatrix();
    }

    setPositionX(x) {
        this.position[0] = x;
        this.updateViewMatrix();
    }

    setPositionY(y) {
        this.position[1] = y;
        this.updateViewMatrix();
    }

    setPositionZ(z) {
        this.position[2] = z;
        this.updateViewMatrix();
    }

    setTarget(x, y, z) {
        this.target[0] = x;
        this.target[1] = y;
        this.target[2] = z;
        this.updateViewMatrix();
    }

    setUp(x, y, z) {
        this.up[0] = x;
        this.up[1] = y;
        this.up[2] = z;
        this.updateViewMatrix();
    }
}

const camera = new Camera();
export default camera;