

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

//boardstates are nodes with scores
//moves are the connections between boardstates

let removedcount = 0
let searched = 0
let leaves = 0
function findBestMoves(game:Game,depth:number){
    removedcount = 0
    searched = 0
    leaves = 0
    search2(game,depth,-Infinity,+Infinity)
    game.legalMoves.sort((a,b) => b.dest.score - a.dest.score)
    console.log('removed: ' + removedcount)
    console.log('seached: ' + searched)
    console.log('leaves: ' + leaves)
    return game.legalMoves
}

// function search(game:Game,depth:number):number{
//     let funccallid = rng.next();
//     searched++
//     if(game.legalMoves.length == 0){
//         leaves++
//         return -Infinity
//     }
//     if(depth == 0){
//         leaves++
//         return heuristic(game)
//     }

//     let i = 0
//     //here do the alpha beta pruning and move ordering
//     for(var move of game.legalMoves){
//         var newgamestate = game.copy()
//         moveSamurai(newgamestate,move)
//         move.dest = newgamestate
//         var score = search(newgamestate,depth - 1)
//         newgamestate.score = score

//         //scan for the best score afterwards
//         //first filter out moves that are infinite if not enough samurais have moved
//         i++
//     }
//     var oldmoves = game.legalMoves
//     game.legalMoves = game.legalMoves.filter(m => {
        
//         if(m.dest.score == -Infinity){
//             var nonmovedsamuraicount = m.dest.samurailist.filter(sam => sam.team == m.dest.teamturn && sam.moved == false).length
//             if(nonmovedsamuraicount >= 3){
//                 removedcount++
//                 return false
//             }
//         }
//         return true
//     })
//     if(game.legalMoves.length == 0){
//         leaves++
//         return -Infinity
//     }
    

//     game.score = -findBest(game.legalMoves,(m) => -m.dest.score).dest.score
//     return game.score
// }

function search2(game:Game,depth:number,alpha,beta){
    var maximizing = game.teamturn == 0
    let funccallid = rng.next();
    searched++
    if(game.legalMoves.length == 0){
        leaves++
        return -Infinity
    }
    if(depth == 0){
        leaves++
        return heuristic(game)
    }

    // for(var move of game.legalMoves){
    //     move.dest.heuristic = heuristic(move.dest)
    // }
    // game.legalMoves.sort((a,b) => b.dest.heuristic - a.dest.heuristic)

    for(var move of game.legalMoves){
        var newgamestate = game.copy()
        moveSamurai(newgamestate,move)
        move.dest = newgamestate
        var score = search2(newgamestate,depth - 1,alpha,beta)
        newgamestate.score = score
        // if(maximizing){
        //     alpha = Math.max(alpha,score)
        // }else{
        //     beta = Math.min(beta,score)
        // }
        // if(beta <= alpha){
        //     break
        // }

    }

    filterIllegalMoves(game)
    if(game.legalMoves.length == 0){
        leaves++
        return -Infinity
    }
    game.legalMoves.sort((a,b) => b.dest.score - a.dest.score)
    if(maximizing){
        game.score = game.legalMoves[0].dest.score
    }else{
        game.score = game.legalMoves[game.legalMoves.length - 1].dest.score
    }
    
    return game.score

    function filterIllegalMoves(game:Game){
        game.legalMoves = game.legalMoves.filter(m => {
            if(m.dest.score == -Infinity){
                var nonmovedsamuraicount = m.dest.samurailist.filter(sam => sam.team == m.dest.teamturn && sam.moved == false).length
                if(nonmovedsamuraicount >= 3){
                    removedcount++
                    return false
                }
            }
            return true
        })
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

//heuristic
//leave opponent with as little options as possible
//leave him with only moves on empty tiles
//leave self with as much options as possible
//make moves with greatest length
//keep control of special tile