import { mat4 } from "gl-matrix";
import { Sphere } from "./sphere";
import { loadTexture } from "./textures";
import { shaderProgramInit } from "./loadShaders";
import { Marker } from "./marker";
import { WGS84ToECEF } from "./utilities";
import camera from "./camera";
import { updateCameraPosition, updateCameraOrbit } from "./controllers";
import vertexShaderSource from '../shaders/earthVertexShader.glsl';
import fragmentShaderSource from '../shaders/earthFragmentShader.glsl';
import earthTexturePath from '../images/unused/2kearth.jpg';
import highQualityEarthTexturePath from '../images/unused/10kBaseMap.jpg';
import starfieldTexturePath from '../images/unused/starfield4k.png';
import moonTexturePath from '../images/unused/moon.jpg';
import bumpTexturePath from '../images/unused/10kearthbump.jpg';

let gl = null;

let nextTexture, earthTexture, starfieldTexture, moonTexture, bumpTexture; //textures
let earthSphere, moonSphere, marker; //spheres
let earthShaderProgram, skyboxProgram; //shader programs

function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    setup(canvas);
}

async function setup(canvas) {
    gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
    if (!gl) {
        alert('WebGL is not supported');
        return;
    }

    initTextures(gl);
    earthShaderProgram = shaderProgramInit(gl, vertexShaderSource, fragmentShaderSource);

    earthSphere = new Sphere(gl, 1, 255, false);
    moonSphere = new Sphere(gl, 0.27, 100, false);
    moonSphere.translate(1.5, 0, 0);
    marker = new Marker(gl, 0.1, 0.01, 32);

    const positionOnSurface = WGS84ToECEF(19.432601, -99.13342, 0);
    marker.setPositionOnSphere(positionOnSurface, earthSphere);

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

        marker.draw(earthShaderProgram, viewMatrix, projectionMatrix);
        earthSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, earthTexture, bumpTexture);
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
    bumpTexture = await loadTexture(gl, bumpTexturePath);
    setTimeout(() => {
        earthTexture = nextTexture;
    }, 1000);
}

function renderSkybox(gl, viewMatrix, projectionMatrix, program) {
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, starfieldTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

    const viewMatrixNoTranslation = mat4.clone(viewMatrix);
    viewMatrixNoTranslation[12] = 0;
    viewMatrixNoTranslation[13] = 0;
    viewMatrixNoTranslation[14] = 0;

    setMatrixUniforms(gl, program, viewMatrixNoTranslation, projectionMatrix);

    drawSphere(gl, program, skyboxSphereBuffers, false);
}

export {
    initWebGL,
    renderEarth,
    renderSkybox,
    gl,
    earthShaderProgram,
    skyboxProgram,
    text,
    earthTexture,
    starfieldTexture,
    earthSphere,
    moonSphere,
    moonTexture,
    marker
};