

class Samurai{
    pos:Vector
    team:number
    moved:boolean = false

    constructor(data:Partial<Samurai>){
        Object.assign(this,data)
    }

    copy(){
        return new Samurai({pos:this.pos.c(),team:this.team,moved:this.moved})
    }
}