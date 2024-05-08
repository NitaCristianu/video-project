import { Circle, Gradient, initial, Rect, RectProps, signal, Txt } from "@motion-canvas/2d";
import frame_bgr from "../shaders/frameBgr1.glsl";
import { range, SignalValue, SimpleSignal, useRandom } from "@motion-canvas/core";
import { Title } from "./title";

export interface FrameProps extends RectProps {
    title?: SignalValue<string>;
}
export class Frame extends Rect {

    @initial("")
    @signal()
    public declare readonly title: SimpleSignal<string, this>;

    constructor(props?: FrameProps) {
        const gen = useRandom(0);
        const highlight = gen.nextFloat(0.3, 0.7);
        const gradient = new Gradient({
            type: "linear",
            from: -800,
            to: 800,
            stops: [{
                offset: 0, color: "#ffffffbb",
            },
            {
                offset: highlight-0.05, color: "#555555"
            },
            {
               offset: highlight, color: "#ffffff"
            },
            {
                offset: highlight+.05, color: "#555555"
            },
            {
                offset: 1, color: "#555555"
            },

            ]
        });

        super({
            lineWidth: 3,
            stroke: gradient,
            radius: 32,
            ...props,
        });
        this.add(this.title().length > 0 ? <Rect
            size={() => [this.size().x - 100, 75]}
            position={() => [0, -this.size().y / 2]}
            stroke={"rgba(255,255,255,0.4)"}
            lineWidth={3}
            fill="rgba(1,1,1,1)"
            radius={32}
            zIndex={-1}
            shaders={{
                fragment: frame_bgr,
                uniforms: {
                    blur: 30,
                    scale: 1.4,
                }
            }}
        /> : null);
        this.add(this.title().length > 0 ? <Title
            text={this.title}
            x={() => this.size().x <= 800 ? -100 : 0}
            fill="white"
            position={() => [0, -this.size().y / 2 + 5]}
            fontWeight={100}
            fontSize={45}
        /> : null);
        this.add(this.title().length > 0 ?
            <Rect
                layout
                right={() => [this.size().x / 2 - 50, -this.size().y / 2]}
                gap={20}
                padding={50}
            >
                {...range(0, 3).map(i => <Circle
                    size={30}
                    stroke={"rgba(255,255,255,0.6)"}
                    lineWidth={2}
                />)}
            </Rect>
            : null);
        this.add(<Rect
            size={this.size}
            zIndex={-2}
            radius={32}
            fill="rgba(0,0,0,1)"
            shaders={{
                fragment: frame_bgr,
                uniforms: {
                    blur: 30,
                    scale: 1,
                }
            }}
        />)
    }

}