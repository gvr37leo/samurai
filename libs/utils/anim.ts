
class SpriteAnimation{

    constructor(data:Partial<SpriteAnimation>){
        Object.assign(this,data)
    }

    imageatlas
    spritesize
    

    startpos
    direction
    framecount
    duration

    
}

function drawAnimation(pos:Vector,animation:SpriteAnimation,time,flipx = false,centered = true){
    if(centered){
        pos = pos.c().sub(animation.spritesize.c().scale(0.5))
    }
    var frame = Math.floor(map(time % animation.duration,0,animation.duration,0,animation.framecount))
    if(flipx){
        var center = pos.c().add(animation.spritesize.c().scale(0.5))
        ctxt.save()
        ctxt.translate(center.x,center.y)
        ctxt.scale(-1,1)
        ctxt.translate(-center.x,-center.y)
        
    }
    drawAtlasImage(pos,animation.startpos.c().add(animation.direction.c().scale(frame)),animation.spritesize,animation.imageatlas)
    if(flipx){
        ctxt.restore()
    }
}

function drawAtlasImage(absdstpos:Vector,srctile:Vector,tilesize:Vector,image){
    var abssrc = srctile.c().mul(tilesize)
    ctxt.drawImage(image,abssrc.x,abssrc.y,tilesize.x,tilesize.y,absdstpos.x,absdstpos.y,tilesize.x,tilesize.y)
}

enum AnimType{once,repeat,pingpong,extend}

class Anim{
    animType:AnimType = AnimType.once
    reverse:boolean = false
    duration:number = 1000
    stopwatch:StopWatch = new StopWatch()
    begin:number = 0
    end:number = 1

    constructor(){

    }

    get():number{
        var cycles = this.stopwatch.get() / this.duration

        switch (this.animType) {
            case AnimType.once:
                return clamp(lerp(this.begin,this.end,cycles),this.begin,this.end) 
            case AnimType.repeat:
                return lerp(this.begin,this.end,mod(cycles,1))
            case AnimType.pingpong:
                
                var pingpongcycle = mod(cycles, 2)
                if(pingpongcycle <= 1){
                    return lerp(this.begin,this.end,pingpongcycle)
                }else{
                    return lerp(this.end,this.begin,pingpongcycle - 1)
                }

            case AnimType.extend:
                var distPerCycle = to(this.begin,this.end)
                return Math.floor(cycles) * distPerCycle + lerp(this.begin,this.end,mod(cycles,1))
        }
    }
}
