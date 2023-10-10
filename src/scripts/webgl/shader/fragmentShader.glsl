precision highp float;

uniform vec3 uCameraPosition;
uniform mat4 uProjectionMatrixInverse;
uniform mat4 uViewMatrixInverse;
uniform float uAspect;
uniform float uTime;

varying vec2 vUv;

const int MAX_STEPS = 100;

#include './modules/primitives.glsl'

float sdf(vec3 p) {
  float div = 5.0;
  p = mod(p - div * 0.5, div) - div * 0.5;

  vec2 dim = vec2(0.2, 1.0);
  float base = sdBox(p, dim.yyy * 0.99);
  float box1 = sdBox(p, dim.yxx);
  float box2 = sdBox(p, dim.xyx);
  float box3 = sdBox(p, dim.xxy);

  float final = 1.0;
  final = min(final, box1);
  final = min(final, box2);
  final = min(final, box3);

  final = max(base, -final);

  return final;
}

float rayMarch(vec3 ro, vec3 rd) {
  float accum = 0.0;
  float t = 0.01;
  vec3 rayPos = ro;

  for (int i = 0; i < MAX_STEPS; i++) {
    rayPos = ro + rd * t;
    float dist = sdf(rayPos);
    dist = max(abs(dist), 0.01);
    accum += exp(-dist * 15.0);
    t += dist * 0.9;
  }

  return accum;
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;

  vec4 ndcRay = vec4(p, 1.0, 1.0);

  vec2 lensRay = ndcRay.xy * vec2(uAspect, 1.0);
  ndcRay.xy += normalize(lensRay) * pow(length(lensRay), 4.0) * 0.08;

  vec3 ray = (uViewMatrixInverse * uProjectionMatrixInverse * ndcRay).xyz;
  ray = normalize(ray);

  float color = rayMarch(uCameraPosition, ray);
  color *= 0.01;
  color = smoothstep(0.05, 1.2, color);

  gl_FragColor = vec4(vec3(color), 1.0);
}