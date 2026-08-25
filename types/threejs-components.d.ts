/**
 * `threejs-components` ships only a minified ESM build — no bundled types and
 * no `types` field in its package.json — so TypeScript cannot resolve it.
 *
 * Declared here to the depth this project actually touches: the particles1
 * cursor factory, and the parts of the app object the firework cursor reaches
 * into to push uniform updates. Everything else stays `unknown` on purpose,
 * so a wrong guess surfaces as a type error rather than silently compiling.
 */
declare module "threejs-components" {
  interface Vec2Like {
    x: number;
    y: number;
    set(x: number, y: number): void;
  }

  interface ParticlesPointer {
    hover: boolean;
    nPosition?: Vec2Like;
  }

  interface ParticlesUpdateArg {
    time?: number;
    pointer?: ParticlesPointer;
  }

  interface Particles {
    update(arg: ParticlesUpdateArg): void;
    uniforms?: Record<string, { value: unknown } | undefined> & {
      uColor?: { value: { set(color: string): void } };
      uPointSize?: { value: number };
      uDecay?: { value: number };
      uPointerPosition?: { value: Vec2Like };
    };
    setColors?(colors: string[]): void;
  }

  interface BloomPass {
    strength: number;
    radius: number;
    threshold: number;
  }

  export interface Particles1CursorApp {
    particles?: Particles;
    bloomPass?: BloomPass;
    three?: { size?: { wWidth: number; wHeight: number } };
    dispose?(): void;
  }

  export interface Particles1CursorConfig {
    gpgpuSize?: number;
    color?: string;
    colors?: string[];
    size?: number;
    decay?: number;
    noiseCoordScale?: number;
    noiseIntensity?: number;
    noiseTimeCoef?: number;
  }

  export type Particles1Cursor = (
    canvas: HTMLCanvasElement,
    config?: Particles1CursorConfig
  ) => Particles1CursorApp;

  /**
   * The build exposes each effect as a top-level named export — there is no
   * default export and no `cursors` namespace, despite what some of the
   * library's docs show.
   */
  export const Particles1Cursor: Particles1Cursor;
  export const Attraction1Cursor: Particles1Cursor;
  export const Neon1Cursor: Particles1Cursor;
  export const Tubes1Cursor: Particles1Cursor;
}
