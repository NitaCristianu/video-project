import { Layout, LayoutProps, Rect, initial, signal, vector2Signal } from "@motion-canvas/2d";
import { Three } from "../libs/Three";
import { BoxGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, PointLight, RGBA_ASTC_10x10_Format, Scene, Vector3 } from "three";
import { SignalValue, SimpleSignal, useLogger } from "@motion-canvas/core";

export type block = "air" | "caveair" | "stone" | "grass" | "water" | "sand" | null;
export type get_block_type = (x: number, y: number, z: number) => block;
export type block_filter = (x: number, y: number, z: number, self: block, neighbors: block[]) => block;

export const BLOCK_COLOR = {
    'stone': new Color(0.5, 0.5, 0.5),
    'grass': new Color(0.7, 0.3, 0.2),
    'water': new Color(0.1, 0.3, .9),
    'sand': new Color(0.9, 0.5, 0.4)
}
export interface WorldProps extends LayoutProps {
    gridSize: SignalValue<Vector3>,
    blockFunc: get_block_type,
    blockFilters: block_filter[]
}

const logger = useLogger();
export class World extends Layout {

    private camera = new PerspectiveCamera(60);
    private scene = new Scene();
    private grid: block[][][] = [];

    private blockFunc: get_block_type = (x: number, y: number, z: number) => null;
    private blockFilters: block_filter[] = [];
    @initial(new Vector3(0, 0, 0))
    @signal()
    public declare readonly gridSize: SimpleSignal<Vector3, this>;

    private blockAt(x: number, y: number, z: number, arr?: block[][][]): block {
        const size = this.gridSize();
        if (x >= 0 && y >= 0 && z >= 0 && x < size.x && y < size.y && z < size.z) {
            if (arr)
                return arr[x][y][z];
            return this.grid[x][y][z];
        }
        return null;
    }

    private init_map() {
        for (let x = 0; x < this.gridSize().x; x++) {
            this.grid.push([]);
            for (let y = 0; y < this.gridSize().y; y++) {
                this.grid[x].push([]);
                for (let z = 0; z < this.gridSize().z; z++) {
                    this.grid[x][y].push(
                        this.blockFunc(x, y, z)
                    );
                }
            }
        }
    }



    private render_map() {
        const faces = [
            new Vector3(0, 1, 0),
            new Vector3(0, -1, 0),
            new Vector3(1, 0, 0),
            new Vector3(-1, 0, 0),
            new Vector3(0, 0, 1),
            new Vector3(0, 0, -1),
        ]
        for (let x = 0; x < this.gridSize().x; x++) {
            for (let y = 0; y < this.gridSize().y; y++) {
                for (let z = 0; z < this.gridSize().z; z++) {
                    const self = this.grid[x][y][z];
                    if (self == "air" || self == null || self == "caveair") continue;
                    if (self == "water") {
                        if (this.blockAt(x, y + 1, z) != "water"){
                            const plane = new PlaneGeometry(1, 1);
                            const camDir = this.camera.getWorldDirection(new Vector3());
                            let v = camDir.clone().dot(new Vector3(0, 1, 0));
                            if (v > 0) return;
                            v = -v * 0.8;
                            v *= v;
    
                            var mat = new MeshBasicMaterial({ color: BLOCK_COLOR[self].clone().multiplyScalar(v), transparent: true, opacity: 0.7 })
                            const mesh = new Mesh(plane, mat);
                            mesh.position.copy(new Vector3(x, y, z).add(new Vector3(0, 0.5, 0)))
                            mesh.lookAt(new Vector3(x, y, z).add(new Vector3(0, 0.9, 0)))
                            this.scene.add(mesh);
                        }
                        [new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1), new Vector3(0, 0, -1)].forEach(direction => {
                            const pos = new Vector3(x, y, z).add(direction);
                            const other = this.blockAt(pos.x, pos.y, pos.z);
                            if (other == "air" || other == null || other == "caveair") {
                                const height = this.blockAt(x,y+1,z) == "water" ? 1 : .9;
                                const plane = new PlaneGeometry(1, height);
                                const camDir = this.camera.getWorldDirection(new Vector3());
                                let v = camDir.clone().dot(direction.clone());
                                if (v > 0) return;
                                v = -v * 0.8;
                                v *= v;
                                var mat = new MeshBasicMaterial({ color: BLOCK_COLOR[self].clone().multiplyScalar(v), transparent: true, opacity: 0.7 })
                                const mesh = new Mesh(plane, mat);
                                mesh.position.copy(new Vector3(x, y - 0.05, z).add(direction.clone().divideScalar(2)));
                                mesh.lookAt(new Vector3(x, y, z).add(direction.clone()))
                                this.scene.add(mesh);
                            }
                        })
                        continue;
                    }
                    faces.forEach(direction => {
                        const pos = new Vector3(x, y, z).add(direction);
                        const other = this.blockAt(pos.x, pos.y, pos.z);
                        if (other == "air" || other == null || other == "water" || other == "caveair") {

                            const plane = new PlaneGeometry(1, 1);
                            const camDir = this.camera.getWorldDirection(new Vector3());
                            let v = camDir.clone().dot(direction.clone());
                            if (v > 0) return;
                            v = -v * 0.8;
                            v *= v;
                            var mat = new MeshBasicMaterial({ color: BLOCK_COLOR[self].clone().multiplyScalar(v) })
                            if (self == "grass" && direction.y == 1) {
                                mat = new MeshBasicMaterial({ color: new Color(0.4, .9, .5).multiplyScalar(v) })
                            }
                            const mesh = new Mesh(plane, mat);
                            mesh.position.copy(new Vector3(x, y, z).add(direction.clone().divideScalar(2)));
                            mesh.lookAt(new Vector3(x, y, z).add(direction.clone()))
                            this.scene.add(mesh);
                        }
                    })
                }
            }
        }
    }

    private apply_filters() {
        this.blockFilters.forEach(func => {
            const vals: block[][][] = [...this.grid];
            for (let x = 0; x < this.gridSize().x; x++)
                for (let y = 0; y < this.gridSize().y; y++)
                    for (let z = 0; z < this.gridSize().z; z++) {
                        console.log(vals[x][y][z]);
                        this.grid[x][y][z] = func(x, y, z, vals[x][y][z], [this.blockAt(x, y, z + 1, vals), this.blockAt(x, y, z - 1, vals), this.blockAt(x, y + 1, z, vals), this.blockAt(x, y - 1, z, vals), this.blockAt(x + 1, y, z, vals), this.blockAt(x - 1, y, z, vals)]);
                        console.log(this.grid[x][y][z]);
                    }



        })
    }

    public constructor(props?: WorldProps) {
        super({ ...props });
        const sizeX = this.gridSize().x;
        const sizeY = this.gridSize().y;
        const sizeZ = this.gridSize().z;
        const rad = Math.sqrt(sizeX * sizeX + sizeY * sizeY + sizeZ * sizeZ) * .28
        this.camera.position.set(-rad, rad*2 + sizeY, rad*2.5);
        this.camera.lookAt(new Vector3(sizeX / 2, sizeY / 2, sizeZ / 2));
        this.blockFunc = props.blockFunc;
        this.blockFilters = props.blockFilters;
        this.init_map();
        this.apply_filters();
        this.render_map();
        this.add(<Three
            width={this.width}
            height={this.height}
            camera={this.camera}
            scene={this.scene}
        />);
    }
}