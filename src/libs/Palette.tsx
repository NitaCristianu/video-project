import { Gradient } from "@motion-canvas/2d";
import { Color } from "@motion-canvas/core";

export const main1 = new Color("#99D5C9");
export const main2 = new Color("#6C969D");
export const sec1 = new Color("#645E9D");
export const sec2 = new Color("#392B58");
export const bgr = new Color("#000000");

export interface modParams {
    brighten?: number,
    darken? : number,
    saturate?: number,
    desaturate? : number,
    opacity? : number
}

export const modColor = (col: Color, mod: modParams) => {
    col = col.brighten(mod.brighten);
    col = col.darken(mod.darken);
    col = col.saturate(mod.saturate);
    col = col.desaturate(mod.desaturate);
    if (mod.opacity){
        const rgb = col.rgb(true);
        col = new Color(`rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${mod.opacity})`);
    }
    return col;
}

export const mix = (a: Color, b: Color | string, t: number) => {
    return a.mix(b, t);
}

export const bgr_grad = new Gradient({
        from  : [0, -600],
        to : [0, 1000],
        type : "linear",
        stops : [
            {offset : 0, color : bgr},
            {offset : 1, color : new Color('#040401')}
        ]
    })