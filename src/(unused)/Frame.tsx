import { Rect, RectProps } from "@motion-canvas/2d";
import { bgr, main1, main2, modColor, sec1 } from "../libs/Palette";
import FrameBgr from "../shaders/frameBgr.glsl";
import { all, chain, DEFAULT, delay, easeInBack, easeOutBack, easeOutCubic } from "@motion-canvas/core";

export interface FrameProps extends RectProps {

}

export class Frame extends Rect {
    constructor(props?: FrameProps) {
        super({
            y: 50,
            opacity: 0,
            ...props,
        });
        this.add(<Rect
            size={this.size}
            fill={modColor(bgr, { brighten: 1.2, saturate: 1.4, opacity: 0.9 })}
            stroke={"white"}
            lineWidth={10}
            shadowColor={modColor(bgr, { desaturate: 1.5, darken: 4, opacity: 0.2 })}
            shadowOffset={20}
            radius={32}
            shaders={{
                fragment : FrameBgr,
                uniforms : {
                    offset : this.position,
                    size : ()=>this.size().mul(this.scale())
                }
            }}
            zIndex={-1}
        />)
    }

    *In(time: number = 0.33, shouldWait?: boolean) {
        if (shouldWait) {
            yield* all(
                this.y(this.y() - 50, time, easeOutCubic),
                this.opacity(DEFAULT, time, easeOutCubic),
                this.size(this.size().add([100, 200]), time, easeOutBack)
            );
        }
        else
            yield all(
                this.y(this.y() - 50, time, easeOutCubic),
                this.opacity(1, time, easeOutCubic),
                this.size(this.size().add([100, 200]), time, easeOutBack)
            );
    }

    *Out(time: number = 0.33, shouldWait?: boolean) {
        if (shouldWait) {
            yield* all(
                this.y(this.y() + 50, time, easeOutCubic),
                this.opacity(0, time, easeOutCubic),
                this.size(this.size().add([-100, -200]), time, easeOutBack)
            );
        }
        else {
            yield all(
                this.y(this.y() + 50, time, easeOutCubic),
                this.opacity(0, time, easeOutCubic),
                this.size(this.size().add([-100, -200]), time * 1.2, easeOutBack)
            )
        }
    }
}