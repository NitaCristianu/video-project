import { makeScene2D, Layout, Rect, Code, CODE, Circle, codeSignal } from '@motion-canvas/2d';
import { Color, createRef, createSignal, easeInOutCubic, loop, range, tween, waitFor, waitUntil } from "@motion-canvas/core";
import { Vector3, SpotLight } from 'three';
import { Chunk } from "../minecraft-render/chunk-engine";
import background from "../shaders/background0.glsl";
import frame_bgr from "../shaders/frameBgr1.glsl";
import { Frame } from '../libs/Frame';
import { Title } from '../libs/title';

export default makeScene2D(function* (view) {
    view.fill("rgb(3, 3, 6)");

    const world = createRef<Chunk>();
    const wd_cont = createRef<Rect>();
    const code_cont = createRef<Rect>();
    const code = createRef<Code>();
    const angle = createSignal(Math.PI * 2 + 0.9);
    const rad = createSignal(20);
    function getCamPos() {
        return new Vector3(Math.sin(angle()), .8, Math.cos(angle())).multiplyScalar(rad());
    }
    yield* waitUntil("start");

    view.add(<Rect
        size={'100%'}
        shaders={background}
    />);
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
                    renderAxis
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
    )

    const final_return  = Code.createSignal('');
    const frag0 = Code.createSignal('');
    view.add(<Frame
        ref={code_cont}
        size={[900, 1200]}
        radius={32}
        title={"Code"}
        bottomRight={[1200, 600]}
    >
        <Code
            size={() => code_cont().size()}
            fontSize={40}
            code={CODE`\
def getBlockType(x,y,z):${frag0}
    ${final_return}
    `}
        />
    </Frame>)
    yield loop(() => {
        angle(angle() + 0.01);
        world().setCamera(getCamPos());
    });
    world().RenderWorld((x: number, y: number, z: number) => 'air');
    yield* waitUntil("stone");
    yield* final_return("return stone", 0.5);
    world().RenderWorld((x: number, y: number, z: number) => 'stone');
    yield* waitUntil("log");
    yield* final_return("return log", 0.5);
    world().RenderWorld((x: number, y: number, z: number) => 'log');
    yield* waitUntil("sand");
    yield* final_return("return sand", 0.5);
    world().RenderWorld((x: number, y: number, z: number) => 'sand');

    yield* waitUntil("halfen");
    yield* frag0("\n    if (y >= 8): return air", 0.5);
    world().RenderWorld((x: number, y: number, z: number) => y < 8 ? 'sand' : 'air');


    yield* waitUntil("next");
})