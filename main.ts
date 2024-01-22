/// <reference path="libs/vector/vector.ts" />
/// <reference path="libs/utils/rng.ts" />
/// <reference path="libs/utils/store.ts" />
/// <reference path="libs/utils/table.ts" />
/// <reference path="libs/utils/utils.ts" />
/// <reference path="libs/utils/stopwatch.ts" />
/// <reference path="libs/utils/ability.ts" />
/// <reference path="libs/utils/anim.ts" />
/// <reference path="libs/rect/rect.ts" />
/// <reference path="libs/event/eventqueue.ts" />
/// <reference path="libs/event/eventsystem.ts" />
/// <reference path="libs/utils/camera.ts" />
/// <reference path="libs/networking/entity.ts" />
/// <reference path="libs/networking/server.ts" />
/// <reference path="libs/utils/domutils.js" />
/// <reference path="src/samuraiAI.ts" />
/// <reference path="src/game.ts" />
/// <reference path="src/move.ts" />
/// <reference path="src/samurai.ts" />
/// <reference path="src/utils.ts" />







var screensize = new Vector(document.documentElement.clientWidth,document.documentElement.clientHeight)
var crret = createCanvas(screensize.x,screensize.y)
var canvas = crret.canvas
var ctxt = crret.ctxt
var maxSpecialMoveLength = 7

//uneven to do heuristic on enemy, tells you how bad the enemy is doing
//even to get heuristic on self, tells you how good you're doing
var searchdepth = 3
var rng = new RNG(0)

enum Cel{empty,dragon,eagle,sword,coin,special}
var celcolors = ["white","red","blue","brown","yellow","purple"]
var board = [
    [0,4,3,0,0,4,0,0,1,2,0],
    [1,0,0,4,2,0,1,3,0,0,4],
    [2,0,0,1,3,0,2,4,0,0,1],
    [0,4,1,0,0,3,0,0,2,3,0],
    [0,3,2,0,1,2,4,0,1,4,0],
    [1,0,0,4,3,0,1,2,0,0,3],
    [0,2,3,0,2,4,3,0,4,1,0],
    [0,1,4,0,0,1,0,0,3,2,0],
    [3,0,0,1,2,0,3,4,0,0,2],
    [2,0,0,4,3,0,1,2,0,0,3],
    [0,4,2,0,0,2,0,0,1,4,0],
]

var directions = [
    new Vector(1,0),
    new Vector(-1,0),
    new Vector(0,1),
    new Vector(0,-1),
    new Vector(1,1),
    new Vector(-1,-1),
    new Vector(1,-1),
    new Vector(-1,1),
]


interface HTMLElement {
    on(event,cb): HTMLElement;
}


var displaygame = new Game()
displaygame.legalMoves = generateLegalMoves(displaygame)

startContext(document.querySelector('#buttons'))
    crend('button','heuristic').on('click',() => {
        console.log(heuristic(displaygame))
    })
    crend('button','search').on('click',() => {
        findBestMoves(displaygame,searchdepth)
        rendergametreeRoot(displaygame) 
    })
endContext()


//mouseclick-------------------------
document.addEventListener('mousedown',(e) => {
    let x = Math.floor(e.clientX / 50)
    let y = Math.floor(e.clientY / 50)
    var mousepos = new Vector(x,y)

    if(displaygame.selected == null){
        let sam = displaygame.samurailist.find((s) => s.pos.equals(mousepos))
        displaygame.selected = sam
    }else{
        var legalmove = displaygame.legalMoves.find(m => m.from.equals(displaygame.selected.pos) && m.to.equals(mousepos))
        if(legalmove == null){
            displaygame.selected = null
            return
        }
        // displaygame.copy()
        moveSamurai(displaygame,legalmove)
        displaygame.selected = null
        if(displaygame.legalMoves.length == 0){
            console.log('game over')
            console.log('team ' + displaygame.teamturn + ' lost')
            return
        }

        // findBestMoves(displaygame,searchdepth)


        rendergametreeRoot(displaygame)
    }
})

loop((dt) => {

    //rendering-------------------------
    ctxt.fillStyle = "black"
    ctxt.fillRect(0,0,screensize.x,screensize.y)

    var shownmoves = displaygame.legalMoves
    if(displaygame.selected){
        shownmoves = displaygame.legalMoves.filter((m) => m.from.equals(displaygame.selected.pos))
    }
    for(var move of shownmoves){
        ctxt.fillStyle = "grey"
        ctxt.fillRect(move.to.x * 50,move.to.y * 50,50,50)
    }
    
    for(let i = 0; i < displaygame.samurailist.length; i++){
        let x = displaygame.samurailist[i].pos.x * 50
        let y = displaygame.samurailist[i].pos.y * 50
        if(displaygame.samurailist[i].team == 0){
            ctxt.fillStyle = "green"
        }
        if(displaygame.samurailist[i].team == 1){
            ctxt.fillStyle = "orange"
        }
        ctxt.fillRect(x,y,50,50)
    }
    
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            let x = j * 50
            let y = i * 50
            ctxt.fillStyle = celcolors[board[i][j]]
            ctxt.fillRect(x + 10,y + 10,30,30)
        }
    }

    if(displaygame.selected != null){
        ctxt.fillStyle = "rgba(0,0,0,0.5)"
        ctxt.fillRect(displaygame.selected.pos.x * 50,displaygame.selected.pos.y * 50,50,50)
    }

    ctxt.fillStyle = "white"
    ctxt.fillText('teamturn: ' + displaygame.teamturn.toString(),550,10)
    ctxt.fillText('active icon: ' + displaygame.activeIcon.toString(),550,20)
    ctxt.fillText('movelength: ' + displaygame.lastmovelength.toString(),550,30)

})

function moveSamurai(game:Game,move:Move){
    let sam = game.samurailist.find((s) => s.pos.equals(move.from))

    //todo check if valid movement
    //check if first touchedicon is activeicon
    
    if(game.teamturn != sam.team){
        console.log('invalid : not your turn')
        return
    }
    
    if(game.legalMoves.some(m => m.from.equals(move.from) && m.to.equals(move.to)) == false){
        console.log('invalid : not a legal move')
        return
    }

    sam.moved = true
    // if(board[move.to.y][move.to.x] == Cel.special){
    //     game.lastmovelength = -1
    //     game.activeIcon = Cel.empty
    // }else{
        var src2dst = move.from.to(move.to)
        var movedist = Math.max(Math.abs(src2dst.x),Math.abs(src2dst.y))
        game.activeIcon = board[move.to.y][move.to.x]
        game.teamturn = (game.teamturn + 1) % 2
        game.lastmovelength = movedist
    // }
    sam.pos.overwrite(move.to)
    game.legalMoves = generateLegalMoves(game)
}



function generateLegalMoves(game:Game,teamturn:number = game.teamturn){
    var legalMoves:Move[] = []

    for(var sam of game.samurailist.filter((s) => s.team == teamturn)){//foreach samurai of current team
        loop:for(var dir of directions){//foreach direction
            var current = sam.pos.c()
            var hasIconBeenTouched = false

            var maxlength = game.lastmovelength == -1 ? maxSpecialMoveLength : game.lastmovelength + 1
            for(var i = 0; i < maxlength;i++){
                current.add(dir)

                if(current.x < 0 || current.x >= board[0].length || current.y < 0 || current.y >= board.length){
                    continue loop
                }

                if(game.samurailist.find((s) => s.pos.equals(current) && s != sam)){
                    continue loop
                }

                var currentIcon = board[current.y][current.x]
                if(game.activeIcon != Cel.empty && currentIcon != Cel.empty){
                    if(currentIcon == game.activeIcon){
                        hasIconBeenTouched = true
                    }else if(hasIconBeenTouched == false){
                        continue loop
                    }
                }

                if((Math.abs(to(i,game.lastmovelength)) <= 1 || game.lastmovelength == -1) && (hasIconBeenTouched == true || game.activeIcon == Cel.empty)){
                    legalMoves.push(new Move({from:sam.pos.c(),to:current.c()}))
                }
            }
        }
    }
    return legalMoves
}


function rendergametreeRoot(game:Game){
    document.querySelector('#treebase').innerHTML = ''
    startContext(document.querySelector('#treebase'))
    cr('ul',{id:'myUL'})
    rendergametree(game)
    end()
    endContext()
}

function rendergametree(game:Game){
    if(game.children.length == 0){
        game.element = crend('li',gameText(game),{style:'cursor:pointer'})
        game.element.addEventListener("click", () => {
            displaygame = game
        })
    }else{
        var classobject = {}
        if(game.parent != null){
            classobject['class'] = 'nested'
        }
        game.element = cr('li',{})
            let caret = crend('span','',{})
            caret.innerHTML = '&#9658;'
            let span = crend('span',gameText(game),{class:'caret',style:'cursor:pointer'})
            span.addEventListener("click", () => {
                nested.classList.toggle("active");
                span.classList.toggle("caret-down");
                displaygame = game
            })
            let nested = cr('ul',classobject)
                for(let child of game.legalMoves){
                    rendergametree(child.dest)
                }
            end()
        end()
    }

    if(game.teamturn == 0){
        game.element.style.background = 'green'
    }else{
        game.element.style.background = 'orange'
    }
}

function gameText(game:Game){
    return `${game.score?.toFixed(1) ?? '?'}`
    // if(game.children.length == 0){
    //     return `${game.score.toFixed(1)}`
    // }else{
    //     return `${game.children.length}:${game.score.toFixed(1)}`
    // }
}
