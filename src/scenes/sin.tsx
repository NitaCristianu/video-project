import { Line, Circle, makeScene2D, Rect } from "@motion-canvas/2d";
import background from "../shaders/background0.glsl";
import { Color, createRef, createSignal, fadeTransition, PossibleVector2, tween, waitUntil } from "@motion-canvas/core";
import { Title } from "../libs/title";

export default makeScene2D(function* (view) {
    view.add(<Rect
        size={'100%'}
        opacity={0.5}
        shaders={background}
    />);
    const sine_color = new Color("rgb(231, 243, 102)");
    const sine_point = createRef<Circle>();
    const sine_line = createRef<Line>();
    const range = 1350;
    const frequency = 200;
    const amplitude = 200;
    const points = createSignal<PossibleVector2[]>([]);
    view.add(<Circle
        ref={sine_point}
        size={20}
        fill={sine_color}
        shadowBlur={50}
        x={Math.sin(-range/frequency)*amplitude}
        shadowColor={sine_color}
    />);
    view.add(<Line
        points={points}
        shadowBlur={20}
        shadowColor={sine_color}
        stroke={sine_color}
        lineWidth={4}
    />);
    yield fadeTransition(1);
    yield tween(6, (t: number) => {
        const x = -range + 2 * range * t;
        const y = Math.sin(x / frequency) * amplitude;
        sine_point().position([x, y]);
        const p = points();
        points(()=>{
            p.push([x,y]);
            return p;
        });
    });
    yield* waitUntil("title");
    const t = createRef<Title>();
    view.add(<Title
        ref = {t}
        text = ""
        y = {-500}
        fontSize={100}
        fill={sine_color}
    />);
    yield* t().text("sin(x)", 1);
    yield* waitUntil('next');
})