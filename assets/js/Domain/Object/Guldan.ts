import CustomObject3D from "@js/Domain/Object/CustomObject3D";

export default class Guldan extends CustomObject3D {
    public castShadow: boolean = true;

    static async create() {
        return new Guldan().create();
    }
}