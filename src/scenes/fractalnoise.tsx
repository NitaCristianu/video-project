import { makeScene2D, Line, Node, Rect, Txt, Gradient, Circle, Code, CODE } from "@motion-canvas/2d";
import perlinnoise from "../shaders/perlinnoise.glsl";
import background from "../shaders/background0.glsl";
import { all, chain, createRef, createSignal, DEFAULT, easeOutCubic, loop, SimpleSignal, waitUntil, delay, linear, useRandom } from '@motion-canvas/core';
import { Frame } from "../libs/Frame";
import { Title } from "../libs/title";

var OCTAVES: Node[] = [];
const time = createSignal<number>(0);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const invlerp = (a: number, b: number, v: number): number => a == b ? 0 : (v - a) / (b - a);
const remap = (iMin: number, iMax: number, oMin: number, oMax: number, v: number) => lerp(oMin, oMax, invlerp(iMin, iMax, v));
type num = number | SimpleSignal<number>;
function noise(resolution: num, size: num = 700) {
    const octave = <Rect
        layout
        size={size}
        opacity={0}
        clip
        y={30}
        radius={32}
    >
        <Rect
            shaders={{
                fragment: perlinnoise,
                uniforms: {
                    myTime: time,
                    scale: resolution,
                }
            }}
            size={'100%'}
        />
    </Rect>;
    OCTAVES.push(octave);
    return octave;
}

function* pop(rect: Rect, shouldY: boolean = true) {
    yield all(
        rect.opacity(1, 0.33, easeOutCubic),
        (shouldY ? rect.y(rect.y() - 30, 0.33, easeOutCubic) : null)
    )
}

function* skew(rect: Rect) {
    yield all(
        rect.skew([-40, 0], 1),
        rect.rotation(30, 1)
    )
}

export default makeScene2D(function* (view) {
    OCTAVES = [];
    const lacunarity = createSignal<number>(2.5);
    const persistence = createSignal<number>(0.5);
    time(0);
    view.add(<Rect
        size={'100%'}
        opacity={0.5}
        shaders={background}
    />);
    const first = noise(lacunarity(), 500);
    const frame_y = createSignal<number>(1500);
    const frame = createRef<Frame>();
    view.add(<Frame
        ref={frame}
        y={frame_y}
        size={[1800, 1000]}
    >

        {first}
    </Frame>);

    yield* waitUntil("start");

    yield* frame_y(0, 1, easeOutCubic);
    yield* waitUntil("toggle map");
    yield* pop(first as Rect);

    yield* waitUntil('skew moment');

    yield first.y(150, 1);
    yield* skew(first as Rect);

    yield* waitUntil("another");
    const second_scale = createSignal<number>(lacunarity);
    const second = noise(second_scale, 500);
    second.skew([-40, 0]); second.rotation(30);

    frame().add(second);
    yield second.y(-150, 1, easeOutCubic);
    yield* pop(second as Rect, false);

    yield* chain(
        waitUntil("down"),
        second_scale(() => lacunarity() * 2, 1)
    );

    yield* chain(
        waitUntil('influence'),
        all(
            second.opacity(0.5, 1),
            second.y(100, 1)
        )
    )

    yield* waitUntil("others");
    const layers = 6;

    yield* loop(layers, function* (i) {
        i += 2;
        const scale = createSignal<number>(() => Math.pow(lacunarity(), i - 1));
        const octave = noise(scale, 500);
        frame().add(octave);
        octave.skew([-40, 0]); octave.rotation(30);
        const initial_y = 80 - 50 * i;
        const final_y = 80 - 50 * (i - 1.5);
        octave.y(initial_y);
        const t = Math.max((1 - i / layers) * 1.5, 0.7);
        yield* chain(
            all(
                pop(octave as Rect, false),
            ),
            octave.opacity(1, 0),
            all(
                scale(Math.pow(2, i), t),
                octave.opacity(() => Math.pow(persistence(), i), t),
                octave.y(final_y, t)
            )
        );

    });

    const noise_name = createSignal<string>("");
    const title = <Title
        text={noise_name}
        y={-300}
    />;
    frame().add(title);
    yield* waitUntil("merge");
    yield* all(
        delay(0.8, noise_name("Fractal Noise", 1)),

        ...OCTAVES.map(octave => all(
            octave.skew(0, 1),
            octave.y(0, 1),
            octave.rotation(0, 1)
        )),
    )
    yield time(100, 1200, linear);

    yield* waitUntil("code");
    yield* all(
        title.x(-450, 1),
        ...OCTAVES.map(octave => octave.x(-450, 1))
    )
    const perlin_code = <Frame size = {[800, 900]} x= {350} y = {-1600} ><Code
        fontSize={40}
        code={CODE`\
def fractal(x, z,
    lacunarity,
    octaves,
    persistence,
    seed):
    
    value = 0
    l = 1
    p = 1
    for i in range(octaves):
        value += perlin(
            x / l,
            z / l,
            seed) * p

        l *= lacunarity
        p *= persistence

    return clamp(-1,1,value)
    `}
    /></Frame>;
    frame().add(perlin_code);
    const title2: Node = title.clone({ x: 450, text: "" });
    view.add(title2);
    yield all(
        perlin_code.y(0, 1),
    );

    yield* waitUntil("props");
    const props = [
        {
            name: "octaves",
            min: 1,
            max: 20,
            value: createSignal<number>(layers)
        },
        {
            name: "lacunarity",
            min: 0,
            max: 20,
            value: lacunarity
        },
        {
            name: "persistence",
            min: 0,
            max: 1,
            value: persistence
        }
    ];
    const props_frame = <Frame
        size={[600, 800]}
        x={400}
        title="Settings"
        y={1600}
    >
        <Rect
            size={[600, 800]}
            gap={30}
        >
            {...props.map((props, i) => <Frame
                size={[500, 100]}
                y={-150 + 150 * i}
                key={props.name}

            >
                <Title
                    text={props.name}
                    fontWeight={200}
                    fontSize={30}
                    y={-20}
                    textAlign={'center'}
                />
                <Rect
                    size={[400, 12]}
                    stroke={() => new Gradient({ fromX: -200, toY: 200, stops: [{ offset: invlerp(props.min, props.max, props.value()), color: "#ffffffdd" }, { offset: 1, color: "#ffffffaa" }, { offset: 0, color: "#ffffff80" }] })}
                    fill={() => new Gradient({
                        fromX: -200,
                        toY: 200,
                        stops: [
                            {
                                offset: 1,
                                color: "rgb(49, 107, 215)"
                            },
                            {
                                offset: 0,
                                color: "rgb(49, 107, 215)"
                            },
                            {
                                offset: invlerp(props.min, props.max, props.value()),
                                color: "rgb(89, 255, 178)"
                            },
                        ]
                    })}
                    lineWidth={4}
                    radius={500}
                    y={20}
                >
                    <Circle
                        x={() => remap(props.min, props.max, -200, 200, props.value())}
                        size={20}
                        fill={() => new Gradient({
                            fromX: -10,
                            toY: 10,
                            stops: [
                                {
                                    offset: 1,
                                    color: "rgb(49, 107, 215)"
                                },
                                {
                                    offset: 0,
                                    color: "rgb(89, 255, 178)"
                                },
                            ]
                        })}
                        stroke={"white"}
                        lineWidth={2}

                    />
                </Rect>
            </Frame>)}
        </Rect>
    </Frame>
    frame().add(props_frame);
    yield* all(
        perlin_code.y(-1600, 0.8, easeOutCubic),
        title2.opacity(0, 0.8, easeOutCubic),
        props_frame.y(0, 0.8, easeOutCubic)
    )

    const generator = useRandom();
    yield* waitUntil("lacunarity");

    yield* loop(3, function* (i) {
        const n = generator.nextFloat(0, 20);
        const dist = Math.abs(n - lacunarity()) / 20;
        yield* lacunarity(n, dist * 4);
    });
    yield* lacunarity(3, 3);
    yield* waitUntil("persistence");

    yield* loop(3, function* (i) {
        const n = generator.nextFloat(0, 1);
        const dist = Math.abs(n - persistence());
        yield* persistence(n, dist * 4);
    });
    yield* persistence(0.5, .5);

    yield* waitUntil("next");
});