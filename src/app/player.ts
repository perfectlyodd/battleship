export class Player {
    id: number;
    score: number = 0;

    constructor(values: Object = {}) {
        Object.assign(this, values);
    }
        // This constructor logic allows instantiation with the following syntax:
        // let player = Player({
        //      id: 1,
        //      score: 15
        // });
}
