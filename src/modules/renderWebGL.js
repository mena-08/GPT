import camera from "./camera";
import { mat4 } from "gl-matrix";
import { Sphere } from "./sphere";
import { loadImage, loadTexture } from "./textures";
import { shaderProgramInit } from "./shaders";
import earthTexturePath from '../images/unused/2kearth.jpg';
import highQualityEarthTexturePath from '../images/unused/10kBaseMap.jpg';
import starfieldTexturePath from '../images/unused/starfield4k.png';
import { updateCameraPosition, updateCameraOrbit } from "./controllers";
import vertexShaderSource from '../shaderFiles/earthVertexShader.glsl';
import fragmentShaderSource from '../shaderFiles/earthFragmentShader.glsl';


//global variables for the spheres
let gl = null;
let earthSphere;
let nextTexture = null;
let earthShaderProgram, skyboxProgram;
let earthTexture, starfieldTexture = null;
let earthSphereBuffers, skyboxSphereBuffers;

function init() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    setup(canvas);
}

async function setup(canvas) {
    gl = canvas.getContext('webgl', { xrCompatible: true });
    if (!gl) {
        alert('WebGL is not supported');
        return;
    }

    initTextures(gl);
    earthShaderProgram = shaderProgramInit(gl, vertexShaderSource, fragmentShaderSource);
    //skyboxProgram = shaderProgramInit(gl, skyboxVertexShaderSource, skyboxFragmentShaderSource);

    //setup the sphere rendering - basically its shaders and buffers
    earthSphere = new Sphere(1, 80, false);
    earthSphereBuffers = initSphereBuffers(gl, earthSphere);
    // const skyboxSphere = new Sphere(1000, 32, true);
    // skyboxSphereBuffers = initSphereBuffers(gl, skyboxSphere);

    camera.position = [0, 0, 3];
    let lastTime = 0;

    function animate(now) {
        
        if (!lastTime) lastTime = now;
        const deltaTime = (now - lastTime) / 1000;

        // clear the canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        updateCameraPosition(deltaTime);
        updateCameraOrbit(deltaTime);

        camera.updateViewMatrix();

        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        //renderSkybox(gl, viewMatrix, projectionMatrix,  skyboxProgram);
        renderEarth(gl, viewMatrix, projectionMatrix,  earthShaderProgram, earthSphere.modelMatrix);

        lastTime = now;

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}

//create a buffer function for the sphere
function initSphereBuffers(gl, sphere) {
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.vertices, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.texCoords, gl.STATIC_DRAW);

    //normals buffer
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);

    return {
        vertexBuffer,
        indexBuffer,
        textureCoordBuffer,
        normalBuffer,
        vertexCount: sphere.indices.length
    };
}

async function initTextures(gl) {
    earthTexture = await loadTexture(gl, earthTexturePath);
    //starfieldTexture = await loadTexture(gl, starfieldTexturePath);
    loadHighQualityTexture(gl);
}

async function loadHighQualityTexture(gl) {
    nextTexture = await loadTexture(gl, highQualityEarthTexturePath);
    setTimeout(()=>{
        earthTexture = nextTexture;
    },1000);
}

function renderEarth(gl, viewMatrix, projectionMatrix, program, modelMatrix) {
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, earthTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

    setMatrixUniforms(gl, program, viewMatrix, projectionMatrix);
    const modelMatrixLocation = gl.getUniformLocation(program, 'u_modelMatrix');
    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);

    drawSphere(gl, program, earthSphereBuffers);
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


function drawSphere(gl, program, sphereBuffers, normals = true) {
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    // Bind the sphere vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.vertexBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the sphere index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.indexBuffer);

    // Bind the sphere texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.textureCoordBuffer);
    const textureCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
    gl.vertexAttribPointer(textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoordAttributeLocation);

    if (normals) {
        // Bind the sphere normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.normalBuffer);
        const normalAttributeLocation = gl.getAttribLocation(program, 'a_normal');
        gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normalAttributeLocation);
    }

    // Draw the sphere
    gl.drawElements(gl.TRIANGLES, sphereBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);

    //alert(Date.now());
}

function setMatrixUniforms(gl, program, viewMatrix, projectionMatrix) {
    const uViewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');
    const uProjectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    const uNormalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, viewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    gl.uniformMatrix4fv(uViewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(uNormalMatrixLocation, false, normalMatrix);
}


export {init, renderEarth, renderSkybox, gl, earthShaderProgram, skyboxProgram, text, earthTexture, starfieldTexture, earthSphere}; 
//init();
