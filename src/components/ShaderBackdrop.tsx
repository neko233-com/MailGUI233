import { useEffect, useRef } from "react";

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;

  float drift = u_time * 0.028;
  float silk = sin((p.x * 1.16 - p.y * 0.74 + drift) * 7.1) * 0.5 + 0.5;
  float brushed = smoothstep(0.34, 0.98, silk) * 0.18;
  float depth = noise(p * 1.65 + vec2(drift, -drift * 0.42)) * 0.16;
  float grain = noise(uv * vec2(520.0, 310.0) + u_time * 0.035);
  float edge = smoothstep(1.52, 0.18, length(p * vec2(0.84, 1.12)));

  vec3 ink = vec3(0.030, 0.038, 0.056);
  vec3 glass = vec3(0.925, 0.952, 0.957);
  vec3 graphite = vec3(0.140, 0.158, 0.180);
  vec3 jade = vec3(0.025, 0.310, 0.288);
  vec3 steel = vec3(0.520, 0.602, 0.640);

  float plane = smoothstep(-0.82, 0.76, p.x * 0.52 + p.y * 0.10);
  vec3 color = mix(ink, glass, plane);
  color = mix(color, graphite, smoothstep(-1.00, -0.28, p.x) * 0.32);
  color += jade * brushed * edge;
  color += steel * depth * 0.30;
  color += (grain - 0.5) * 0.030;

  gl_FragColor = vec4(color, 0.88);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    return undefined;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return undefined;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!vertexShader || !fragmentShader) {
    return undefined;
  }

  const program = gl.createProgram();

  if (!program) {
    return undefined;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return undefined;
  }

  return program;
}

function framebufferVariance(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
  const points = [
    [Math.floor(canvas.width * 0.22), Math.floor(canvas.height * 0.28)],
    [Math.floor(canvas.width * 0.54), Math.floor(canvas.height * 0.5)],
    [Math.floor(canvas.width * 0.82), Math.floor(canvas.height * 0.76)]
  ];
  const pixels: number[] = [];

  for (const [x, y] of points) {
    const pixel = new Uint8Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    pixels.push(pixel[0], pixel[1], pixel[2]);
  }

  const average = pixels.reduce((sum, value) => sum + value, 0) / pixels.length;

  return pixels.reduce((sum, value) => sum + Math.abs(value - average), 0) / pixels.length;
}

export function ShaderBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: true,
        stencil: false
      }) ?? undefined;

    if (!gl) {
      canvas.dataset.shaderReady = "fallback";
      return;
    }

    const program = createProgram(gl);

    if (!program) {
      canvas.dataset.shaderReady = "fallback";
      return;
    }

    const targetCanvas = canvas;
    const context = gl;
    const shaderProgram = program;
    const positionLocation = context.getAttribLocation(shaderProgram, "a_position");
    const resolutionLocation = context.getUniformLocation(shaderProgram, "u_resolution");
    const timeLocation = context.getUniformLocation(shaderProgram, "u_time");
    const buffer = context.createBuffer();
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationId = 0;
    let disposed = false;

    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(context.ARRAY_BUFFER, positions, context.STATIC_DRAW);
    context.useProgram(shaderProgram);
    context.enableVertexAttribArray(positionLocation);
    context.vertexAttribPointer(positionLocation, 2, context.FLOAT, false, 0, 0);

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(1, Math.floor(targetCanvas.clientWidth * ratio));
      const height = Math.max(1, Math.floor(targetCanvas.clientHeight * ratio));

      if (targetCanvas.width !== width || targetCanvas.height !== height) {
        targetCanvas.width = width;
        targetCanvas.height = height;
      }

      context.viewport(0, 0, targetCanvas.width, targetCanvas.height);
    }

    function render(time: number) {
      if (disposed) {
        return;
      }

      resize();
      context.useProgram(shaderProgram);
      context.uniform2f(resolutionLocation, targetCanvas.width, targetCanvas.height);
      context.uniform1f(timeLocation, reduceMotion ? 0 : time * 0.001);
      context.drawArrays(context.TRIANGLES, 0, 6);
      targetCanvas.dataset.shaderReady =
        framebufferVariance(context, targetCanvas) > 3 ? "true" : "fallback";

      if (!reduceMotion) {
        animationId = window.requestAnimationFrame(render);
      }
    }

    render(0);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationId);
      context.deleteBuffer(buffer);
      context.deleteProgram(shaderProgram);
    };
  }, []);

  return <canvas aria-hidden="true" className="shader-backdrop" data-testid="material-shader" ref={canvasRef} />;
}
