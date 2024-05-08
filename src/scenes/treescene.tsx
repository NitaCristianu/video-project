import { makeScene2D, Layout, Rect, Code, CODE, Circle, codeSignal } from '@motion-canvas/2d';
import { Color, createRef, Vector2, createSignal, easeInOutCubic, fadeTransition, loop, range, tween, waitFor, waitUntil, useRandom } from "@motion-canvas/core";
import { Vector3, SpotLight } from 'three';
import { Chunk } from "../minecraft-render/chunk-engine";
import background from "../shaders/background0.glsl";
import frame_bgr from "../shaders/frameBgr1.glsl";
import { Frame } from '../libs/Frame';
import { Title } from '../libs/title';
import { PerlinNoise } from '../(unused)/Perlin';
import { Three } from '../libs/Three';
import render, { scene, camera, updateCam } from '../libs/3dnoise';

export default makeScene2D(function* (view) {
    view.add(<Rect
        size={'100%'}
        opacity={0.5}
        shaders={background}
    />);
    const world = createRef<Chunk>();
    const wd_cont = createRef<Rect>();
    const code_cont = createRef<Rect>();
    const code = createRef<Code>();
    const angle = createSignal(Math.PI * 2 + 0.9);
    const rad = createSignal(20);
    function getCamPos() {
        return new Vector3(Math.sin(angle()), .8, Math.cos(angle())).multiplyScalar(rad());
    }
    yield fadeTransition(1);
    yield* waitUntil("start");
    view.add(
        <Frame
            ref={wd_cont}
            size={[1400, 1200]}
            radius={32}
            lineWidth={3}
            topLeft={[-1200, -600]}
        >

            <Rect
                size={() => wd_cont().size()}
                clip
                radius={32}
            >
                <Chunk
                    size={'100%'}
                    ref={world}
                    gridSize={new Vector3(16, 16, 16)}
                    surfaceLights={[{
                        color: new Color("rgb(170, 182, 243)"),
                        position: new Vector3(8, 12, 16),
                        lookAt: new Vector3(8, 6, 16),
                        intensity: 60,
                        angle: Math.PI / 2

                    }, {
                        color: new Color("rgb(255, 164, 114)"),
                        position: new Vector3(-8, 9, 8),
                        lookAt: new Vector3(8, 10, 8),
                        intensity: 60,
                        penumbra: 0.5,
                        angle: Math.PI / 2

                    }, {
                        color: new Color("rgb(170, 182, 243)"),
                        position: new Vector3(-16, 10, 8),
                        lookAt: new Vector3(8, 9, 8),
                        intensity: 60,
                        penumbra: 0.5,
                        angle: Math.PI / 2

                    },
                    {
                        color: new Color("rgb(255, 158, 40)"),
                        position: new Vector3(8, 10, -8),
                        lookAt: new Vector3(8, 9, 8),
                        intensity: 60,
                        angle: Math.PI / 2

                    },

                    ]}
                    ambientLights={[{ color: new Color('rgb(204, 204, 204)'), intensity: 0.1 }]}
                    cameraPosition={getCamPos()}
                />
            </Rect>
            <Rect
                size={() => [wd_cont().size().x - 100, 75]}
                position={() => [0, -wd_cont().size().y / 2]}
                stroke={"rgba(255,255,255,0.4)"}
                lineWidth={3}
                fill="rgba(1,1,1,1)"
                radius={32}
                zIndex={0}
                shaders={{
                    fragment: frame_bgr,
                    uniforms: {
                        blur: 30,
                        scale: 1.4,
                    }
                }}
            />
            <Rect
                layout
                right={() => [wd_cont().size().x / 2 - 50, -wd_cont().size().y / 2]}
                gap={20}
                padding={50}
            >
                {...range(0, 3).map(i => <Circle
                    size={30}
                    stroke={"rgba(255,255,255,0.6)"}
                    lineWidth={2}
                />)}
            </Rect>
            <Title
                text={"3D World"}
                fill="white"
                position={() => [0, -wd_cont().size().y / 2]}
                fontWeight={100}
                fontSize={45}
            />
        </Frame>
    );
    const main = Code.createSignal(CODE`\
def getBlockType(x,y,z):
    cave_noise = perlin3D(x/5, y/5, y/5)
    val = fractal(x / 10,z / 10)
    height = 8 + val * 8
    if (y == 0) return 'stone'
    if (y >= height):
        if (y < 6):
            return water
        return air
    if (y <= height-2):
        if (cave_noise > 0.5) return 'air'
        return stone
    if (y < 6)
        return sand
    return grass
`);
    view.add(<Frame
        ref={code_cont}
        size={[900, 1200]}
        radius={32}
        title={"Code"}
        bottomRight={[1200, 600]}
    >
        <Code
            size={() => code_cont().size()}
            ref={code}
            fontSize={38}
            code={main}
        />
    </Frame>)
    const generator = useRandom(6);
    const perlin_3d_grid = new PerlinNoise(generator.intArray(250, 360, 0));
    render(4, perlin_3d_grid);
    yield loop(() => {
        angle(angle() + 0.01);
        world().setCamera(getCamPos());
    });
    const lacunarity = 5;
    const persitence = 0.5;
    const octaves = 3;
    const perlin_map = new PerlinNoise(generator.intArray(256, 0, 360));
    const fractal = (x: number, z: number, octaves: number, lacunarity: number, persistence: number) => {
        var val = 0;
        var p = 1;
        var l = 1;
        for (var i = 0; i < octaves; i++) {
            val += perlin_map.noise(x / l, z / l, 0, -1, 1) * p;
            p *= persistence;
            l *= lacunarity;
        }
        return val;
    }
    const grid: number[][] = [];
    for (var i = 0; i < 16; i++) {
        grid.push([]);
        for (var j = 0; j < 16; j++) {
            grid[i].push(fractal(i / 10, j / 10, octaves, lacunarity, persitence));
        }
    }
    world().RenderWorld((x: number, y: number, z: number) => {
        var s = grid[x][z] * 8;
        var s2 = perlin_3d_grid.noise(x / 4, y / 4, z / 4, -1, 1) * 8 // caves

        if (y == 0) return 'stone';
        if (y >= 8 + s) {
            if (y < 6)
                return 'water';
            return 'air';
        }
        if (y <= 6 + s) {
            if (s2 > 0.8) return 'air';
            return 'stone';
        }
        if (y < 6) {
            return 'sand'
        }
        return 'grass';
    });
    yield* waitUntil("next");
});