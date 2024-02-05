class Vector{
    x:number
    y:number

    constructor(x:number,y:number){
        this.x = x
        this.y = y
    }

    add(v:Vector):Vector{
        this.x += v.x
        this.y += v.y
        return this
    }

    sub(v:Vector):Vector{
        this.x -= v.x
        this.y -= v.y
        return this
    }

    c():Vector{
        return new Vector(this.x,this.y)
    }

    overwrite(v:Vector):Vector{
        this.x = v.x
        this.y = v.y
        return this
    }

    equals(v:Vector):boolean{
        return this.x == v.x && this.y == v.y
    }

    to(v:Vector):Vector{
        return v.c().sub(this)
    }
}