#version 300 es
precision highp float;

in vec2 screenUV;
in vec2 sourceUV;
out vec4 outColor;
in vec2 destinationUV;

uniform float time;
uniform sampler2D destinationTexture;
uniform vec2 offset;
uniform vec2 size;
uniform vec2 resolution;
uniform sampler2D sourceTexture;

void main(){
    vec2 uv =  sourceUV * vec2(resolution.x / resolution.y);

    for(float i = 1.0; i < 10.0; i++){
        uv.x += 0.6 / i * cos(i * 2.5* uv.y + time / 25.);
        uv.y += 0.6 / i * cos(i * 1.5 * uv.x + time / 25.);
    }
    float v = abs(sin(time/25.-uv.y-uv.x));
    outColor = vec4(vec3(.01/v),1.0) * 2.;
}