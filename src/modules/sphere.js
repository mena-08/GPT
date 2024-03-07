class Sphere {
    constructor(radius, segments, isInverted = true) {
        this.radius = radius;
        this.segments = segments;
        this.vertices = [];
        this.indices = [];
        this.texCoords = [];
        this.normals = [];
        this.isInverted = isInverted;
        this.generateGeometry();
    }

    generateGeometry() {
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

                    if(this.isInverted){
                        indices[index++] = a;
                        indices[index++] = b;
                        indices[index++] = a + 1;

                        indices[index++] = b;
                        indices[index++] = b + 1;
                        indices[index++] = a + 1;
                    }else{
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
}
export { Sphere };
