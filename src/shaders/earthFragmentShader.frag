precision mediump float;

varying vec2 v_texCoord;
varying vec3 v_lighting;
varying float v_specularMask;

uniform sampler2D u_texture;
uniform sampler2D u_overlayTexture;
uniform int u_overlayEnabled;

void main() {
    highp vec4 texelColor = texture2D(u_texture, v_texCoord);
    
    //sample from overlay texture
    highp vec4 overlayColor = texture2D(u_overlayTexture, v_texCoord);
    if (overlayColor.rgb != vec3(0.0)) {
        texelColor = mix(texelColor, overlayColor, overlayColor.a);
    }
    //TODO: add overlay blending modes
    // so if we have a main texture and we want to see the land or earth, that also could be shown    
    //specular
    highp vec3 viewDir = normalize(vec3(0.0, 1.0, 1.0));
    highp float specularStrength = 0.2;
    highp float shininess = 32.0;
    highp vec3 specularColor = vec3(1.0, 1.0, 1.0);
    highp vec3 reflectDir = reflect(-viewDir, normalize(v_lighting));
    highp float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * v_specularMask;
    
    //combine lighting
    highp vec3 finalColor = texelColor.rgb * v_lighting + specularColor * spec * specularStrength;
    
    gl_FragColor = vec4(finalColor, texelColor.a);
}
