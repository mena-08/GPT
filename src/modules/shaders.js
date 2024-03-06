// shaders.js

const vertexShaderSource = `
    attribute vec3 a_position;
    attribute vec2 a_texCoord; // New attribute for texture coordinates

    varying vec2 v_texCoord; // For passing the texture coord to the fragment shader

    uniform mat4 u_viewMatrix;
    uniform mat4 u_projectionMatrix;

    void main() {
        gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.0);
        v_texCoord = a_texCoord; // Pass texture coord to the fragment shader
    }

`;

const fragmentShaderSource = `
    precision mediump float;

    varying vec2 v_texCoord; // Received from the vertex shader
    uniform sampler2D u_texture; // The texture sampler

    void main() {
        gl_FragColor = texture2D(u_texture, v_texCoord);
    }
`;
function initShaders(gl) {
    // Set up the vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    // Set up the fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    // Return the shaders
    return {
        vertexShader,
        fragmentShader
    };
}

export { initShaders };