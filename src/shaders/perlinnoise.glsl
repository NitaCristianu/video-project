#version 300 es
precision highp float;

uniform float myTime;
uniform float scale;

#include "@motion-canvas/core/shaders/common.glsl"

vec2 random2D(vec2 uv) {
    uv = vec2(dot(uv, vec2(127.1f, 311.7f)), dot(uv, vec2(269.5f, 183.3f)));
    return -1.0f + 2.0f * fract(sin(uv) * 43758.5453123f);
}

void main() {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = sourceUV + vec2(0,sin(myTime)) + vec2(cos(myTime), 0);
    uv *= scale;
    // Tie varying pixel color
    vec2 col = random2D(uv);
    vec2 gridIndex = floor(uv);
    vec2 gridFract = fract(uv);
    vec2 bl = gridIndex + vec2(0.0f, 0.0f);
    vec2 br = gridIndex + vec2(1.0f, 0.0f);
    vec2 tl = gridIndex + vec2(0.0f, 1.0f);
    vec2 tr = gridIndex + vec2(1.0f, 1.0f);

    vec2 gradBL = random2D(bl);
    vec2 gradBR = random2D(br);
    vec2 gradTL = random2D(tl);
    vec2 gradTR = random2D(tr);

    vec2 distToPixelFromBL = gridFract - vec2(0.0f, 0.0f);
    vec2 distToPixelFromBR = gridFract - vec2(1.0f, 0.0f);
    vec2 distToPixelFromTL = gridFract - vec2(0.0f, 1.0f);
    vec2 distToPixelFromTR = gridFract - vec2(1.0f, 1.0f);

    float dotBL = dot(gradBL, distToPixelFromBL);
	float dotBR = dot(gradBR, distToPixelFromBR);
	float dotTL = dot(gradTL, distToPixelFromTL);
	float dotTR = dot(gradTR, distToPixelFromTR);

    vec2 blur = smoothstep(0.0, 1.0, gridFract);
    float a = mix(dotBL, dotBR, blur.x);
    float b = mix(dotTL, dotTR, blur.x);
    float v = mix(a, b, blur.y) + .5;
    outColor = vec4(v, v, v, 1.f);
}