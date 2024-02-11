/// <reference path="libs/vector/vector2.ts" />
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
var celsize = new Vector(50,50)

console.log(window.location.href)

var imageurls = [
    '/images/blank.png',
    '/images/dragon.png',
    '/images/bird.png',
    '/images/sword.png',
    '/images/coin.png',
    '/images/special.png',
    '/images/start.png',
]

if(window.location.href.includes('github')){
    imageurls = imageurls.map((url) => '/samurai' + url)
}

var images = imageurls.map((url) => {
    var img = new Image()
    img.src = url
    return img
})
//todo
//suggest best move
//suggest random move
//improve treeview

//special tile fix
//fix non deterministic bug

//uneven to do heuristic on enemy, tells you how bad the enemy is doing
//even to get heuristic on self, tells you how good you're doing
var searchdepth = 3
var rng = new RNG(0)

enum Cel{empty,dragon,eagle,sword,coin,special}
var celcolors = ["white","red","blue","brown","yellow","purple"]
var iconNames = ["empty","dragon","eagle","sword","coin","special"]

var board = [
    [0,4,3,0,0,4,0,0,1,2,0],
    [1,0,0,4,2,0,1,3,0,0,4],
    [2,0,0,1,3,0,2,4,0,0,1],
    [0,4,1,0,0,3,0,0,2,3,0],
    [0,3,2,0,1,2,4,0,1,4,0],
    [1,0,0,4,3,5,1,2,0,0,3],
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

var gameHistory:Game[] = []

var displaygame = new Game()
displaygame.teamturn = 0
displaygame.legalMoves = generateLegalMoves(displaygame)

let suggestedmove:Move = null

startContext(document.querySelector('#buttons'))
    crend('button','heuristic').on('click',() => {
        console.log(heuristic(displaygame))
    })
    crend('button','search').on('click',() => {
        suggestedmove = findBestMoves(displaygame,depthinput['valueAsNumber'])[0]
        rendergametreeRoot(displaygame) 
    })

    crend('button','random').on('click',() => {
        suggestedmove = rng.choose(displaygame.legalMoves)
        rendergametreeRoot(displaygame) 
    })
    crend('br')

    var hashinput = crend('input','')
    crend('button','load json',{}).on('click',() => {
        displaygame = Game.load(hashinput['value'])
        displaygame.legalMoves = generateLegalMoves(displaygame)
        rendergametreeRoot(displaygame)
    })

    crend('br')

    cr('div')
        text('search depth')
        let depthinput = crend('input','',{value:3,type:'number'})
    end()

    crend('button','undo',{}).on('click',() => {
        displaygame = gameHistory[gameHistory.findIndex(g => g == displaygame) - 1] 
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
        console.log(displaygame.stringify())
        if(displaygame.legalMoves.length == 0){
            console.log('game over')
            // console.log('team ' + displaygame.teamturn + ' lost')
            console.log('team ' + (displaygame.teamturn + 1) % 2 + ' won')
        }

        // findBestMoves(displaygame,searchdepth)

        suggestedmove = null
        rendergametreeRoot(displaygame)
    }
})

loop((dt) => {

    //rendering-------------------------
    ctxt.fillStyle = "black"
    ctxt.fillRect(0,0,screensize.x,screensize.y)

    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[i].length; j++){
            let x = j * 50
            let y = i * 50
            // ctxt.fillStyle = celcolors[board[i][j]]
            // ctxt.fillRect(x + 10,y + 10,30,30)
            ctxt.drawImage(images[board[i][j]], x, y, 50, 50)
        }
    }
    

    let shownmoves = displaygame.legalMoves
    if(displaygame.selected){
        shownmoves = displaygame.legalMoves.filter((m) => m.from.equals(displaygame.selected.pos))
    }

    // for(let move of shownmoves){
    //     ctxt.fillStyle = "grey"
    //     ctxt.fillRect(move.to.x * 50,move.to.y * 50,50,50)
    // }

    if(suggestedmove){
        ctxt.fillStyle = "deeppink"
        drawRectCentered(suggestedmove.to.x * 50,suggestedmove.to.y * 50,30,30)
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
        drawRectCentered(x,y,30,30)
    }
    

    ctxt.textAlign = "center"
    ctxt.textBaseline = "middle"
    for(let move of shownmoves){
        ctxt.font = "20px Arial"
        ctxt.fillStyle = "red"
        var text = gameText(move.dest)
        ctxt.fillText(text,move.to.x * 50 + 25,move.to.y * 50 + 25)
    }

    if(displaygame.selected != null){
        ctxt.fillStyle = "rgba(0,0,0,0.5)"
        ctxt.fillRect(displaygame.selected.pos.x * 50,displaygame.selected.pos.y * 50,50,50)
    }

    ctxt.textAlign = "left"
    ctxt.font = "12px Arial"
    ctxt.fillStyle = "white"
    ctxt.fillText('teamturn: ' + ['green','orange'][displaygame.teamturn],570,10)
    ctxt.fillText('active icon: ' + iconNames[displaygame.activeIcon],570,20)
    ctxt.fillText('movelength: ' + displaygame.lastmovelength.toString(),570,30)

})

function drawRectCentered(x:number,y:number,w:number,h:number){
    ctxt.fillRect(x - w/2 + celsize.x/2,y - h/2 + celsize.y/2,w,h)
}

function moveSamurai(game:Game,move:Move){
    let sam = game.samurailist.find((s) => s.pos.equals(move.from))
    gameHistory.push(game.copy())
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
    if(board[move.to.y][move.to.x] == Cel.special){
        game.lastmovelength = -1
        game.activeIcon = Cel.empty
        game.specialUsed[game.teamturn] = true
    }else{
        var src2dst = move.from.to(move.to)
        var movedist = Math.max(Math.abs(src2dst.x),Math.abs(src2dst.y))
        game.activeIcon = board[move.to.y][move.to.x]
        game.teamturn = (game.teamturn + 1) % 2
        game.lastmovelength = movedist
    }
    sam.pos.overwrite(move.to)
    game.legalMoves = generateLegalMoves(game)
}



function generateLegalMoves(game:Game,teamturn:number = game.teamturn){
    var legalMoves:Move[] = []
    let current = new Vector(0,0);
    for(var sam of game.samurailist.filter((s) => s.team == teamturn)){//foreach samurai of current team
        loop:for(var dir of directions){//foreach direction
            current.overwrite(sam.pos)
            var hasIconBeenTouched = false

            var maxlength = game.lastmovelength == -1 ? maxSpecialMoveLength : game.lastmovelength + 1
            for(var i = 1; i <= maxlength;i++){
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

                if(currentIcon == Cel.special && game.specialUsed[teamturn] == true){
                    continue;
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
    // cr('ul',{id:'myUL'})
    rendergametree2(game)
    // end()
    endContext()
}

function rendergametree2(game:Game){
    let children = game.legalMoves.filter(m => m.dest != null)

    if(children.length == 0){
        // game.element = crend('div',gameText(game)  + ':' + game.funccallid,{style:'cursor:pointer; padding-left:25px'}).on('click',() => {
        game.element = crend('div',gameText(game),{style:'cursor:pointer; padding-left:25px'}).on('click',() => {
            displaygame = game
        })
    }else{
        game.element = cr('div',{style:'padding-left:10px'})
            let caret = crend('span','',{style:'cursor:pointer;'}).on('click',() => {
                if(container.style.display == 'none'){
                    container.style.display =  'block'
                    caret.innerHTML = '&#9660;'
                }else{
                    container.style.display =  'none'
                    caret.innerHTML = '&#9658;'
                }
            })
            caret.innerHTML = '&#9658;'

            // crend('span',gameText(game) + ':' + game.funccallid,{style:'cursor:pointer;'}).on('click',() => {
            crend('span',gameText(game),{style:'cursor:pointer;'}).on('click',() => {
                displaygame = game
            })

            let container =  cr('span',{style:'display:none'})
                for(let child of children){
                    rendergametree2(child.dest)
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
    if(game == null){
        return 'null'
    }
    if(game.score > 99999){
        return 'Infinity'
    }else if(game.score < -99999){
        return '-Infinity'
    }
    return `${game.score?.toFixed(1) ?? '?'}`
    // if(game.children.length == 0){
    //     return `${game.score.toFixed(1)}`
    // }else{
    //     return `${game.children.length}:${game.score.toFixed(1)}`
    // }
}
