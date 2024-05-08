import { Circle, CODE, Code, Grid, Img, makeScene2D, Rect, Txt, Line, vector2Signal } from '@motion-canvas/2d';
import { bgr_grad } from '../libs/Palette';
import { Color, createRef, easeInCubic, easeOutBack, easeOutCubic, useRandom, waitUntil, Vector2, all, waitFor, chain, loop, linear, PossibleVector2, createSignal, PossibleColor } from '@motion-canvas/core';
import { Title } from '../libs/title';
import { Cursor } from '../libs/cursor';
import background from '../assets/img/background.png';
import castle_img from '../assets/img/castle.png';
import { Chunk } from '../minecraft-render/chunk-engine';
import { PerlinNoise } from '../(unused)/Perlin';
import { Vector3 } from 'three';

export default makeScene2D(function* (view) {

    const grid = createRef<Rect>();
    const cursor = createRef<Cursor>();

    view.add(<Title
        text="LEVEL EDITOR"
        fontSize={50}
        opacity={() => grid().size().div([1600, 800]).magnitude}
        scale={() => grid().size().div([1600, 800]).magnitude}
        y={() => grid().size().div([1600, 800]).magnitude * -320 + grid().y()}
        x={() => grid().x()}
    />)

    view.add(<Rect
        ref={grid}
        radius={32}
        clip
    >
        <Img
            src={background}
        />
        <Grid
            spacing={50}
            size={'100%'}
            opacity={0.5}
            lineWidth={1}
            stroke={"#fbfbfb"}
        />
    </Rect>)
    view.add(<Rect
        size={grid().size}
        position={grid().position}
        lineWidth={8}
        stroke={"white"}
        radius={32}
        opacity={grid().opacity}
    />)
    view.add(<Cursor zIndex={1} ref={cursor} position={[800, 450]} />);
    const castle = createRef<Img>();
    const computer_cursor = createRef<Rect>();
    view.add(<Img
        ref={castle}
        src={castle_img}
        opacity={0}
        position={cursor().position}
    ></Img>
    );
    view.add(<Rect
        ref={computer_cursor}
        opacity={0}
        size={50}
        zIndex={1}
        fill={"#050505"}
        shadowBlur={20}
        stroke={"rgb(229, 109, 109)"}
        lineWidth={3}
        shadowColor="rgb(229, 109, 109)"
    />)
    yield* waitUntil("start");
    yield* grid().size([1600, 800], 1, easeOutCubic);
    yield* cursor().pop();

    // add
    yield* waitUntil('draw');
    yield* cursor().to(new Vector2(-300, 200), 0.4);
    yield* all(
        cursor().hold(),
        castle().opacity(0.5, 0.25)
    )
    yield* waitFor(0.4);
    yield* cursor().to([174, -250]);
    yield* all(
        cursor().hold(),
        castle().opacity(1, 0.25)
    );

    yield* waitFor(0.4);
    yield* cursor().pop();

    yield* waitUntil("computer");
    yield castle().opacity(0, 0.5);
    yield computer_cursor().opacity(1, 0.25);
    yield* loop(116, i => computer_cursor().position([i % 32 * 50 - 775, Math.floor(i / 32) * 50 - 375], 0).wait(0.02))
    yield* all(
        computer_cursor().stroke("rgb(62, 252, 138)", 1),
        computer_cursor().shadowColor("rgb(62,252,138)", 1)
    );
    yield* all(
        computer_cursor().opacity(0, 0.4),
        castle().opacity(1, 0.4)
    );
    const code_frame = createRef<Rect>();
    const code = createRef<Txt>();
    view.add(<Rect
        ref={code_frame}
        fill="black"
        size={800}
        position={grid().position}
        zIndex={-1}
        radius={32}
        clip

    >
        <Txt
            ref={code}
            fill="rgb(91, 104, 161)"
            fontFamily={"Fira Code"}
            fontWeight={200}
            text={``}
            textWrap
            size={800}
        />
    </Rect>)

    view.add(<Rect
        size={code_frame().size}
        position={code_frame().position}
        lineWidth={8}
        stroke={"white"}
        zIndex={-1}
        radius={32}
        opacity={code_frame().opacity}
    />)
    const generator = useRandom(41);
    const line = () => generator.intArray(30, 0, 2).join("");
    const rows = () => generator.intArray(15, 0, 1).map(i => line()).join('\n');
    yield* waitUntil("algorithm");
    yield loop(100, () => code().text(rows, .2));
    yield* all(
        grid().size(800, 1),
        grid().x(-600, 1),
        castle().x(-425, 1),
        code_frame().x(600, 1)
    );


    yield* waitUntil("tree placement");
    const t = createSignal(0);
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        opacity={() => 0.5 * t()}
        shadowBlur={10}
        topLeft={[100, 50]}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        opacity={() => 0.5 * t()}
        shadowBlur={10}
        topLeft={[150, -50]}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        opacity={() => 0.5 * t()}
        shadowBlur={10}
        topLeft={[200, 0]}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(234, 107, 107)"
        shadowBlur={10}
        topLeft={[200, 250]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(234, 107, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        shadowBlur={10}
        topLeft={[250, -100]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        shadowBlur={10}
        topLeft={[-250, 200]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(234, 107, 107)"
        shadowBlur={10}
        topLeft={[-200, 0]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(234, 107, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(234, 107, 107)"
        shadowBlur={10}
        topLeft={[-250, -50]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(234, 107, 107)"}
    />)
    grid().add(<Rect
        size={50}
        fill="rgb(162, 234, 107)"
        shadowBlur={10}
        topLeft={[-200, 250]}
        opacity={() => 0.5 * t()}
        shadowColor={"rgb(162, 234, 107)"}
    />)
    view.add(
        <Rect
            position={()=>grid().position().add([-250, 450])}
            opacity={() => 0.5 * t()}
            gap={20}
            layout
        >
            <Rect
                size={50}
                fill="rgb(162, 234, 107)"
                shadowBlur={10}
                radius={16}
                topLeft={[-200, 250]}
                shadowColor={"rgb(162, 234, 107)"}
            />
            <Title
                fill = {"rgb(162, 234, 107)"}
                fontSize={40}
                text="valid spots"
            />
        </Rect>
    );
    view.add(
        <Rect
            position={()=>grid().position().add([230, 450])}
            opacity={() => 0.5 * t()}
            gap={20}
            layout
        >
            <Rect
                size={50}
                fill="rgb(234, 107, 107)"
                shadowBlur={10}
                topLeft={[-200, 250]}
                radius={16}
                shadowColor={"rgb(234, 107, 107)"}
            />
            <Title
                fill = {"rgb(234, 107, 107)"}
                fontSize={40}
                text="invalid spots"
            />
        </Rect>
    );
    yield* t(1, 1);
    yield* waitUntil("concepts");
    yield* all(
        grid().y(1600, 1),
        code_frame().y(1600, 1),
        castle().y(1600, 1),

    );
    const world = createRef<Chunk>();
    const base = new PerlinNoise(generator.intArray(256, 0, 360));


    view.add(<Chunk
        ref={world}
        size='100%'
        scale={1.5}
        y={-240}
        opacity={0}
        gridSize={new Vector3(16, 22, 16)}
        cameraPosition={new Vector3(-20, 15, 20)}
        surfaceLights={[
            {
                color: new Color('#f8d36c'),
                intensity: 90,
                position: new Vector3(-10, 15, -10),
                lookAt: new Vector3(0, 10, 0),
                angle: Math.PI / 4,
                penumbra: 0.5,
            },
            {
                color: new Color("#ffffff"),
                position: new Vector3(15, 15, 15),
                lookAt: new Vector3(10, 10, 10),
                penumbra: 0.2,
                intensity: 50,
            },
            {
                color: new Color("#ffffff"),
                position: new Vector3(-15, 15, 15),
                lookAt: new Vector3(-10, 10, 10),
                penumbra: 0.2,
                intensity: 50,
            },
        ]}
        ambientLights={[
            {
                color: new Color('#30c8ff'),
                intensity: .05
            }
        ]}
    />)

    world().RenderWorld((x: number, y: number, z: number) => {
        const height = base.noise(x / 10, z / 10, 0, 0, 10);
        y -= 5;
        if (y > height) {
            if (y < 5)
                return 'water';
            return 'air';
        }

        if (y < height - 2) {
            const density = base.noise(x / 20, y / 20, z / 20, 0, 1);
            if (density > 0.50 && y > -5)
                return "air";
            return 'stone';
        }
        if (y < 5)
            return 'sand';

        return 'grass';
    }, generator)
    yield* world().opacity(1, 0.6);

    // Terrain, caves, water, structures
    const objects: { name: string, l: boolean, color: PossibleColor, pos: PossibleVector2 }[] = [
        {
            name: 'tree',
            l: true,
            pos: [200, -400],
            color: "rgb(32, 167, 84)"
        },
        {
            name: 'terrain',
            pos: [220, -120],
            l: false,
            color: "rgb(116, 196, 59)"
        },
        {
            name: 'water',
            pos: [-50, 140],
            l: false,
            color: "rgb(67, 106, 250)"
        },
        {
            name: 'caves',
            pos: [150, 350],
            l: true,
            color: "rgb(214, 209, 230)"
        },
    ]

    const s = createSignal<number>(0);
    objects.forEach(o => {
        const l = o.l;
        view.add(<Circle
            size={25}
            fill="black"
            stroke={o.color}
            lineWidth={3}
            position={o.pos}
            scale={s}
        >
            <Line
                points={[[0, 0], [l ? 200 : -200, -120]]}
                startOffset={20}
                stroke={o.color}
                lineWidth={4}
                endArrow
                arrowSize={10}
                end={s}
            />
            <Rect
                size={[200, 50]}
                fill="black"
                skew={[20, 0]}
                radius={5}
                lineWidth={3}
                stroke={o.color}
                position={[l ? 310 : -310, -120]}
            />
            <Title
                fontSize={40}
                position={[310 * (l ? 1 : -1), -117]}
                size={[200, 50]}
                fill={o.color}
                fontWeight={200}
                text={() => o.name.slice(0, Math.floor(s() * o.name.length))}
                textAlign={"center"}
            />
        </Circle>)
    })

    yield* s(1, 1);

    yield* waitUntil("next");
});