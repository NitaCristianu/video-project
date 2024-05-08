import { Layout, LayoutProps, Rect, initial, signal, vector2Signal } from "@motion-canvas/2d";
import { Three } from "../libs/Three";
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, Texture, TextureLoader, Vector3, DoubleSide, BackSide, SpotLight, MeshStandardMaterial, PointLight, Light, AmbientLight, AxesHelper, Line, LineBasicMaterial, BufferGeometry, Group, ConeGeometry, CylinderGeometry, GridHelper } from 'three';
import { Color, Random, SignalValue, SimpleSignal, useLogger } from "@motion-canvas/core";

/// TEXTURES
import leaf_txt from "../assets/mc-blocks/block/oak_leaves.png"
import log_side_txt from "../assets/mc-blocks/block/oak_log.png";
import log_top_txt from "../assets/mc-blocks/block/oak_log_top.png";
import stone_txt from "../assets/mc-blocks/block/stone.png";
import grass_side_txt from "../assets/mc-blocks/block/grass_block_side.png";
import grass_top_txt from "../assets/mc-blocks/block/grass_block_top.png";
import grass_bottom_txt from "../assets/mc-blocks/block/dirt.png";
import sand_txt from "../assets/mc-blocks/block/sand.png";
import water_txt from "../assets/mc-blocks/block/water.png";
import { PerlinNoise } from "../(unused)/Perlin";

export type block_type = "leaf" | "log" | "air" | "caveair" | "stone" | "grass" | "water" | "sand" | null;
export type get_block_type = (x: number, y: number, z: number) => block_type;
export type face = 'front' | 'bottom' | 'right' | 'left' | 'top' | 'bottom';

const faces: { [key: string]: Vector3 } = {
    top: new Vector3(0, 1, 0),
    bottom: new Vector3(0, -1, 0),
    right: new Vector3(1, 0, 0),
    left: new Vector3(-1, 0, 0),
    front: new Vector3(0, 0, -1),
    back: new Vector3(0, 0, 1)
}

const texture_loader = new TextureLoader();

export interface PointLightProps {
    color?: Color,
    intensity?: number,
    decay?: number,
    distance?: number,
    position?: Vector3,
}

export interface AmbientLightProps {
    color?: Color,
    intensity?: number
}

export interface SurfaceLightProps {
    color?: Color,
    intensity?: number,
    decay?: number,
    distance?: number,
    position: Vector3,
    lookAt: Vector3,
    penumbra?: number,
    angle?: number
}

const textures: { [key: string]: { [key: string]: Texture } } = {
    'leaf': {
        'top': texture_loader.load(leaf_txt),
        'bottom': texture_loader.load(leaf_txt),
        'right': texture_loader.load(leaf_txt),
        'left': texture_loader.load(leaf_txt),
        'front': texture_loader.load(leaf_txt),
        'back': texture_loader.load(leaf_txt)
    },
    'log': {
        'top': texture_loader.load(log_top_txt),
        'bottom': texture_loader.load(log_top_txt),
        'right': texture_loader.load(log_side_txt),
        'left': texture_loader.load(log_side_txt),
        'front': texture_loader.load(log_side_txt),
        'back': texture_loader.load(log_side_txt)
    },
    'stone': {
        'top': texture_loader.load(stone_txt),
        'bottom': texture_loader.load(stone_txt),
        'right': texture_loader.load(stone_txt),
        'left': texture_loader.load(stone_txt),
        'front': texture_loader.load(stone_txt),
        'back': texture_loader.load(stone_txt)
    },
    'grass': {
        'top': texture_loader.load(grass_top_txt),
        'bottom': texture_loader.load(grass_bottom_txt),
        'right': texture_loader.load(grass_side_txt),
        'left': texture_loader.load(grass_side_txt),
        'front': texture_loader.load(grass_side_txt),
        'back': texture_loader.load(grass_side_txt)
    },
    'water': {
        'top': texture_loader.load(water_txt),
        'bottom': texture_loader.load(water_txt),
        'right': texture_loader.load(water_txt),
        'left': texture_loader.load(water_txt),
        'front': texture_loader.load(water_txt),
        'back': texture_loader.load(water_txt)
    },
    'sand': {
        'top': texture_loader.load(sand_txt),
        'bottom': texture_loader.load(sand_txt),
        'right': texture_loader.load(sand_txt),
        'left': texture_loader.load(sand_txt),
        'front': texture_loader.load(sand_txt),
        'back': texture_loader.load(sand_txt)
    }
}

const materials: { [key: string]: any } = {};
for (const [textureType, textureVariants] of Object.entries(textures)) {
    const materialVariants: { [key: string]: any } = {};
    for (const [direction, texture] of Object.entries(textureVariants)) {
        const material = new MeshStandardMaterial({ emissiveIntensity: 1.2, emissiveMap: texture, roughness: 0.2, metalness: .4, map: texture, side: DoubleSide });
        materialVariants[direction] = material;
    }
    materials[textureType] = materialVariants;
}

const geometry_template = new PlaneGeometry();

export interface ChunkProps extends LayoutProps {
    gridSize?: SignalValue<Vector3>,
    pointLights?: SignalValue<PointLightProps[]>,
    ambientLights?: SignalValue<AmbientLightProps[]>,
    surfaceLights?: SignalValue<SurfaceLightProps[]>,
    cameraPosition?: Vector3,
    renderAxis?: boolean
}

export class Block {

    public x: number;
    public y: number;
    public z: number;
    public type: block_type
    public position: Vector3;

    constructor(x: number, y: number, z: number, type: block_type) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.position = new Vector3(x, y, z);
        this.type = type;
    }

    isSolid() {
        return !(this.type == "air" || this.type == "caveair" || this.type == "leaf" || this.type == "water");
    }

    transform(type: block_type) {
        // changes the type
        this.type = type;
    }

    render(neighbours: { [key: string]: Block }, scene: Scene) {
        if (this.type == "air") return;
        if (this.type == "caveair") return;
        for (const [face, neighbour] of Object.entries(neighbours)) {
            if (neighbour && neighbour.isSolid()) continue;
            if (this.type == "water" && neighbour && neighbour.type == "water") continue ;
            var mat;
            mat = materials[this.type][face];
            var mesh;
            if (this.type == "grass" && Math.abs(faces[face].y) == 0 && neighbours.top && neighbours.top.isSolid()) {
                mat = materials.grass.bottom;
            }
            if (this.type == "water" && neighbours.top.type == "air") {
                if (faces[face].y == 0 ) {
                    mesh = new Mesh(new PlaneGeometry(1, 0.8), mat);
                    const position = new Vector3(this.x, this.y, this.z).add(faces[face].clone().divideScalar(2));
                    position.y -= 0.1;
                    mesh.position.copy(position);
                    mesh.lookAt(this.position.clone().add(faces[face]).add(new Vector3(0, -.1, 0)));
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.7;
                } else{
                    mesh = new Mesh(new PlaneGeometry(1, 1), mat);
                    const position = new Vector3(this.x, this.y, this.z).add(faces[face].clone().divideScalar(2));
                    position.y -= 0.2;
                    mesh.position.copy(position);
                    mesh.lookAt(this.position.clone().add(faces[face]).add(new Vector3(0, -.1, 0)));
                    mesh.material.transparent = true;
                    mesh.material.opacity = 0.7;
                }
            } else {
                mesh = new Mesh(geometry_template.clone(), mat);
                const position = new Vector3(this.x, this.y, this.z).add(faces[face].clone().divideScalar(2))
                mesh.position.copy(position);
                mesh.lookAt(this.position.clone().add(faces[face]));
            }
            scene.add(mesh);
        }
    }
}

export class Chunk extends Layout {

    public camera = new PerspectiveCamera(60, 1);
    public scene = new Scene();
    public grid: Block[][][] = [];
    public initialized: boolean = false;
    public ShouldRenderAxis: boolean = false;

    @initial(new Vector3(10, 10, 10))
    @signal()
    public declare readonly gridSize: SimpleSignal<Vector3, this>;

    @initial([])
    @signal()
    public declare readonly pointLights: SimpleSignal<PointLightProps[], this>;

    @initial([])
    @signal()
    public declare readonly surfaceLights: SimpleSignal<SurfaceLightProps[], this>;

    @initial([])
    @signal()
    public declare readonly ambientLights: SimpleSignal<AmbientLightProps[], this>;

    public blockAt(x: number, y: number, z: number): Block | null {
        const size = this.gridSize();
        if (x >= 0 && y >= 0 && z >= 0 && x < size.x && y < size.y && z < size.z) {
            return this.grid[x][y][z];
        }
        return null;
    }

    public init_chunk(blockFunc: get_block_type) {
        for (let x = 0; x < this.gridSize().x; x++) {
            this.grid.push([]);
            for (let y = 0; y < this.gridSize().y; y++) {
                this.grid[x].push([]);
                for (let z = 0; z < this.gridSize().z; z++) {
                    this.grid[x][y].push(
                        new Block(x, y, z, blockFunc(x, y, z))
                    );
                }
            }
        }
        this.initialized = true;
    }

    public setup_chunk(blockFunc: get_block_type) {
        for (let x = 0; x < this.gridSize().x; x++)
            for (let y = 0; y < this.gridSize().y; y++)
                for (let z = 0; z < this.gridSize().z; z++)
                    this.grid[x][y][z].transform(blockFunc(x, y, z));
    }

    public insert_trees(generator: Random) {
        const gs = this.gridSize();

        const tree_noise = new PerlinNoise(generator.intArray(256, 0, 360));
        for (let x = 0; x < gs.x; x++) {
            for (let z = 0; z < gs.z; z++) {
                var height = 0;
                for (let y = gs.y - 1; y >= 0; y--) {
                    const b = this.blockAt(x, y, z);
                    if (b && b.type == "grass") {
                        height = y;
                        break;
                    }
                }
                if (height == 0) continue;
                const v = tree_noise.noise((x + generator.nextInt(1, 100)) / 10, (z + generator.nextInt(1, 200)) / 10, 0, 0, 1);
                if (v > 0.6 && generator.nextFloat(0, 1) > 0.9) {
                    // PLACE TREE
                    let y = 0;
                    const r = generator.nextInt(2, 4);
                    for (y = height + 1; y < height + r + 1; y++) {
                        if (this.blockAt(x, y, z)) {
                            this.grid[x][y][z].transform('log');
                        }
                    }
                    const l_h = height + r;
                    for (y = y - 1; y < l_h + 2; y++) {
                        for (let ox = -2; ox <= 2; ox++) {
                            for (let oz = -2; oz <= 2; oz++) {
                                if (this.blockAt(x + ox, y + 1, z + oz)) {
                                    this.grid[x + ox][y + 1][z + oz].transform('leaf');
                                }
                            }
                        }
                    }
                    for (y = y; y < l_h + 4; y++) {
                        for (let ox = -1; ox <= 1; ox++) {
                            if (this.blockAt(x + ox, y + 1, z)) {
                                this.grid[x + ox][y + 1][z].transform('leaf');
                            }
                        }
                        for (let oz = -1; oz <= 1; oz++) {
                            if (this.blockAt(x, y + 1, z + oz)) {
                                this.grid[x][y + 1][z + oz].transform('leaf');
                            }

                        }
                    }
                }

            }
        }
    }

    public render_chunk() {
        for (let x = 0; x < this.gridSize().x; x++)
            for (let y = 0; y < this.gridSize().y; y++)
                for (let z = 0; z < this.gridSize().z; z++) {
                    this.grid[x][y][z].render({
                        top: this.blockAt(x, y + 1, z),
                        bottom: this.blockAt(x, y - 1, z),
                        right: this.blockAt(x + 1, y, z),
                        left: this.blockAt(x - 1, y, z),
                        front: this.blockAt(x, y, z - 1),
                        back: this.blockAt(x, y, z + 1)
                    }, this.scene);
                }
    }

    public lighting() {
        this.pointLights().forEach(d => {
            const l = new PointLight(
                d.color ? d.color.hex() : null,
                d.intensity,
                d.distance,
                d.decay
            );
            l.position.copy(d.position || new Vector3(0, 0, 0));
            this.scene.add(l);
        });

        this.surfaceLights().forEach(d => {
            const l = new SpotLight(
                d.color ? d.color.hex() : null,
                d.intensity,
                d.distance,
                d.angle,
                d.penumbra,
                d.decay
            )
            l.position.copy(d.position);
            l.lookAt(d.lookAt);
            this.scene.add(l);
        });

        this.ambientLights().forEach(d =>
            this.scene.add(new AmbientLight(d.color ? d.color.hex() : null, d.intensity))
        );
    }

    public setCamera(position: Vector3) {
        this.camera.position.copy(position);
        this.camera.lookAt(position.multiplyScalar(0.75).sub(new Vector3(0, 1, 0)));
    }

    constructor(props?: ChunkProps) {
        super({ ...props });
        this.ShouldRenderAxis = props.renderAxis ? props.renderAxis : false;
        this.camera.position.copy(props.cameraPosition || new Vector3(0, 0, 0));
        this.add(<Three
            width={this.width}
            height={this.height}
            camera={this.camera}
            scene={this.scene}
        />)
    }

    RenderWorld(criteria: get_block_type, generator?: Random) {
        this.scene.clear();
        if (this.ShouldRenderAxis) {
            const xAxisMaterial = new MeshBasicMaterial({ color: "rgb(250, 84, 84)" });
            const xAxisCylinder = new Mesh(new CylinderGeometry(.2, .2, this.gridSize().x + 1, 5), xAxisMaterial);
            xAxisCylinder.position.sub(new Vector3(-this.gridSize().x / 2, 0.5, 0.5));
            xAxisCylinder.rotateZ(Math.PI / 2);
            this.scene.add(xAxisCylinder);
            const zAxisMaterial = new MeshBasicMaterial({ color: "rgb(110, 143, 233)" });
            const zAxisCylinder = new Mesh(new CylinderGeometry(.2, .2, this.gridSize().z + 1, 5), zAxisMaterial);
            zAxisCylinder.position.sub(new Vector3(.5, 0.5, -this.gridSize().z / 2));
            zAxisCylinder.rotateX(Math.PI / 2);
            this.scene.add(zAxisCylinder);
            const yAxisMaterial = new MeshBasicMaterial({ color: "rgb(131, 233, 110)" });
            const yAxisCylinder = new Mesh(new CylinderGeometry(.2, .2, this.gridSize().y + 1, 5), yAxisMaterial);
            yAxisCylinder.position.sub(new Vector3(0.5, -this.gridSize().y / 2, 0.5));
            this.scene.add(yAxisCylinder);
            const grid_mat = new LineBasicMaterial({ color: "white", transparent: true, opacity: .1 })
            const gridY = new GridHelper(this.gridSize().x + 1000, this.gridSize().x + 1000);
            gridY.material = grid_mat;
            gridY.position.add(new Vector3(8, -.5, 8));
            this.scene.add(gridY);
        }
        if (!this.initialized)
            this.init_chunk(criteria);
        else
            this.setup_chunk(criteria);
        if (generator) this.insert_trees(generator);
        const gs = this.gridSize();
        this.scene.position.set(-gs.x / 2, -gs.y / 2, -gs.z / 2);

        this.lighting();
        this.render_chunk();
    }
}