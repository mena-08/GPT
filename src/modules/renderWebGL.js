/// General algorithm
//1. Load the shaders
//2. Load the textures
//3. Render the sphere
//4. Use a low resolution texture
//5. While the sphere is rendering, load the high resolution texture
//6. Once the high resolution texture is loaded, switch to it
//7. Load the overlay texture
//8. We can switch to any overlay texture
//9. Switch to any main texture
//10. Switch to any video texture
//11. Voice commands to switch overlay textures
//12. Voice commands to switch main textures
//13.->NEXT: Voice commands to switch to video textures
//14. Voice commands to transformations
//15. Activate virtual agent with the palm of the hand
//16.->NEXT: Add support to mobile devices with overlay DOM elements (recording, and controls)

import Hls from "hls.js";
import camera from "./camera";
import { mat4 } from "gl-matrix";
import { Marker } from "./marker";
import { Sphere } from "./sphere";
import { eventEmitter } from "./eventEmitter";
import { loadTexture, loadVideoTextureMemory } from "./textures";
import { shaderProgramInit } from "./loadShaders";
import { updateCameraPosition, updateCameraOrbit } from "./controllers";

import vertexShaderSource from '../shaders/earthVertexShader.glsl';
import fragmentShaderSource from '../shaders/earthFragmentShader.glsl';
import agentVertexShaderSource from '../shaders/agentVertexShader.glsl';
import agentFragmentShaderSource from '../shaders/agentFragmentShader.glsl';
import earthTexturePath from '/static/base_textures/base_lowres_map.jpg';
import highQualityEarthTexturePath from '/static/base_textures/base_map.jpg';
import moonTexturePath from '/static/base_textures/base_moon.jpg';
import bumpTexturePath from '/static/base_textures/base_bump.jpg';
import specularTexturePath from '/static/base_textures/base_specular.jpg';
import agentTexturePath from "/static/base_textures/agent3.png";

//gl context and future textures
let gl = null;
let videoTexture = false;
let earthSphere, marker, agentSphere; //objects
let earthShaderProgram, skyboxProgram, agentShaderProgram; //shader programs
let earthTexture, bumpTexture, specularTexture, starfieldTexture, moonTexture; //textures
let highResTexture,initialTexture; //temporary textures

function initWebGL(mobileDevice=null) {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    setup(canvas);
}

async function setup(canvas, mobileDevice=null) {
    gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
    if (!gl) {
        alert('WebGL is not supported');
        return;
    }
    camera.position = [0, 0, 5];
    let lastTime = 0;

    initTextures(gl);
    earthShaderProgram = shaderProgramInit(gl, vertexShaderSource, fragmentShaderSource);
    agentShaderProgram = shaderProgramInit(gl, agentVertexShaderSource, agentFragmentShaderSource);

    earthSphere = new Sphere(gl, 0.4, 255, false);
    agentSphere = new Sphere(gl, 0.07, 100, false, true);
    agentSphere.rotateRight();

    //earthSphere.scale();
    
    marker = new Marker(gl, 0.1, 0.01, 32);
    marker.setPositionOnSphere([40.4637, 3.7492], earthSphere);
    
    //console.log(overlayRoutes.timezones);

    function animate(now) {
        if (!lastTime) lastTime = now;
        const deltaTime = (now - lastTime) / 1000;
        let currentTime = now * 0.001; 
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        updateCameraPosition(deltaTime);
        updateCameraOrbit(deltaTime);
        camera.updateViewMatrix();

        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();
        //marker.draw(earthShaderProgram, viewMatrix, projectionMatrix);
        agentSphere.draw(agentShaderProgram, viewMatrix, projectionMatrix);
        earthSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, initialTexture);
        
        gl.uniform1f(gl.getUniformLocation(earthShaderProgram, 'u_time'), currentTime);
        gl.uniform1f(gl.getUniformLocation(agentShaderProgram, 'u_time'), currentTime);
        lastTime = now;
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

async function initTextures(gl) {
    //load the lowres texture first
    earthTexture = await loadTexture(gl, earthTexturePath);
    initialTexture = earthTexture;
    specularTexture = await loadTexture(gl, specularTexturePath);
    bumpTexture = await loadTexture(gl, bumpTexturePath);
    const agentTexture = await loadTexture(gl,agentTexturePath );
    
    if(earthTexture){
        eventEmitter.emit('textureChange', earthTexture, earthShaderProgram);
        agentSphere.texture = agentTexture;
        //eventEmitter.emit('textureChange', earthTexture, agentShaderProgram);

        const x = "atmosphere/fim_chem/weather_fimchem_hls.m3u8";
        //loadVideoTexture(gl,'/api/video/'+x);
    }
    if(bumpTexture && specularTexture){
        //loadHighQualityTexture(gl);
        //if the low res is loaded, load the high res
        //eventEmitter.emit('loadSpecialTextures', bumpTexture, specularTexture, earthShaderProgram);
        //loadMainTexture(gl, testMainTexturePath);
        //loadHighQualityTexture(gl);
        //const imgrequired = require.context("/static/overlays/", false, /overlay_air_circulation\.png$/);
        //loadOverlayTexture(gl, overlayRoutes.capitals);
    }
    //sep(gl, '/api/video/air_traffic.m3u8');
}

async function loadVideoTexture(gl,placeholder){
    initialTexture = await loadVideoTextureMemory(gl,placeholder); 
}

async function loadHighQualityTexture(gl) {
    highResTexture = await loadTexture(gl, highQualityEarthTexturePath);
    setTimeout(() => {
        if (highResTexture){
            eventEmitter.emit('textureChange', highResTexture, earthShaderProgram);
            initialTexture = null;
        }
        //earthTexture = highResTexture;
    }, 1000);
    //loadOverlayTexture(gl, testTexturePath);
    //loadMainTexture(gl, testMainTexturePath);
}

async function loadOverlayTexture(gl, path) {
    const nxtTtext = await loadTexture(gl, path);
    setTimeout(() => {
        if (nxtTtext){
            eventEmitter.emit('textureOverlayChange', nxtTtext, earthShaderProgram);
            //loadMainTexture(gl, testMainTexturePath);
        } 
    }, 1000);
}

async function loadMainTexture(gl, path) {
    const nxtTtext2 = await loadTexture(gl, path);
    setTimeout(() => {
        if (nxtTtext2){
            initialTexture = null;
            eventEmitter.emit('textureChange', nxtTtext2, earthShaderProgram);
        } 
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
    agentSphere,
    moonTexture,
    videoTexture, 
    bumpTexture,
    specularTexture,
    agentShaderProgram,
    initialTexture,
    loadOverlayTexture,
    loadMainTexture,
    loadVideoTexture
};