import { makeScene2D, Layout, Rect, Code, CODE, Circle, codeSignal } from '@motion-canvas/2d';
import { Color, createRef, Vector2, createSignal, easeInOutCubic, fadeTransition, loop, range, tween, waitFor, waitUntil, useRandom } from "@motion-canvas/core";
import { Vector3, SpotLight } from 'three';
import { Chunk } from "../minecraft-render/chunk-engine";
import background from "../shaders/background0.glsl";
import frame_bgr from "../shaders/frameBgr1.glsl";
import { Frame } from '../libs/Frame';
import { Title } from '../libs/title';
import { PerlinNoise } from '../(unused)/Perlin';
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
                    size={() => wd_cont().size()}
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
    x *= 1.001
    z *= 1.001
    # (x and z must not be integers)

    val = perlin(x,z)
    if (y >= 8 + val):
        return air
    return sand
`)
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
            fontSize={40}
            code={main}
        />
    </Frame>)
    yield loop(() => {
        angle(angle() + 0.01);
        world().setCamera(getCamPos());
    });
    const frequency = createSignal(1);
    const amplitude = createSignal(1);
    const map = createRef<Frame>();
    const map_scale = 24;
    const generator = useRandom(0);
    const perlin_map = new PerlinNoise(generator.intArray(256, 0, 360));
    const map_func = createSignal(() => (x: number, y: number) => {
        var s = perlin_map.noise((x + 8) * 1.01 / frequency(), (y + 8) * 1.01 / frequency(), 0, 0, 1);
        s = s * s   ;
        const c = Math.floor(s * 255);
        return `rgb(${c},${c},${c})`;
    })
    view.add(<Frame
        ref={map}
        title={"2D Map"}
        size={500}
        y={300}
        x={-900}
    >
        <Rect clip size={map_scale * 16} radius={16}>
            {...range(-8, 8).map(x => range(-8, 8).map(y => (
                <Rect
                    size={map_scale}
                    position={new Vector2(x, y).add(0.5).mul(map_scale)}
                    fill={() => map_func()(x, y)}
                />
            )))}
        </Rect>
    </Frame>)

    world().RenderWorld((x: number, y: number, z: number) => {
        var s = perlin_map.noise(x * 1.01, z * 1.01, 0, -1, 1);
        
        if (y >= 8 + s) {
            return 'air';
        }
        return 'sand';
    });

    yield* waitUntil("frequency");
    yield frequency(10, 3.5);
    yield main(CODE`\
def getBlockType(x,y,z):
    x *= 1.001
    z *= 1.001
    # (x and z must not be integers)

    val = perlin(x / 10,z / 10)
    if (y >= 8 + val):
        return air
    return sand
`, 1);
    yield* tween(3.5, (t) => {
        const freq = 1 + t * (frequency() - 1);
        world().RenderWorld((x: number, y: number, z: number) => {
            var s = perlin_map.noise(x * 1.01 / freq, z * 1.01 / freq, 0, -1, 1);

            if (y >= 8 + s) {
                return 'air';
            }
            return 'sand';
        });
    })
    yield* waitUntil("amplitude");
    yield amplitude(8, 1);
    yield main(CODE`\
def getBlockType(x,y,z):
    x *= 1.001
    z *= 1.001
    # (x and z must not be integers)

    val = perlin(x / 10,z / 10)
    val *= 8
    if (y >= 8 + val):
        return air
    return sand
`, 1);
    yield* tween(1.5, (t) => {
        const ampl = 1 + t * (amplitude() - 1);
        world().RenderWorld((x: number, y: number, z: number) => {
            var s = perlin_map.noise(x * 1.01 / frequency(), z * 1.01 / frequency(), 0, -1, 1) * amplitude();

            if (y >= 8 + s) {
                return 'air';
            }
            return 'sand';
        });
    });
    yield* map().x(-1600, 1);

    yield* waitUntil('next');
});