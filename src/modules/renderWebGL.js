import camera from "./camera";
import { initShaders } from "./shaders";
import { updateCameraPosition,updateCameraOrbit } from "./controllers";
import { Sphere } from "./sphere";

function init() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    setup(canvas);
}

function setup(canvas) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
        alert('WebGL is not supported');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const {vertexShader, fragmentShader} = initShaders(gl);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    //setupBuffers(gl, program);

    camera.position = [0, 0, 10];

    let lastTime = 0;
    function animate(now) {
        requestAnimationFrame(animate);
        
        if (!lastTime) lastTime = now;
        const deltaTime = (now - lastTime) / 1000; // Convert to seconds
        
        updateCameraPosition(deltaTime);
        updateCameraOrbit(deltaTime);
        render(gl, camera, program);
        
        lastTime = now;
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

    return {
        vertexBuffer,
        indexBuffer,
        vertexCount: sphere.indices.length
    };
}

function render(gl, camera, program) {
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix();
    
    //get the locations of the uniform variables in the shaders
    const viewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    
    //set the uniform values
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    
    const mySphere = new Sphere(1, 32);
    const sphereBuffers = initSphereBuffers(gl, mySphere);
    drawSphere(gl, program, sphereBuffers);
}

function drawSphere(gl, program, sphereBuffers) {
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
    const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_viewMatrix');

    // Bind the sphere vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffers.vertexBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the sphere index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffers.indexBuffer);

    // Set uniforms
    gl.uniformMatrix4fv(projectionMatrixLocation, false, camera.getProjectionMatrix());
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, camera.getViewMatrix());

    // Draw the sphere
    gl.drawElements(gl.TRIANGLES, sphereBuffers.vertexCount, gl.UNSIGNED_SHORT, 0);
}

init();
