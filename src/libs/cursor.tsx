import { Path, PathProps, Rect, RectProps } from "@motion-canvas/2d";
import { PossibleVector2, Vector2, createSignal, SimpleVector2Signal, tween, easeInOutCirc, easeInOutCubic, easeOutCubic, easeInCubic } from "@motion-canvas/core";

export interface CursorProps extends RectProps {

}

export class Cursor extends Rect {

      public constructor(props?: CursorProps) {
            super({
                  scale: 0,
                  ...props
            });
            this.add(<Path
                  data="M 16.5056 6.7754 C 17.1225 6.5355 17.431 6.4155 17.5176 6.2459 C 17.5926 6.099 17.5903 5.9245 17.5115 5.7795 C 17.4205 5.6123 17.109 5.5004 16.486 5.2768 L 0.5963 -0.4272 C 0.0866 -0.6102 -0.1683 -0.7016 -0.3349 -0.6439 C -0.4797 -0.5938 -0.5936 -0.48 -0.6437 -0.3351 C -0.7014 -0.1685 -0.6099 0.0864 -0.427 0.596 L 5.277 16.4858 C 5.5006 17.1088 5.6125 17.4203 5.7797 17.5113 C 5.9246 17.5901 6.0991 17.5924 6.2461 17.5174 C 6.4157 17.4308 6.5356 17.1223 6.7756 16.5054 L 9.3724 9.8278 C 9.4194 9.707 9.4429 9.6466 9.4792 9.5957 C 9.5114 9.5506 9.5508 9.5112 9.5959 9.479 C 9.6468 9.4427 9.7072 9.4192 9.828 9.3722 L 16.5056 6.7754 Z"
                  fill="black"
                  stroke="white"
                  lineWidth={1}
                  scale={3}
                  rotation={15}
            />)

      }

      *click(duration?: number) {
            if (!duration) duration = 0.3;
            yield* this.scale(.8, duration / 2).to(1, duration / 2);
      }

      *hold(duration?: number) {
            if (!duration) duration = 0.3;
            if (this.scale().x > 0.75)
                  yield* this.scale(0.75, duration, easeInOutCirc);
            else
                  yield* this.scale(1, duration, easeInOutCirc)

      }

      *pop(duration?: number) {
            if (!duration) duration = 0.3;
            if (this.scale().x > 0.74) {
                  yield* this.scale(0, duration, easeInCubic);
            } else {
                  yield* this.scale(1, duration, easeOutCubic);
            }

      }

      *to(to: Vector2 | number[], duration?: number, ratio?: number) {
            if (!ratio) ratio = 0.5;
            if (!duration) duration = 1;
            if (Array.isArray(to)) to = new Vector2(to[0], to[1]);
            const initial = this.position();
            const norm1 = initial.div(1500);
            const norm2 = to.div(1500);
            duration *= norm1.sub(norm2).magnitude * 2;
            const lerp = Vector2.createArcLerp(false, ratio);
            yield* tween(duration, (t) => {
                  this.position(lerp(initial, to, easeInOutCubic(t)));
            })
      }

}