precision mediump float;

varying vec2 v_texCoord; // Received from the vertex shader
varying vec3 v_lighting; // Received from the vertex shader


uniform sampler2D u_texture;

void main() {
    highp vec4 texelColor = texture2D(u_texture, v_texCoord);
    
    gl_FragColor = vec4(texelColor.rgb * v_lighting, texelColor.a);
}