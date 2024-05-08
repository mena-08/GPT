precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_texture;


void main() {
    vec4 texColor = texture2D(u_texture, v_texCoord);
    if (texColor.rgb == vec3(0.0, 0.0, 0.0)) {
        discard;
    } else {
        gl_FragColor = vec4(texColor.rgb, texColor.a);
    }
}
