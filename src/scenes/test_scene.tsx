import { makeScene2D } from "@motion-canvas/2d"
import { Color, createRef, waitUntil } from "@motion-canvas/core"
import { Chunk } from "../minecraft-render/chunk-engine";
import { Vector3 } from "three";

export default makeScene2D(function* (view){
    const chunk = createRef<Chunk>();
    view.add(<Chunk
        ref = {chunk}
        gridSize={new Vector3(16, 16, 16)}
        ambientLights={[{color : new Color("white"), intensity : 0.8}]}
        size = "100%"
    />);

    chunk().setCamera(new Vector3(-17,8,-17))
    chunk().RenderWorld((x:number,y:number,z:number)=>{
        if (x%2 == y%2 && y%2 == z%2){
            return 'grass';
        }
        return 'air';
    })

    yield* waitUntil("next");
})