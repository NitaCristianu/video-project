#version 300 es
precision highp float;

in vec2 screenUV;
in vec2 sourceUV;
out vec4 outColor;
in vec2 destinationUV;

uniform float time;
uniform sampler2D destinationTexture;
uniform vec2 offset;
uniform vec2 resolution;
uniform float blur;
uniform float scale;
uniform sampler2D sourceTexture;

vec4 getAverageColor(){
    vec4 color = vec4(0.);
    float n = 0.0;
    for (float x = -.5; x < .5; x+=1.0/blur){
        for (float y = -.5; y < .5; y+=1.0/blur){
            n++;
            float d = distance(vec2(x,y), vec2(0,0));
            vec4 col = texture(destinationTexture, destinationUV + vec2(x,y) * d*.7) * 0.8;
            col += 1.;
            col *= col;
            col -= 1.;
            color += col;
        }
    }

    return color / n;
}

void main() {
    vec4 dest = texture(destinationTexture, destinationUV);
    vec4 sour = texture(sourceTexture, sourceUV);

    vec4 radius_mask = vec4(1., 1., 1., sour.a);
    vec4 col = sour * 0.5;
    outColor = mix(getAverageColor() * vec4(scale, scale, scale, sour.a) , col, 0.5);
    outColor.a = sour.a;
}

//https://www.shadertoy.com/view/WtdXR8