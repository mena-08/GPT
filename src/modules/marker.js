import { quat, mat4, vec3 } from 'gl-matrix';

class Marker {
    constructor(gl, height = 1, baseRadius = 0.5, segments = 32) {
        this.gl = gl;
        this.height = height;
        this.baseRadius = baseRadius;
        this.segments = segments;
        this.modelMatrix = mat4.create();
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.buffers = {};
        this.position = vec3.create();
        this.orientation = quat.create();
        this.initGeometry();
        this.initBuffers();
    }

    rotate(orientation) {
        this.orientation = orientation;
    }

    translate(x, y, z) {
        this.position = [x, y, z];
        this.updateModelMatrix();
    }

    getRotation() {
        return this.orientation;
    }

    getPosition() {
        return this.position;
    }

    resetOrientation() {
        quat.identity(this.orientation);
        mat4.identity(this.modelMatrix);
    }

    
    getModelMatrix() {
        return this.modelMatrix;
    }

    getGLContext(){
        return this.gl;
    }

    setPositionOnSphere(position, sphere){
        //direction vector
        let direction = vec3.create();
        vec3.subtract(direction, sphere.getPosition(), position);
        vec3.normalize(direction, direction);

        //marker position relative to the spheres surface
        const distanceFromSurface = -0.1;
        let offsetPosition = vec3.create();
        vec3.scale(offsetPosition, direction, distanceFromSurface);
        vec3.add(offsetPosition, position, offsetPosition);

        //apply the sphere's current rotation to the direction vector
        let transformedDirection = vec3.create();
        vec3.transformQuat(transformedDirection, direction, sphere.getRotation());

        //apply the sphere's model matrix to the calculated offset position
        let worldPosition = vec3.create();
        vec3.transformMat4(worldPosition, offsetPosition, sphere.getModelMatrix());

        //translate the marker to the calculated world position
        this.translate(worldPosition[0], worldPosition[1], worldPosition[2]);

        //orient the marker towards the sphere center
        let upDirection = vec3.fromValues(0, 1, 0);
        let rotationQuat = quat.create();
        quat.rotationTo(rotationQuat, upDirection, transformedDirection);
        this.rotate(rotationQuat);

        //update the marker model matrix to apply the translation and rotation
        this.updateModelMatrix();
    }

    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        let rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.orientation);
        mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
    }



    initGeometry() {
        this.vertices.push(0, this.height, 0);
        this.normals.push(0, 1, 0);

        //circle vertices and normals
        for (let i = 0; i <= this.segments; i++) {
            const angle = (i / this.segments) * 2 * Math.PI;
            const x = Math.cos(angle) * this.baseRadius;
            const z = Math.sin(angle) * this.baseRadius;
            const y = 0;

            this.vertices.push(x, y, z);
            const normal = vec3.fromValues(x, 0, z);
            vec3.normalize(normal, normal);
            this.normals.push(...normal);
        }

        //base
        for (let i = 1; i <= this.segments; i++) {
            this.indices.push(0, i, i + 1);
        }

        this.vertices = new Float32Array(this.vertices);
        this.indices = new Uint16Array(this.indices);
        this.normals = new Float32Array(this.normals);
    }

    initBuffers() {
        const gl = this.gl;
        this.buffers.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.buffers.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.buffers.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        this.buffers.vertexCount = this.indices.length;
    }

    draw(shaderProgram, viewMatrix, projectionMatrix, modelMatrix = this.modelMatrix) {
        const gl = this.gl;
        gl.useProgram(shaderProgram);

        //uniforms
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'u_viewMatrix'), false, viewMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'), false, projectionMatrix);
        gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, 'u_modelMatrix'), false, modelMatrix);

        //bind and set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
        gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, 'a_position'), 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, 'a_position'));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
        gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, 'a_normal'), 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, 'a_normal'));

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
    
    destroy() {
        const gl = this.gl;

        if (this.buffers.vertexBuffer) gl.deleteBuffer(this.buffers.vertexBuffer);
        if (this.buffers.indexBuffer) gl.deleteBuffer(this.buffers.indexBuffer);
        if (this.buffers.textureCoordBuffer) gl.deleteBuffer(this.buffers.textureCoordBuffer);
        if (this.buffers.normalBuffer) gl.deleteBuffer(this.buffers.normalBuffer);

        this.buffers = {};
        this.texture = null;
        this.shaderProgram = null;
    }
    
}

export { Marker };