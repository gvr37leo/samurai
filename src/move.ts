
class Move{
    from:Vector
    to:Vector
    dest:Game

    constructor(data:Partial<Move>){
        Object.assign(this,data)
    }
}