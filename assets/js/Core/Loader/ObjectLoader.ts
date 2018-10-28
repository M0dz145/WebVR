import {Group, MaterialCreator} from "three";
import {MTLLoader, OBJLoader} from "three-obj-mtl-loader";
import ObjectFileLoader from "@js/Core/Loader/ObjectFileLoader";
import ObjectCacheLoaderCollection from "@js/Core/Loader/ObjectCacheLoaderCollection";
import EnvironmentService from "@js/Service/EnvironmentService";
import {Inject} from "typescript-ioc";

export default class ObjectLoader {
    private static objectCacheCollection = new ObjectCacheLoaderCollection();
    @Inject
    private environmentService: EnvironmentService;
    private onProgressCallback: Function;

    constructor() {
        new ObjectFileLoader();

        this.onProgressCallback = xhr => {
            if (this.environmentService.isDevelopmentEnvironment()) {
                console.info(`${Math.floor(xhr.loaded / xhr.total * 100)}% loaded`);
            }
        }
    }

    /**
     * Load an 3D object with file name parameter
     * @param modelName
     */
    public load(modelName: string): Promise<Group> {
        return new Promise((resolve, reject) => {
            // Search object in cache collection
            const objectCache = ObjectLoader.objectCacheCollection.findObject(modelName);
            // If object exist in cache collection
            if (objectCache !== null) {
                // Return a clone of this object
                return resolve(Object.assign({}, objectCache.object));
            }

            const objectContent = require(`@js/Models/${modelName}/${modelName}.obj`) as string,
                match = /mtllib (.+)\.mtl/gi.exec(objectContent),
                MTLFileName = match[1];

            if (!MTLFileName) {
                throw 'MTL file not found in .obj';
            }

            const textures = require(`@js/Models/${modelName}/${MTLFileName}.mtl`),
                mtlLoader = new MTLLoader();

            mtlLoader.setTexturePath('/models/');
            mtlLoader.load(textures, (materials: MaterialCreator) => {
                materials.preload();

                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                const object = objLoader.parse(objectContent);
                resolve(object);
                // debugger
                // objLoader.load(
                //     // Resource URL
                //     object,
                //     // Called when resource is loaded
                //     (group) => {
                //         // Add object to cache system
                //         ObjectLoader.objectCacheCollection.add(new ObjectCacheLoader(modelName, group));
                //         resolve(group);
                //     },
                //     // Called when loading is in progresses
                //     this.onProgressCallback,
                //     // Called when loading has errors
                //     error => {
                //         console.error(error);
                //         reject(error);
                //     }
                // );
            }, () => {
            }, error => {
                console.error(error);
                reject(error);
            });
        });
    }

    /**
     * On progress 3D model load callback
     * @param callback
     */
    public onProgress(callback: Function): void {
        this.onProgressCallback = callback;
    }
}