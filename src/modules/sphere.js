import { quat, mat4, vec3 } from 'gl-matrix';
import { eventEmitter } from './event-emitter';
import { initialTexture } from './render-webgl';

//sphere class
// TEXTURE0 -> main texture
// TEXTURE1 -> bump map
// TEXTURE2 -> specular map
// TEXTURE3 -> overlay texture

class Sphere {
    constructor(gl, radius, segments, isInverted = true, agent=false) {
        this.gl = gl;
        this.vertices = [];
        this.indices = [];
        this.texCoords = [];
        this.normals = [];
        this.buffers = {};
        this.texture = undefined;
        this.overlayTexture = undefined;
        this.bumpTexture = undefined;
        this.specularTexture = undefined;
        this.radius = radius;
        this.segments = segments;
        this.isInverted = isInverted;
        this.orientation = quat.create();
        this.modelMatrix = mat4.create();
        this.position = vec3.create();
        this.rotationAxis = vec3.fromValues(0,-1,0);
        this.rotationSpeed = 0;
        this.isStopped = false;
        this.agent = agent;
        this.shaderName = null;

        this.initGeometry();
        this.initBuffers();
        eventEmitter.on('textureChange', this.changeMainTexture.bind(this));
        eventEmitter.on('textureOverlayChange', this.changeOverlayTexture.bind(this));
        eventEmitter.on('loadSpecialTextures', this.loadSpecialTextures.bind(this));
    }

    //speak capabilities
    //-------------------    
    rotate(orientation) {
        this.orientation = orientation;
    }

    scale(factor){
        this.radius = this.radius * factor;
        this.initGeometry();
        this.initBuffers();
    }

    stopRotation(){
        this.isStopped = True;
    }

    rotateRight(){
        if(this.isStopped) return;
        this.rotationAxis = vec3.fromValues(0,1,0);
        this.rotationSpeed = 0.003;
        const rotateCallback = () => {
            const rotationQuat = quat.create();
            quat.setAxisAngle(rotationQuat, this.rotationAxis, this.rotationSpeed);
            quat.multiply(this.orientation, this.orientation, rotationQuat);
            this.updateModelMatrix();
            requestAnimationFrame(rotateCallback);
        };
        rotateCallback();
    }

    rotateLeft(){
        if(this.isStopped) return;
        this.rotationAxis = vec3.fromValues(0,-1,0);
        this.rotationSpeed = 0.003;
        const rotateCallback = () => {
            const rotationQuat = quat.create();
            quat.setAxisAngle(rotationQuat, this.rotationAxis, this.rotationSpeed);
            quat.multiply(this.orientation, this.orientation, rotationQuat);
            this.updateModelMatrix();
            requestAnimationFrame(rotateCallback);
        };
        rotateCallback();
    }

    translate(x, y, z) {
        this.position = [x, y, z];
        this.updateModelMatrix();
    }

    resetOrientation() {
        quat.identity(this.orientation);
        mat4.identity(this.modelMatrix);
    }
    //-------------------
    //speak capabilities
    getRotation() {
        return this.orientation;
    }

    getPosition() {
        return this.position;
    }

    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        let rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.orientation);
        mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
    }

    getModelMatrix() {
        return this.modelMatrix;
    }

    getGLContext(){
        return this.gl;
    }

    changeMainTexture(texture_loaded, shaderProgram) {
        const gl = this.gl;
        this.texture = texture_loaded;
        gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_texture'), 0);
    }

    changeOverlayTexture(texture_loaded, shaderProgram){
        const gl = this.gl;
        this.overlayTexture = texture_loaded;
        gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.overlayTexture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_overlayTexture'), 3);
    }

    enableOverlay(value, shaderProgram){
        const gl = this.gl;
        gl.useProgram(shaderProgram);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_enableOverlay'), value);
    }

    setShaderName(shaderName){
        this.shaderName = shaderName;
    }

    loadSpecialTextures(bumpTextureLoaded, specularTextureLoaded, shaderProgram){
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bumpTextureLoaded);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_bumpMap'), 1);
        const bumpMapScale = 0.048;
        gl.uniform1f(gl.getUniformLocation(shaderProgram, 'u_displacementStrength'), bumpMapScale);

        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_specularMap'), 2);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, specularTextureLoaded);
    }

    initGeometry() {
        const phiStart = 0;
        const phiEnd = Math.PI * 2;
        const thetaStart = 0;
        const thetaEnd = Math.PI;

        const numVertices = (this.segments + 1) * (this.segments + 1);
        const numIndices = this.segments * this.segments * 10;

        const vertices = new Float32Array(numVertices * 10);
        const indices = new Uint16Array(numIndices);

        let vertexIndex = 0;
        let index = 0;

        for (let i = 0; i <= this.segments; i++) {
            const theta = thetaStart + (i / this.segments) * (thetaEnd - thetaStart);

            for (let j = 0; j <= this.segments; j++) {
                const phi = phiStart + (j / this.segments) * (phiEnd - phiStart);

                const x = this.radius * Math.sin(theta) * Math.cos(phi);
                const y = this.radius * Math.cos(theta);
                const z = this.radius * Math.sin(theta) * Math.sin(phi);

                vertices[vertexIndex++] = x;
                vertices[vertexIndex++] = y;
                vertices[vertexIndex++] = z;

                //texture coordinates
                let u = j / this.segments;
                let v = i / this.segments;
                u = 1.0 - u;

                this.texCoords.push(u, v);

                //normals
                const length = Math.sqrt(x * x + y * y + z * z);
                const normalFactor = this.isInverted ? -1 : 1;
                this.normals.push(x / length * normalFactor, y / length * normalFactor, z / length * normalFactor);

                if (i < this.segments && j < this.segments) {
                    const a = i * (this.segments + 1) + j;
                    const b = a + this.segments + 1;

                    if (this.isInverted) {
                        indices[index++] = a;
                        indices[index++] = b;
                        indices[index++] = a + 1;

                        indices[index++] = b;
                        indices[index++] = b + 1;
                        indices[index++] = a + 1;
                    } else {
                        indices[index++] = a;
                        indices[index++] = a + 1;
                        indices[index++] = b;

                        indices[index++] = b;
                        indices[index++] = a + 1;
                        indices[index++] = b + 1;
                    }
                }
            }
        }

        this.vertices = vertices;
        this.indices = indices;
    }

    initBuffers(agent=false) {
        const gl = this.gl;

        // Vertex Buffer
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        // Index Buffer
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        // Texture Coordinate Buffer
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);

        // Normals Buffer
        if(!agent){
            const normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
            this.buffers.normalBuffer = normalBuffer;
            this.buffers.textureCoordBuffer = textureCoordBuffer;
        }

        this.buffers.vertexBuffer = vertexBuffer;
        this.buffers.indexBuffer = indexBuffer;
        
        this.buffers.vertexCount = this.indices.length;
    }

    draw(shaderProgram, viewMatrix, projectionMatrix, initialTexture=null) {
        const gl = this.gl;
        if(initialTexture){
            gl.useProgram(shaderProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, initialTexture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_texture'), 0);   
        }else {
            gl.useProgram(shaderProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_texture'), 0);
        }
        

        //set matrix uniforms
        const uViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_viewMatrix');
        const uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');
        const uNormalMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_normalMatrix');

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, viewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);
        if(!this.agent){
            gl.uniformMatrix4fv(uNormalMatrixLocation, false, normalMatrix);
        }

        //set model matrix
        const modelMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_modelMatrix');
        gl.uniformMatrix4fv(modelMatrixLocation, false, this.modelMatrix);


        //draw the sphere
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_position');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoordBuffer);
        const textureCoordAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_texCoord');
        gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(textureCoordAttributeLocation);


        if(!this.agent){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
            const normalAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_normal');
            gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalAttributeLocation);
        }

        gl.drawElements(gl.TRIANGLES, this.buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

    destroy() {
        const gl = this.gl;
    
        if (this.buffers.vertexBuffer) gl.deleteBuffer(this.buffers.vertexBuffer);
        if (this.buffers.indexBuffer) gl.deleteBuffer(this.buffers.indexBuffer);
        if (this.buffers.textureCoordBuffer) gl.deleteBuffer(this.buffers.textureCoordBuffer);
        if (this.buffers.normalBuffer) gl.deleteBuffer(this.buffers.normalBuffer);
    
        if (this.texture) gl.deleteTexture(this.texture);
        if (this.shaderProgram) {
            gl.deleteProgram(this.shaderProgram);
        }
    
        this.buffers = {};
        this.texture = null;
        this.shaderProgram = null;
    }
    
}
export { Sphere };
