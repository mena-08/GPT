import { quat, mat4, vec3 } from 'gl-matrix';
class Sphere {
    constructor(gl, radius, segments, isInverted = true) {
        this.gl = gl;
        this.vertices = [];
        this.indices = [];
        this.texCoords = [];
        this.normals = [];
        this.buffers = {};
        this.radius = radius;
        this.segments = segments;
        this.isInverted = isInverted;
        this.orientation = quat.create();
        this.modelMatrix = mat4.create();
        this.position = vec3.create();
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

    initGeometry() {
        const phiStart = 0;
        const phiEnd = Math.PI * 2;
        const thetaStart = 0;
        const thetaEnd = Math.PI;

        const numVertices = (this.segments + 1) * (this.segments + 1);
        const numIndices = this.segments * this.segments * 6;

        const vertices = new Float32Array(numVertices * 3);
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
        this.texCoords = new Float32Array(this.texCoords);
        this.normals = new Float32Array(this.normals);
    }

    initBuffers() {
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
        const normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        // Store buffer references in the sphere object for later use
        this.buffers.vertexBuffer = vertexBuffer;
        this.buffers.indexBuffer = indexBuffer;
        this.buffers.textureCoordBuffer = textureCoordBuffer;
        this.buffers.normalBuffer = normalBuffer;
        this.buffers.vertexCount = this.indices.length;
    }


    getBuffers() {
        return this.buffers;
    }

    draw(shaderProgram, viewMatrix, projectionMatrix, texture) {
        const gl = this.gl;

        gl.useProgram(shaderProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, 'u_texture'), 0);

        //set matrix uniforms
        const uViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_viewMatrix');
        const uProjectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_projectionMatrix');
        const uNormalMatrixLocation = gl.getUniformLocation(shaderProgram, 'u_normalMatrix');

        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, viewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);

        gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);
        gl.uniformMatrix4fv(uNormalMatrixLocation, false, normalMatrix);

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

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
        const normalAttributeLocation = gl.getAttribLocation(shaderProgram, 'a_normal');
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalAttributeLocation);

        gl.drawElements(gl.TRIANGLES, this.buffers.vertexCount, gl.UNSIGNED_SHORT, 0);
    }

}
export { Sphere };
