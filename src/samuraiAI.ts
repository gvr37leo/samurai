//samurai clipper

//minimax
//alpha beta pruning
//move ordering
//transposition table
//iterative deepening

// sebastian lague, chess series 1 & 2
// https://www.youtube.com/watch?v=U4ogK0MIzqk
// https://www.youtube.com/watch?v=_vqlIPDR2TU

//game rules
// https://boardgamegeek.com/image/433420/samurai

//board
// https://marktplaza.b-cdn.net/94304938_1.jpg

//boardstates are nodes with scores
//moves are the connections between boardstates

let removedcount = 0
let searched = 0
let leaves = 0
let transpositions = 0

let hashtable = new Map<string,Game>()
function findBestMoves(game:Game,depth:number){
    removedcount = 0
    searched = 0
    leaves = 0
    transpositions = 0
    rng = new RNG(0)
    hashtable.clear()
    timeFunction(() => {
        search(game,depth,-Infinity,+Infinity)
    })
    // game.legalMoves.sort((a,b) => b.dest.score - a.dest.score)
    console.log('removed: ' + removedcount)
    console.log('seached: ' + searched)
    console.log('leaves: ' + leaves)
    console.log('transpositions: ' + transpositions)
    console.log('---------------------')
    return game.legalMoves
}

function search(game:Game,depth:number,alpha,beta){
    var maximizing = game.teamturn == 0
    
    var worstresult = maximizing ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
    let funccallid = rng.next();
    game.funccallid = funccallid
    searched++

    if(game.legalMoves.length == 0){
        leaves++
        return worstresult
    }
    if(depth == 0){
        leaves++
        return heuristic(game)
    }


    // for(var move of game.legalMoves){
    //     let newgamestate = game.copy()
    //     moveSamurai(newgamestate,move)
    //     move.dest = newgamestate
        
    //     move.dest.heuristic = heuristic(move.dest)
    // }
    // if(maximizing){
    //     game.legalMoves.sort((a,b) => b.dest.heuristic - a.dest.heuristic)
    // }else{
    //     game.legalMoves.sort((a,b) => a.dest.heuristic - b.dest.heuristic)
    // }


    for(var move of game.legalMoves){
        //----
        let newgamestate = game.copy()
        moveSamurai(newgamestate,move)
        move.dest = newgamestate
        //----
        
        var specialdepthaddition = 0
        var oldspecialusedCount = game.specialUsed.filter(s => s).length
        var newSpecialUsedcount = newgamestate.specialUsed.filter(s => s).length
        if(newSpecialUsedcount > oldspecialusedCount){
            specialdepthaddition = 1
        }

        move.dest.hashval = move.dest.hash()
        let score = 0
        if(hashtable.has(move.dest.hashval) && false){
            transpositions++
            score = hashtable.get(move.dest.hashval).score
        }else{
            score = search(move.dest,depth - 1 + specialdepthaddition,alpha,beta)
        }

        move.dest.score = score
        hashtable.set(move.dest.hashval,move.dest)

        //alpha beta pruning
        if(maximizing){
            alpha = Math.max(alpha,score)
        }else{
            beta = Math.min(beta,score)
        }
        if(beta <= alpha){
            game.legalMoves = game.legalMoves.filter(g => g?.dest?.score != null)
            break
        }
        //--------------------------------
    }

    filterIllegalMoves(game)
    if(game.legalMoves.length == 0){
        leaves++
        return worstresult
    }
    if(maximizing){
        game.legalMoves.sort((a,b) => b.dest.score - a.dest.score)
    }else{
        game.legalMoves.sort((a,b) => a.dest.score - b.dest.score)
    }
    game.score = game.legalMoves[0].dest.score
    
    if(game.score > 99999){
        game.score -= 1
    }else if(game.score < -99999){
        game.score += 1
    }

    return game.score

    function filterIllegalMoves(game:Game){
        var game2 = game
        var filteredmoves = game.legalMoves.filter(m => {
            var game3 = game2
            if(m.dest.score > 99999 || m.dest.score < -99999){
                var nonmovedsamuraicount = m.dest.samurailist.filter(sam => sam.team == m.dest.teamturn && sam.moved == false).length
                if(nonmovedsamuraicount >= 3){
                    removedcount++
                    return false
                }
            }
            return true
        })
        if(filteredmoves.length != game.legalMoves.length){
            // console.log('illegal moves removed')
        }
        game.legalMoves = filteredmoves
    }
}

function heuristic(game:Game):number{
    //team 0 should maximize
    //team 1 should minimize
    var score = countScore(game.legalMoves)
    if(game.teamturn == 1){
        score *= -1
    }
    return score
}

function countScore(moves:Move[]){
    
    if(moves.length == 0){
        return -Infinity
    }
    
    var score = 0
    for(var move of moves){
        var dstcel = board[move.to.y][move.to.x]
        if(dstcel == Cel.special){
            score += 8
        }else if(dstcel == Cel.empty){
            score += 1
        }else{
            score += 4
        }
        var from2to = move.from.to(move.to)
        score += map(Math.max(Math.abs(from2to.x),Math.abs(from2to.y)),1,11,0,4) 
    }
    return score
}



function findBest(array:any[],cb){
    return array[findbestIndex(array,cb)]
}

function timeFunction(func:Function){
    var start = performance.now()
    func()
    var end = performance.now()
    console.log('time: ' + (end - start).toFixed(0) + 'ms')
}

//heuristic
//leave opponent with as little options as possible
//leave him with only moves on empty tiles
//leave self with as much options as possible
//make moves with greatest length
//keep control of special tile