import { shaderProgramInit } from "./load-shaders";
import camera from "./camera";

class Scene {
    constructor(gl) {
        this.gl = gl;
        this.objects = [];
        this.shaders = {};
    }

    addShader(name, vertexSrc, fragmentSrc) {
        const shader = shaderProgramInit(this.gl,vertexSrc, fragmentSrc);
        this.shaders[name] = shader;
    }

    addObject(object) {
        this.objects.push(object);
    }

    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    // shaderProgramInit(vertexSrc, fragmentSrc) {
    //     return shaderProgramInit(this.gl, vertexSrc, fragmentSrc);
    // }

    draw() {
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();
        
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.objects.forEach(obj => {
            obj.draw(this.shaders[obj.shaderName], viewMatrix, projectionMatrix);
        });
    }
}

export default Scene;