precision mediump float;

varying vec2 v_texCoord;
varying vec3 v_lighting;
varying float v_specularMask;

uniform sampler2D u_texture;

void main() {
    highp vec4 texelColor = texture2D(u_texture, v_texCoord);
    
    // Specular highlight
    highp vec3 viewDir = normalize(vec3(0.0, 1.0, 1.0)); // Example view direction
    highp float specularStrength = 0.2;
    highp float shininess = 32.0;
    highp vec3 specularColor = vec3(1.0, 1.0, 1.0);
    highp vec3 reflectDir = reflect(-viewDir, normalize(v_lighting));
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * v_specularMask;
    
    // Combine lighting
    highp vec3 finalColor = texelColor.rgb * v_lighting + specularColor * spec * specularStrength;
    
    gl_FragColor = vec4(finalColor, texelColor.a);
}
