import { Txt, TxtProps } from "@motion-canvas/2d";
import { bgr, modColor } from "./Palette";

export interface TitleProps extends TxtProps {

}

export class Title extends Txt {
    constructor(props? : TxtProps){
        super({
            fontFamily : "Poppins",
            fontWeight : 800,
            fill : "rgb(235, 239, 254)",
            fontSize : 62,
            ...props})
    }
}