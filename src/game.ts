
class Game{
    teamturn = 0
    lastmovelength = -1
    activeIcon = Cel.empty
    specialUsed = [false,false]
    samurailist = [
        new Samurai({pos:new Vector(3,0),team:0}),
        new Samurai({pos:new Vector(4,0),team:0}),
        new Samurai({pos:new Vector(6,0),team:0}),
        new Samurai({pos:new Vector(7,0),team:0}),
        
        new Samurai({pos:new Vector(3,10),team:1}),
        new Samurai({pos:new Vector(4,10),team:1}),
        new Samurai({pos:new Vector(6,10),team:1}),
        new Samurai({pos:new Vector(7,10),team:1}),
    ]
    
    
    selected:Samurai = null
    legalMoves:Move[] = []
    // children:Game[] = []
    parent:Game = null
    score: number = null
    heuristic: number = null
    element: HTMLElement
    funccallid: number
    hashval: string


    constructor(data:Partial<Game> = {}){
        Object.assign(this,data)
    }

    copy(){
        var copy = new Game()
        copy.teamturn = this.teamturn
        copy.lastmovelength = this.lastmovelength
        copy.activeIcon = this.activeIcon
        copy.samurailist = this.samurailist.map((s) => s.copy())
        copy.legalMoves = this.legalMoves.slice()
        copy.specialUsed = this.specialUsed.slice()
        // this.children.push(copy)
        copy.parent = this
        return copy
    }


    hash(){
        var res = ''
        res += this.activeIcon.toString()
        res += ":"
        res += this.teamturn.toString()
        res += ":"
        res += this.lastmovelength.toString()
        for(var sam of this.samurailist){
            res += ":"
            res += sam.pos.x.toString()
            res += ":"
            res += sam.pos.y.toString()
            res += ":"
            res += sam.team.toString()
        }
        return res
    }

    stringify(){
        var res = {}
        res['teamturn'] = this.teamturn
        res['lastmovelength'] = this.lastmovelength
        res['activeIcon'] = this.activeIcon
        res['samurailist'] = []
        for(var sam of this.samurailist){
            var samdata = {}
            samdata['pos'] = sam.pos
            samdata['team'] = sam.team
            samdata['moved'] = sam.moved
            res['samurailist'].push(samdata)
        }
        return JSON.stringify(res)
    }

    static load(json){
        var data = JSON.parse(json)
        var res = new Game()
        res.teamturn = data['teamturn']
        res.lastmovelength = data['lastmovelength']
        res.activeIcon = data['activeIcon']
        res.samurailist = []
        for(var sam of data['samurailist']){
            var samdata = new Samurai(sam)
            samdata.pos = new Vector(sam['pos']['x'],sam['pos']['y'])
            res.samurailist.push(samdata)
        }
        return res
    }
}