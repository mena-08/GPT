import camera from "./camera";
import { mat4 } from "gl-matrix";
import { Sphere } from "./sphere";
import { loadImage, loadTexture } from "./textures";
import { shaderProgramInit } from "./loadShaders";
import earthTexturePath from '../images/unused/2kearth.jpg';
import highQualityEarthTexturePath from '../images/unused/10kBaseMap.jpg';
import starfieldTexturePath from '../images/unused/starfield4k.png';
import { updateCameraPosition, updateCameraOrbit } from "./controllers";
import vertexShaderSource from '../shaders/earthVertexShader.glsl';
import fragmentShaderSource from '../shaders/earthFragmentShader.glsl';
import moonTexturePath from '../images/unused/moon.jpg';


//global variables for the spheres
let gl = null;
let earthSphere;
let nextTexture = null;
let earthShaderProgram, skyboxProgram;
let earthTexture, starfieldTexture = null;
let moonSphere, moonTexture;

function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    setup(canvas);
}

async function setup(canvas) {
    gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true});
    if (!gl) {
        alert('WebGL is not supported');
        return;
    }

    initTextures(gl);
    earthShaderProgram = shaderProgramInit(gl, vertexShaderSource, fragmentShaderSource);
    //skyboxProgram = shaderProgramInit(gl, skyboxVertexShaderSource, skyboxFragmentShaderSource);

    //setup the sphere rendering - basically its shaders and buffers
    earthSphere = new Sphere(gl,1, 120, false);
    moonSphere = new Sphere(gl, 0.27, 120, false);
    moonSphere.translate(1.5, 0, 0);

    camera.position = [0, 0, 3];
    let lastTime = 0;

    function animate(now) {
        
        if (!lastTime) lastTime = now;
        const deltaTime = (now - lastTime) / 1000;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        updateCameraPosition(deltaTime);
        updateCameraOrbit(deltaTime);
        camera.updateViewMatrix();

        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();
        earthSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, earthTexture);
        moonSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, moonTexture);
        lastTime = now;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

async function initTextures(gl) {
    earthTexture = await loadTexture(gl, earthTexturePath);
    moonTexture = await loadTexture(gl, moonTexturePath);
    loadHighQualityTexture(gl);
}

async function loadHighQualityTexture(gl) {
    nextTexture = await loadTexture(gl, highQualityEarthTexturePath);
    setTimeout(()=>{
        earthTexture = nextTexture;
    },1000);
}


function renderSkybox(gl, viewMatrix, projectionMatrix, program) {
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, starfieldTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

    const viewMatrixNoTranslation = mat4.clone(viewMatrix);
    viewMatrixNoTranslation[12] = 0; // x translation
    viewMatrixNoTranslation[13] = 0; // y translation
    viewMatrixNoTranslation[14] = 0; // z translation

    setMatrixUniforms(gl, program, viewMatrixNoTranslation, projectionMatrix);

    drawSphere(gl, program, skyboxSphereBuffers, false);
}




export {initWebGL, renderEarth, renderSkybox, gl, earthShaderProgram, skyboxProgram, text, earthTexture, starfieldTexture, earthSphere, moonSphere, moonTexture}; 
//init();