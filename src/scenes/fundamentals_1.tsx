import { makeScene2D, Layout, Rect, Code, CODE, Circle, codeSignal } from '@motion-canvas/2d';
import { Color, createRef, Vector2, createSignal, easeInOutCubic, fadeTransition, loop, range, tween, waitFor, waitUntil, useRandom } from "@motion-canvas/core";
import { Vector3, SpotLight } from 'three';
import { Chunk } from "../minecraft-render/chunk-engine";
import background from "../shaders/background0.glsl";
import frame_bgr from "../shaders/frameBgr1.glsl";
import { Frame } from '../libs/Frame';
import { Title } from '../libs/title';
export default makeScene2D(function* (view) {
    view.fill("black");
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
    const frequency_body = Code.createSignal('');
    const z_body = Code.createSignal('');
    const amplitude_body = Code.createSignal('');
    const frag0 = Code.createSignal(CODE`if (y >= 8 + sin(x${frequency_body})${z_body}${amplitude_body}):
        return air`);
    const final_return = Code.createSignal('return sand');
    const main = Code.createSignal(CODE`\
def getBlockType(x,y,z):
    ${frag0}
    ${final_return}
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
    world().RenderWorld((x: number, y: number, z: number) => {
        if (y >= 8 + Math.sin(x)) return 'air';
        return 'sand';
    })
    yield* waitUntil('2d map');
    const map = createRef<Frame>();
    const map_scale = 24;
    const map_func = createSignal(() => (x: number, y: number) => {
        var s = Math.sin(x);
        s += 1;
        s /= 2;
        s = Math.round(s);
        const c = Math.floor(s * 255);
        return `rgb(${c},${c},${c})`;
    })
    view.add(<Frame
        ref={map}
        title={"2D Map"}
        size={500}
        y={300}
        x={-1600}
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
        <Rect
            layout
            size={500}
            y={455}
            x={10}
            gap={50}
        >
            {...[['white', 'positive'], ['black', 'negative']].map(d => (
                <Rect layout gap={20}>
                    <Rect
                        size={35}
                        stroke={d[0] == "white" ? "black" : 'white'}
                        lineWidth={2}
                        fill={d[0]}
                        radius={10}
                    />
                    <Title
                        text={d[1]}
                        fill={d[0]}
                        stroke={d[0] == "white" ? "black" : 'white'}
                        lineWidth={1}
                        fontSize={35}
                    />
                </Rect>
            ))}
        </Rect>
    </Frame>)
    yield* map().x(-900, 1);
    yield* waitUntil("frequency");
    const frequency = createSignal<number>(1);
    map_func(() => (x: number, y: number) => {
        var s = Math.sin(x / frequency());
        s += 1;
        s /= 2;
        s = Math.round(s);
        const c = Math.floor(s * 255);
        return `rgb(${c},${c},${c})`;
    });
    yield* tween(1, (t) => {
        const f = 1 + t;
        frequency_body(` / ${f.toFixed(1)}`)
        world().RenderWorld((x: number, y: number, z: number) => {
            if (y >= 8 + Math.sin(x / f)) return 'air';
            return 'sand';
        })
        frequency(f);
    })
    yield* waitUntil("amplitude");
    yield code().fontSize(36, 1);
    const amplitude = createSignal<number>(1);
    map_func(() => (x: number, y: number) => {
        var s = Math.sin(x / 2) * amplitude();
        s += 2;
        s /= 4;
        const c = Math.floor(s * 255);
        return `rgb(${c},${c},${c})`;
    });
    yield* tween(1, (t) => {
        const a = 1 + t;
        amplitude_body(` * ${a.toFixed(1)}`)
        world().RenderWorld((x: number, y: number, z: number) => {
            if (y >= 8 + Math.sin(x / 2) * a) return 'air';
            return 'sand';
        })
        amplitude(a);
    })
    yield* waitUntil("z axis");
    yield code().fontSize(42, 1);
    map_func(() => (x: number, y: number) => {
        var s = Math.sin(x / 2) * Math.sin(y / 2) * 2;
        s += 2;
        s /= 4;
        const c = Math.floor(s * 255);
        return `rgb(${c},${c},${c})`;
    });
    world().RenderWorld((x: number, y: number, z: number) => {
        if (y >= 8 + Math.sin(x / 2) * Math.sin(z / 2) * 2) return 'air';
        return 'sand';
    });
    yield* main(`\
def getBlockType(x,y,z):
    if (y >= 8
        + sin(x / 2)
        * sin(z / 2)
        * 2):
        return air
    return sand`, 1);

    yield* waitUntil("random");
    const generator = useRandom(0);
    const data = generator.intArray(16*16, 0, 2);
    
    map_func(() => (x: number, y: number) => {
        const index = (x+8) + (y+8) * 16;
        const c = data[index] * 255;
        return `rgb(${c},${c},${c})`;
    });
    world().RenderWorld((x: number, y: number, z: number) => {
        if (y >= 8 + data[x+z*16]) return 'air';
        return 'sand';
    });
    yield* main(`\
def getBlockType(x,y,z):
    o = round(random())
    # o is either 0 or 1

    # assuming random returns
    # a random float from 0 to 1

    if (y >= 8 + o) return air
    return sand`, 1);



    yield* waitUntil('next');
});