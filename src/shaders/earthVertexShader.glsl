// Vertex Shader
attribute vec3 a_position;
attribute vec2 a_texCoord;
attribute vec3 a_normal;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;
uniform mat4 u_modelMatrix;
uniform sampler2D u_bumpMap;
uniform sampler2D u_specularMap;
uniform float u_displacementStrength;
uniform float u_time;

varying vec2 v_texCoord;
varying vec3 v_lighting;
varying float v_specularMask;

void main() {
    vec3 displacedPosition = a_position;
  
    // Sample the bump map
    vec4 bumpColor = texture2D(u_bumpMap, a_texCoord);
    float displacement = bumpColor.r;
  
    float specularMask = texture2D(u_specularMap, a_texCoord).r;
    float wave = sin(a_position.x * 2.0 + u_time) * cos(a_position.z * 2.0 + u_time) * 0.1 * specularMask;
  
    // Apply combined displacement to the vertex position
    displacedPosition += a_normal * ((displacement + wave) * u_displacementStrength);
  
    // Transform the displaced position
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(displacedPosition, 1.0);
  
    v_texCoord = a_texCoord;
    v_specularMask = specularMask;
  
    mediump vec3 ambientLight = vec3(0.5, 0.5, 0.5);
    mediump vec3 directionalLightColor = vec3(1, 1, 1);
    mediump vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
    highp vec4 transformedNormal = u_normalMatrix * vec4(a_normal, 1.0);
    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    v_lighting = ambientLight + (directionalLightColor * directional);
}
