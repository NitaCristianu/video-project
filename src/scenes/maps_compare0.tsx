import { makeScene2D, Rect } from "@motion-canvas/2d";
import background from "../shaders/background0.glsl";
import { Vector2, createRef, fadeTransition, range, useRandom, waitUntil, all } from '@motion-canvas/core';
import { Frame } from "../libs/Frame";
import { Title } from "../libs/title";

export default makeScene2D(function* (view) {
    yield fadeTransition(1);
    view.add(<Rect
        size={'100%'}
        zIndex={-999}
        opacity={0.5}
        shaders={background}
    />);

    const map_1 = createRef<Rect>();
    const map_2 = createRef<Rect>();
    const map_scale = 40;
    const frame = 100;

    const generator = useRandom(0);

    const keyword_Smooth = createRef<Title>();
    const keyword_Random = createRef<Title>();

    view.add(<Frame
        ref={map_1}
        size={map_scale * 16 + frame}
        title={"'Random' Map"}
        x={500}
    >
        <Rect
            radius={32}
            clip
            size={map_scale * 16}
            stroke={"white"}
            lineWidth={2}
            shadowColor={"white"}
            shadowBlur={30}
        >
            {...range(0, 16).map(x => range(0, 16).map(y => (
                <Rect
                    position={new Vector2(x + 0.5, y + 0.5).mul(map_scale).sub(8 * map_scale)}
                    size={map_scale}
                    fill={() => {
                        var c = generator.nextInt(0, 2);
                        c *= 255;
                        return `rgb(${c},${c},${c})`
                    }}
                />
            )))}
        </Rect>
    </Frame>)

    view.add(<Frame
        ref={map_2}
        size={map_scale * 16 + frame}
        title={"'Sin' Map"}
        x={-500}
    >
        <Rect
            radius={32}
            clip
            size={map_scale * 16}
            stroke={"white"}
            lineWidth={2}
            shadowColor={"white"}
            shadowBlur={30}
        >
            {...range(-8, 8).map(x => range(-8, 8).map(y => (
                <Rect
                    position={new Vector2(x + 0.5, y + 0.5).mul(map_scale)}
                    size={map_scale}
                    fill={() => {
                        var s = Math.sin(x / 2) * Math.sin(y / 2) * 2; 
                        s += 2;
                        s /= 4;
                        const c = Math.floor(s * 255);
                        return `rgb(${c},${c},${c})`;
                    }}
                />
            )))}
        </Rect>
    </Frame>)

    view.add(<Title
        ref = {keyword_Smooth}
        text = "Smoothness"
        position={map_2().position}
        fill = {"rgb(249, 252, 60)"}
        shadowBlur={50}
        shadowColor={"rgb(249, 252, 60)"}
        zIndex={-1}
    />)
    view.add(<Title
        ref = {keyword_Random}
        text = "Randomness"
        position={map_1().position}
        fill = {"rgb(249, 252, 60)"}
        shadowBlur={50}
        shadowColor={"rgb(249, 252, 60)"}
        zIndex={-1}
    />)

    yield* waitUntil("smoothness");
    yield* all(
        keyword_Smooth().y(keyword_Smooth().y()+500, 1),
        map_2().shadowBlur(140, 1),
        map_2().shadowColor("rgb(249, 252, 60)", 1)
        );
    
    yield* waitUntil("randomness");
    yield* all(
        keyword_Random().y(keyword_Random().y()+500, 1),
        map_1().shadowBlur(140, 1),
        map_1().shadowColor("rgb(249, 252, 60)", 1)
    );

    yield* waitUntil("next");
}); 