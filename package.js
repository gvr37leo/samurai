class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }
    c() {
        return new Vector(this.x, this.y);
    }
    overwrite(v) {
        this.x = v.x;
        this.y = v.y;
        return this;
    }
    equals(v) {
        return this.x == v.x && this.y == v.y;
    }
    to(v) {
        return v.c().sub(this);
    }
}
class RNG {
    constructor(seed) {
        this.seed = seed;
        this.mod = 4294967296;
        this.multiplier = 1664525;
        this.increment = 1013904223;
    }
    next() {
        this.seed = (this.multiplier * this.seed + this.increment) % this.mod;
        return this.seed;
    }
    norm() {
        return this.next() / this.mod;
    }
    range(min, max) {
        return lerp(min, max, this.norm());
    }
    rangeFloor(min, max) {
        return Math.floor(this.range(min, max));
    }
    choose(arr) {
        return arr[this.rangeFloor(0, arr.length)];
    }
    shuffle(arr) {
        for (var end = arr.length; end > 0; end--) {
            swap(arr, this.rangeFloor(0, end), end);
        }
        return arr;
    }
}
class Store {
    constructor() {
        this.map = new Map();
        this.counter = 0;
    }
    get(id) {
        return this.map.get(id);
    }
    add(item) {
        item.id = this.counter++;
        this.map.set(item.id, item);
    }
    list() {
        return Array.from(this.map.values());
    }
    remove(id) {
        var val = this.map.get(id);
        this.map.delete(id);
        return val;
    }
}
var TAU = Math.PI * 2;
function map(val, from1, from2, to1, to2) {
    return lerp(to1, to2, inverseLerp(val, from1, from2));
}
function inverseLerp(val, a, b) {
    return to(a, val) / to(a, b);
}
function inRange(min, max, value) {
    if (min > max) {
        var temp = min;
        min = max;
        max = temp;
    }
    return value <= max && value >= min;
}
function min(a, b) {
    if (a < b)
        return a;
    return b;
}
function max(a, b) {
    if (a > b)
        return a;
    return b;
}
function clamp(val, min, max) {
    return this.max(this.min(val, max), min);
}
function rangeContain(a1, a2, b1, b2) {
    return max(a1, a2) >= max(b1, b2) && min(a1, a2) <= max(b1, b2);
}
function startMouseListen(localcanvas) {
    var mousepos = new Vector(0, 0);
    document.addEventListener('mousemove', (e) => {
        mousepos.overwrite(getMousePos(localcanvas, e));
    });
    return mousepos;
}
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return new Vector(evt.clientX - rect.left, evt.clientY - rect.top);
}
function createCanvas(x, y) {
    var canvas = document.createElement('canvas');
    canvas.width = x;
    canvas.height = y;
    document.body.appendChild(canvas);
    var ctxt = canvas.getContext('2d');
    return { ctxt: ctxt, canvas: canvas };
}
function random(min, max) {
    return Math.random() * (max - min) + min;
}
var lastUpdate = Date.now();
function loop(callback) {
    var now = Date.now();
    callback((now - lastUpdate) / 1000);
    lastUpdate = now;
    requestAnimationFrame(() => {
        loop(callback);
    });
}
function mod(number, modulus) {
    return ((number % modulus) + modulus) % modulus;
}
var keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
function getMoveInput() {
    var dir = new Vector(0, 0);
    if (keys['a'])
        dir.x--; //left
    if (keys['w'])
        dir.y++; //up
    if (keys['d'])
        dir.x++; //right
    if (keys['s'])
        dir.y--; //down
    return dir;
}
function getMoveInputYFlipped() {
    var input = getMoveInput();
    input.y *= -1;
    return input;
}
function loadTextFiles(strings) {
    var promises = [];
    for (var string of strings) {
        var promise = fetch(string)
            .then(resp => resp.text())
            .then(text => text);
        promises.push(promise);
    }
    return Promise.all(promises);
}
function loadImages(urls) {
    var promises = [];
    for (var url of urls) {
        promises.push(new Promise((res, rej) => {
            var image = new Image();
            image.onload = e => {
                res(image);
            };
            image.src = url;
        }));
    }
    return Promise.all(promises);
}
function findbestIndex(list, evaluator) {
    if (list.length < 1) {
        return -1;
    }
    var bestIndex = 0;
    var bestscore = evaluator(list[0]);
    for (var i = 1; i < list.length; i++) {
        var score = evaluator(list[i]);
        if (score > bestscore) {
            bestscore = score;
            bestIndex = i;
        }
    }
    return bestIndex;
}
function lerp(a, b, r) {
    return a + to(a, b) * r;
}
function tween(x, a, b) {
    return (a + b - 2) * x * x * x + (3 - 2 * a - b) * x * x + a * x;
}
function to(a, b) {
    return b - a;
}
function swap(arr, a = 0, b = 1) {
    var temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
}
function first(arr) {
    return arr[0];
}
function last(arr) {
    return arr[arr.length - 1];
}
// function create2DArray<T>(size:Vector,filler:(pos:Vector) => T){
//     var result = new Array(size.y)
//     for(var i = 0; i < size.y;i++){
//         result[i] = new Array(size.x)
//     }
//     size.loop2d(v => {
//         result[v.y][v.x] = filler(v)
//     })
//     return result
// }
function get2DArraySize(arr) {
    return new Vector(arr[0].length, arr.length);
}
function index2D(arr, i) {
    return arr[i.x][i.y];
}
// function copy2dArray<T>(arr:T[][]){
//     return create2DArray(get2DArraySize(arr),pos => index2D(arr,pos))
// }
function round(number, decimals) {
    var mul = 10 ** decimals;
    return Math.round(number * mul) / mul;
}
var rng = new RNG(0);
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(rng.norm() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
function remove(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}
class StopWatch {
    constructor() {
        this.starttimestamp = Date.now();
        this.pausetimestamp = Date.now();
        this.pausetime = 0;
        this.paused = true;
    }
    get() {
        var currentamountpaused = 0;
        if (this.paused) {
            currentamountpaused = to(this.pausetimestamp, Date.now());
        }
        return to(this.starttimestamp, Date.now()) - (this.pausetime + currentamountpaused);
    }
    start() {
        this.paused = false;
        this.starttimestamp = Date.now();
        this.pausetime = 0;
    }
    continue() {
        if (this.paused) {
            this.paused = false;
            this.pausetime += to(this.pausetimestamp, Date.now());
        }
    }
    pause() {
        if (this.paused == false) {
            this.paused = true;
            this.pausetimestamp = Date.now();
        }
    }
    reset() {
        this.paused = true;
        this.starttimestamp = Date.now();
        this.pausetimestamp = Date.now();
        this.pausetime = 0;
    }
}
class Cooldown {
    constructor(maxcooldown) {
        this.cooldown = 0;
        this.maxcooldown = maxcooldown;
    }
    isready() {
        return this.cooldown <= 0;
    }
    tryfire() {
        if (this.isready()) {
            this.cooldown = this.maxcooldown;
            return true;
        }
        return false;
    }
    update(dt) {
        this.cooldown -= dt;
        if (this.cooldown < 0) {
            this.cooldown = 0;
        }
    }
}
class Rule {
    constructor(message, cb) {
        this.message = message;
        this.cb = cb;
    }
}
class Ability {
    constructor(cb) {
        this.cb = cb;
        // ammo:number = 1
        // maxammo:number = 1
        // ammorechargerate:number = 1000
        // casttime:number = 2000
        // channelduration:number = 3000
        this.cooldown = 1000;
        this.lastfire = Date.now();
        this.rules = [
            new Rule('not ready yet', () => (this.lastfire + this.cooldown) < Date.now()),
            //cast while moving rule
            //must have target rule
            //must have valid target rule
            //resource rule
            //ammo rule
            //line of sight rule
        ];
        this.stopwatch = new StopWatch();
        this.ventingtime = 0;
        this.onCastFinished = new EventSystem();
        this.shots = 0;
        this.firing = false;
    }
    //positive if you need to wait 0 or negative if you can call it
    timeTillNextPossibleActivation() {
        return to(Date.now(), this.lastfire + this.cooldown);
    }
    canActivate() {
        return this.rules.every(r => r.cb());
    }
    callActivate() {
        this.cb();
    }
    fire() {
        if (this.firing == false) {
            this.startfire();
        }
        else {
            this.holdfire();
        }
    }
    releasefire() {
        this.firing = false;
    }
    tapfire() {
        this.startfire();
        this.releasefire();
    }
    startfire() {
        if (this.rules.some(r => r.cb())) {
            this.firing = true;
            this.ventingtime = 0;
            this.stopwatch.start();
            this.ventingtime -= this.cooldown;
            this.shots = 1;
            this.lastfire = Date.now();
            this.cb();
        }
    }
    holdfire() {
        this.ventingtime += this.stopwatch.get();
        this.stopwatch.start();
        this.shots = Math.ceil(this.ventingtime / this.cooldown);
        this.ventingtime -= this.shots * this.cooldown;
        this.lastfire = Date.now();
        if (this.shots > 0) {
            this.cb();
        }
    }
}
class SpriteAnimation {
    constructor(data) {
        Object.assign(this, data);
    }
}
function drawAnimation(pos, animation, time, flipx = false, centered = true) {
    if (centered) {
        pos = pos.c().sub(animation.spritesize.c().scale(0.5));
    }
    var frame = Math.floor(map(time % animation.duration, 0, animation.duration, 0, animation.framecount));
    if (flipx) {
        var center = pos.c().add(animation.spritesize.c().scale(0.5));
        ctxt.save();
        ctxt.translate(center.x, center.y);
        ctxt.scale(-1, 1);
        ctxt.translate(-center.x, -center.y);
    }
    drawAtlasImage(pos, animation.startpos.c().add(animation.direction.c().scale(frame)), animation.spritesize, animation.imageatlas);
    if (flipx) {
        ctxt.restore();
    }
}
function drawAtlasImage(absdstpos, srctile, tilesize, image) {
    var abssrc = srctile.c().mul(tilesize);
    ctxt.drawImage(image, abssrc.x, abssrc.y, tilesize.x, tilesize.y, absdstpos.x, absdstpos.y, tilesize.x, tilesize.y);
}
var AnimType;
(function (AnimType) {
    AnimType[AnimType["once"] = 0] = "once";
    AnimType[AnimType["repeat"] = 1] = "repeat";
    AnimType[AnimType["pingpong"] = 2] = "pingpong";
    AnimType[AnimType["extend"] = 3] = "extend";
})(AnimType || (AnimType = {}));
class Anim {
    constructor() {
        this.animType = AnimType.once;
        this.reverse = false;
        this.duration = 1000;
        this.stopwatch = new StopWatch();
        this.begin = 0;
        this.end = 1;
    }
    get() {
        var cycles = this.stopwatch.get() / this.duration;
        switch (this.animType) {
            case AnimType.once:
                return clamp(lerp(this.begin, this.end, cycles), this.begin, this.end);
            case AnimType.repeat:
                return lerp(this.begin, this.end, mod(cycles, 1));
            case AnimType.pingpong:
                var pingpongcycle = mod(cycles, 2);
                if (pingpongcycle <= 1) {
                    return lerp(this.begin, this.end, pingpongcycle);
                }
                else {
                    return lerp(this.end, this.begin, pingpongcycle - 1);
                }
            case AnimType.extend:
                var distPerCycle = to(this.begin, this.end);
                return Math.floor(cycles) * distPerCycle + lerp(this.begin, this.end, mod(cycles, 1));
        }
    }
}
class Rect {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    static fromsize(pos, size) {
        return new Rect(pos, pos.c().add(size));
    }
    collidePoint(point) {
        for (var i = 0; i < this.min.vals.length; i++) {
            if (!inRange(this.min.vals[i], this.max.vals[i], point.vals[i])) {
                return false;
            }
        }
        return true;
    }
    size() {
        return this.min.to(this.max);
    }
    collideBox(other) {
        var x = rangeOverlap(this.min.x, this.max.x, other.min.x, other.max.x);
        var y = rangeOverlap(this.min.y, this.max.y, other.min.y, other.max.y);
        return x && y;
    }
    getPoint(relativePos) {
        return this.min.c().add(this.size().mul(relativePos));
    }
    draw(ctxt) {
        var size = this.size();
        ctxt.fillRect(this.min.x, this.min.y, size.x, size.y);
    }
    moveTo(pos) {
        var size = this.size();
        this.min = pos.c();
        this.max = this.min.c().add(size);
    }
    loop(callback) {
        var temp = this.max.c();
        this.size().loop(v2 => {
            temp.overwrite(v2);
            temp.add(this.min);
            callback(temp);
        });
    }
}
function rangeOverlap(range1A, range1B, range2A, range2B) {
    return range1A <= range2B && range2A <= range1B;
}
class EventQueue {
    constructor() {
        this.idcounter = 0;
        this.onProcessFinished = new EventSystem();
        this.onRuleBroken = new EventSystem();
        this.rules = [];
        this.discoveryidcounter = 0;
        this.listeners = [];
        this.events = [];
    }
    // listenDiscovery(type:string,megacb:(data:any,cb:(cbdata:any) => void) => void){
    //     this.listen(type,(dataAndCb:{data:any,cb:(ads:any) => void}) => {
    //         megacb(dataAndCb.data,dataAndCb.cb)
    //     })
    // }
    // startDiscovery(type:string,data: any, cb: (cbdata: any) => void) {
    //     this.addAndTrigger(type,{data,cb})
    // }
    listenDiscovery(type, cb) {
        this.listen(type, (discovery) => {
            cb(discovery.data, discovery.id);
        });
    }
    startDiscovery(type, data, cb) {
        let createdid = this.discoveryidcounter++;
        let listenerid = this.listen('completediscovery', (discovery) => {
            if (discovery.data.id == createdid) {
                this.unlisten(listenerid);
                cb(discovery.data.data);
            }
        });
        this.addAndTrigger(type, { data, id: createdid });
    }
    completeDiscovery(data, id) {
        this.addAndTrigger('completediscovery', { data, id });
    }
    listen(type, cb) {
        var id = this.idcounter++;
        this.listeners.push({
            id: id,
            type: type,
            cb,
        });
        return id;
    }
    listenOnce(type, cb) {
        let id = this.listen(type, (data) => {
            this.unlisten(id);
            cb(data);
        });
        return id;
    }
    unlisten(id) {
        var index = this.listeners.findIndex(o => o.id == id);
        this.listeners.splice(index, 1);
    }
    process() {
        while (this.events.length > 0) {
            let currentEvent = this.events.shift();
            let listeners = this.listeners.filter(l => l.type == currentEvent.type);
            let brokenrules = this.rules.filter(r => r.type == currentEvent.type && r.rulecb(currentEvent.data) == false);
            if (brokenrules.length == 0) {
                for (let listener of listeners) {
                    listener.cb(currentEvent.data);
                }
            }
            else {
                console.log(first(brokenrules).error);
                this.onRuleBroken.trigger({ event: currentEvent, error: first(brokenrules).error });
            }
        }
        this.onProcessFinished.trigger(0);
    }
    add(type, data) {
        this.events.push({
            type: type,
            data: data,
        });
    }
    addAndTrigger(type, data) {
        this.add(type, data);
        this.process();
    }
    addRule(type, error, rulecb) {
        this.rules.push({ type, error, rulecb });
    }
}
class EventSystem {
    constructor() {
        this.idcounter = 0;
        this.listeners = [];
    }
    listen(cb) {
        var listener = {
            id: this.idcounter++,
            cb: cb,
        };
        this.listeners.push(listener);
        return listener.id;
    }
    unlisten(id) {
        var index = this.listeners.findIndex(o => o.id == id);
        this.listeners.splice(index, 1);
    }
    trigger(val) {
        for (var listener of this.listeners) {
            listener.cb(val);
        }
    }
}
class Camera {
    constructor(ctxt) {
        this.ctxt = ctxt;
        this.pos = new Vector(0, 0);
        this.scale = new Vector(1, 1);
    }
    begin() {
        ctxt.save();
        var m = this.createMatrixScreen2World().inverse();
        ctxt.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    }
    end() {
        ctxt.restore();
    }
    createMatrixScreen2World() {
        var a = new DOMMatrix([
            1, 0, 0, 1, -screensize.x / 2, -screensize.y / 2
        ]);
        var b = new DOMMatrix([
            this.scale.x, 0, 0, this.scale.y, this.pos.x, this.pos.y
        ]);
        return b.multiply(a);
    }
    screen2world(pos) {
        var dompoint = this.createMatrixScreen2World().transformPoint(new DOMPoint(pos.x, pos.y));
        return new Vector(dompoint.x, dompoint.y);
    }
    world2screen(pos) {
        var dompoint = this.createMatrixScreen2World().inverse().transformPoint(new DOMPoint(pos.x, pos.y));
        return new Vector(dompoint.x, dompoint.y);
    }
}
class Entity {
    constructor(init) {
        this.id = null;
        this.parent = null;
        this.type = '';
        this.name = '';
        this.children = [];
        // ordercount = 0
        // sortorder = 0
        this.synced = false;
        Object.assign(this, init);
        this.type = 'entity';
    }
    setChild(child) {
        //remove child from old parent
        var oldparent = Entity.globalEntityStore.get(child.parent);
        if (oldparent != null) {
            remove(oldparent.children, child.id);
        }
        this.children.push(child.id);
        child.parent = this.id;
        // child.sortorder = this.ordercount++
    }
    setParent(parent) {
        if (parent == null) {
            this.parent = null;
        }
        else {
            parent.setChild(this);
        }
    }
    getParent() {
        return Entity.globalEntityStore.get(this.parent);
    }
    descendant(cb) {
        return this.descendants(cb)[0];
    }
    descendants(cb) {
        var children = this._children(cb);
        var grandchildren = children.flatMap(c => c.descendants(cb));
        return children.concat(grandchildren);
    }
    child(cb) {
        return this._children(cb)[0];
    }
    _children(cb) {
        return this.children.map(id => Entity.globalEntityStore.get(id)).filter(cb);
    }
    allChildren() {
        return this._children(() => true);
    }
    remove() {
        remove(this.getParent().children, this.id);
        Entity.globalEntityStore.remove(this.id);
        this.removeChildren();
        return this;
    }
    inject(parent) {
        Entity.globalEntityStore.add(this);
        this.setParent(parent);
        return this;
    }
    removeChildren() {
        this.descendants(() => true).forEach(e => Entity.globalEntityStore.remove(e.id));
        this.children = [];
    }
    ancestor(cb) {
        var current = this;
        while (current != null && cb(current) == false) {
            current = Entity.globalEntityStore.get(current.parent);
        }
        return current;
    }
}
class Player extends Entity {
    constructor(init) {
        super();
        this.disconnected = false;
        this.dctimestamp = 0;
        Object.assign(this, init);
        this.type = 'player';
    }
}
/*
class ServerClient{
    
    output = new EventSystem<any>()
    sessionid: number = null

    constructor(public socket, public id){


        this.socket.on('message',(data) => {
            this.output.trigger(data)
        })
    }

    input(type,data){
        this.socket.emit('message',{type,data})
    }
}

class Server{
    // gamemanager: GameManager;
    output = new EventSystem<{type:string,data:any}>()
    clients = new Store<ServerClient>()
    sessionidcounter = 0

    onBroadcast = new EventSystem<{type:string,data:any}>()

    constructor(){
        this.gamemanager = new GameManager()
        Entity.globalEntityStore = this.gamemanager.entityStore;

        this.gamemanager.setupListeners()
        this.gamemanager.eventQueue.addAndTrigger('init',null)

        this.gamemanager.eventQueue.onProcessFinished.listen(() => {
            this.updateClients()
            set synced status of updated entities to true
        })

        this.gamemanager.broadcastEvent.listen((event) => {
            for(var client of this.clients.list()){
                client.input(event.type,event.data)
            }
        })

        this.gamemanager.sendEvent.listen((event) => {
            this.clients.list().filter(c => c.sessionid == event.sessionid).forEach(c => c.input(event.type,event.data))
        })

        setInterval(() => {
            var longdcedplayers = this.gamemanager.helper.getPlayers().filter(p => p.disconnected == true && (Date.now() - p.dctimestamp) > 5_000 )
            longdcedplayers.forEach(p => {
                console.log(`removed disconnected player:${p.name}`)
                p.remove()
            })
            if(longdcedplayers.length > 0){
                this.updateClients()
            }
        },5000)
    }

    updateClients(){
        this.gamemanager.broadcastEvent.trigger({type:'update',data:this.gamemanager.entityStore.list()})
    }

    connect(client:ServerClient){
        this.clients.add(client)
        let players = this.gamemanager.helper.getPlayers()

        //client does a handshake
        //if client sends sessionID look for a player with that sessionid
        //if not found or client sends no sessionid create a new player with a new sessionid
        //finish handshake by sending client and sessionid
        //when a client disconnects flag player as dc'ed and set dc timestamp after 2 min delete dc'ed players

        //client should connect, check for sessionid in localstore/sessionstorage
        //then initiate handshake send found sessionid
        //save session and client id on client and look in database for player with sessionid = client.sessionid
        client.socket.on('handshake',(data,fn) => {
            
            let sessionid = data.sessionid
            if(sessionid == null){
               sessionid = this.sessionidcounter++
            }
            this.sessionidcounter = Math.max(sessionid,this.sessionidcounter)//should create random guid instead
            client.sessionid = sessionid
            console.log(`user connected:${client.sessionid}`)

            let foundplayer = players.find(p => p.sessionid == sessionid)
            if(foundplayer == null){
                let player = new Player({clientid:client.id,sessionid:sessionid})
                player.inject(this.gamemanager.helper.getPlayersNode())
                
            }else{
                foundplayer.clientid = client.id
                foundplayer.disconnected = false
                //reconnection dont create new player but do change the pointer to the new client
            }

            fn({
                clientid:client.id,
                sessionid:sessionid,
            })
            this.updateClients()
        })

        
        

        client.socket.on('disconnect',() => {
            //watch out for multiple connected clients
            this.clients.remove(client.id)
            var sessionplayer = this.gamemanager.helper.getSessionPlayer(client.sessionid)
            console.log(`user disconnected:${client.sessionid}`)
            //this often goes wrong for some reason
            //maybe when multiple clients are connected the old player's clientid gets overwritten
            //also goes wrong when a second tab connects and disconnects
            // check if other clients use the same sessionid
            
            var connectedclients = this.clients.list().filter(c => c.sessionid == client.sessionid)
            if(connectedclients.length == 0){
                sessionplayer.disconnected = true
                sessionplayer.dctimestamp = Date.now()
            }
            
            this.updateClients()
        })

        client.output.listen(e => {
            server.input(e.type,{clientid:client.id,sessionid:client.sessionid,data:e.data})
        })
    }

    input(type,data){
        this.gamemanager.eventQueue.addAndTrigger(type,data)
    }

    serialize(){
        //only serialize unsynced entitys
        return JSON.stringify(this.gamemanager.entityStore.list())
    }

    
}

*/ 
var contextStack = [[document.body]];
function currentContext() {
    return last(contextStack);
}
function startContext(element) {
    contextStack.push([element]);
}
function endContext() {
    contextStack.pop();
}
function scr(tag, attributes = {}) {
    flush();
    return cr(tag, attributes);
}
function cr(tag, attributes = {}) {
    var parent = peek();
    var element = document.createElement(tag);
    if (parent) {
        parent.appendChild(element);
    }
    for (var key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    currentContext().push(element);
    return element;
}
function crend(tag, textstring, attributes = {}) {
    cr(tag, attributes);
    text(textstring);
    return end();
}
function text(data) {
    peek().textContent = data;
    return peek();
}
function html(html) {
    peek().innerHTML = html;
}
function end(endelement = null) {
    var poppedelement = currentContext().pop();
    if (endelement != null && endelement != poppedelement) {
        console.warn(poppedelement, ' doesnt equal ', endelement);
    }
    return poppedelement;
}
HTMLElement.prototype.on = function (event, cb) {
    this.addEventListener(event, cb);
    return this;
};
function peek() {
    var context = currentContext();
    return last(context);
}
function flush() {
    var context = currentContext();
    var root = context[0];
    context.length = 0;
    return root;
}
function div(options = {}) {
    return cr('div', options);
}
function a(options = {}) {
    return cr('a', options);
}
function button(text, options = {}) {
    return crend('button', text, options);
}
function input(options = {}) {
    return crend('input', options);
}
function img(options = {}) {
    return crend('img', options);
}
function stringToHTML(str) {
    var temp = document.createElement('template');
    temp.innerHTML = str;
    return temp.content.firstChild;
}
function upsertChild(parent, child) {
    if (parent.firstChild) {
        parent.replaceChild(child, parent.firstChild);
    }
    else {
        parent.appendChild(child);
    }
}
function qs(element, query) {
    if (typeof element == 'string') {
        return document.body.querySelector(element);
    }
    return element.querySelector(query);
}
function qsa(element, query) {
    return Array.from(element.querySelectorAll(query));
}
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
let removedcount = 0;
let searched = 0;
let leaves = 0;
let transpositions = 0;
let hashtable = new Map();
function findBestMoves(game, depth) {
    removedcount = 0;
    searched = 0;
    leaves = 0;
    transpositions = 0;
    rng = new RNG(0);
    hashtable.clear();
    timeFunction(() => {
        search(game, depth, -Infinity, +Infinity);
    });
    // game.legalMoves.sort((a,b) => b.dest.score - a.dest.score)
    console.log('removed: ' + removedcount);
    console.log('seached: ' + searched);
    console.log('leaves: ' + leaves);
    console.log('transpositions: ' + transpositions);
    console.log('---------------------');
    return game.legalMoves;
}
function search(game, depth, alpha, beta) {
    var maximizing = game.teamturn == 0;
    var worstresult = maximizing ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    let funccallid = rng.next();
    game.funccallid = funccallid;
    searched++;
    if (game.legalMoves.length == 0) {
        leaves++;
        return worstresult;
    }
    if (depth == 0) {
        leaves++;
        return heuristic(game);
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
    for (var move of game.legalMoves) {
        //----
        let newgamestate = game.copy();
        moveSamurai(newgamestate, move);
        move.dest = newgamestate;
        //----
        var specialdepthaddition = 0;
        var oldspecialusedCount = game.specialUsed.filter(s => s).length;
        var newSpecialUsedcount = newgamestate.specialUsed.filter(s => s).length;
        if (newSpecialUsedcount > oldspecialusedCount) {
            specialdepthaddition = 1;
        }
        move.dest.hashval = move.dest.hash();
        let score = 0;
        if (hashtable.has(move.dest.hashval) && false) {
            transpositions++;
            score = hashtable.get(move.dest.hashval).score;
        }
        else {
            score = search(move.dest, depth - 1 + specialdepthaddition, alpha, beta);
        }
        move.dest.score = score;
        hashtable.set(move.dest.hashval, move.dest);
        //alpha beta pruning
        if (maximizing) {
            alpha = Math.max(alpha, score);
        }
        else {
            beta = Math.min(beta, score);
        }
        if (beta <= alpha) {
            game.legalMoves = game.legalMoves.filter(g => { var _a; return ((_a = g === null || g === void 0 ? void 0 : g.dest) === null || _a === void 0 ? void 0 : _a.score) != null; });
            break;
        }
        //--------------------------------
    }
    filterIllegalMoves(game);
    if (game.legalMoves.length == 0) {
        leaves++;
        return worstresult;
    }
    if (maximizing) {
        game.legalMoves.sort((a, b) => b.dest.score - a.dest.score);
    }
    else {
        game.legalMoves.sort((a, b) => a.dest.score - b.dest.score);
    }
    game.score = game.legalMoves[0].dest.score;
    if (game.score > 99999) {
        game.score -= 1;
    }
    else if (game.score < -99999) {
        game.score += 1;
    }
    return game.score;
    function filterIllegalMoves(game) {
        var game2 = game;
        var filteredmoves = game.legalMoves.filter(m => {
            var game3 = game2;
            if (m.dest.score > 99999 || m.dest.score < -99999) {
                var nonmovedsamuraicount = m.dest.samurailist.filter(sam => sam.team == m.dest.teamturn && sam.moved == false).length;
                if (nonmovedsamuraicount >= 3) {
                    removedcount++;
                    return false;
                }
            }
            return true;
        });
        if (filteredmoves.length != game.legalMoves.length) {
            console.log('illegal moves removed');
        }
        game.legalMoves = filteredmoves;
    }
}
function heuristic(game) {
    //team 0 should maximize
    //team 1 should minimize
    var score = countScore(game.legalMoves);
    if (game.teamturn == 1) {
        score *= -1;
    }
    return score;
}
function countScore(moves) {
    if (moves.length == 0) {
        return -Infinity;
    }
    var score = 0;
    for (var move of moves) {
        var dstcel = board[move.to.y][move.to.x];
        if (dstcel == Cel.special) {
            score += 8;
        }
        else if (dstcel == Cel.empty) {
            score += 1;
        }
        else {
            score += 4;
        }
        var from2to = move.from.to(move.to);
        score += map(Math.max(Math.abs(from2to.x), Math.abs(from2to.y)), 1, 11, 0, 4);
    }
    return score;
}
function findBest(array, cb) {
    return array[findbestIndex(array, cb)];
}
function timeFunction(func) {
    var start = performance.now();
    func();
    var end = performance.now();
    console.log('time: ' + (end - start).toFixed(0) + 'ms');
}
//heuristic
//leave opponent with as little options as possible
//leave him with only moves on empty tiles
//leave self with as much options as possible
//make moves with greatest length
//keep control of special tile
class Game {
    constructor(data = {}) {
        this.teamturn = 0;
        this.lastmovelength = -1;
        this.activeIcon = Cel.empty;
        this.specialUsed = [false, false];
        this.samurailist = [
            new Samurai({ pos: new Vector(3, 0), team: 0 }),
            new Samurai({ pos: new Vector(4, 0), team: 0 }),
            new Samurai({ pos: new Vector(6, 0), team: 0 }),
            new Samurai({ pos: new Vector(7, 0), team: 0 }),
            new Samurai({ pos: new Vector(3, 10), team: 1 }),
            new Samurai({ pos: new Vector(4, 10), team: 1 }),
            new Samurai({ pos: new Vector(6, 10), team: 1 }),
            new Samurai({ pos: new Vector(7, 10), team: 1 }),
        ];
        this.selected = null;
        this.legalMoves = [];
        // children:Game[] = []
        this.parent = null;
        this.score = null;
        this.heuristic = null;
        Object.assign(this, data);
    }
    copy() {
        var copy = new Game();
        copy.teamturn = this.teamturn;
        copy.lastmovelength = this.lastmovelength;
        copy.activeIcon = this.activeIcon;
        copy.samurailist = this.samurailist.map((s) => s.copy());
        copy.legalMoves = this.legalMoves.slice();
        copy.specialUsed = this.specialUsed.slice();
        // this.children.push(copy)
        copy.parent = this;
        return copy;
    }
    hash() {
        var res = '';
        res += this.activeIcon.toString();
        res += ":";
        res += this.teamturn.toString();
        res += ":";
        res += this.lastmovelength.toString();
        for (var sam of this.samurailist) {
            res += ":";
            res += sam.pos.x.toString();
            res += ":";
            res += sam.pos.y.toString();
            res += ":";
            res += sam.team.toString();
        }
        return res;
    }
    stringify() {
        var res = {};
        res['teamturn'] = this.teamturn;
        res['lastmovelength'] = this.lastmovelength;
        res['activeIcon'] = this.activeIcon;
        res['samurailist'] = [];
        for (var sam of this.samurailist) {
            var samdata = {};
            samdata['pos'] = sam.pos;
            samdata['team'] = sam.team;
            samdata['moved'] = sam.moved;
            res['samurailist'].push(samdata);
        }
        return JSON.stringify(res);
    }
    static load(json) {
        var data = JSON.parse(json);
        var res = new Game();
        res.teamturn = data['teamturn'];
        res.lastmovelength = data['lastmovelength'];
        res.activeIcon = data['activeIcon'];
        res.samurailist = [];
        for (var sam of data['samurailist']) {
            var samdata = new Samurai(sam);
            samdata.pos = new Vector(sam['pos']['x'], sam['pos']['y']);
            res.samurailist.push(samdata);
        }
        return res;
    }
}
class Move {
    constructor(data) {
        Object.assign(this, data);
    }
}
class Samurai {
    constructor(data) {
        this.moved = false;
        Object.assign(this, data);
    }
    copy() {
        return new Samurai({ pos: this.pos.c(), team: this.team, moved: this.moved });
    }
}
function generate2DArray(rows, cols, fillval) {
    let arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols).fill(fillval);
    }
    return arr;
}
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
var screensize = new Vector(document.documentElement.clientWidth, document.documentElement.clientHeight);
var crret = createCanvas(screensize.x, screensize.y);
var canvas = crret.canvas;
var ctxt = crret.ctxt;
var maxSpecialMoveLength = 7;
var celsize = new Vector(50, 50);
var imageurls = [
    '/samurai/images/blank.png',
    '/samurai/images/dragon.png',
    '/samurai/images/bird.png',
    '/samurai/images/sword.png',
    '/samurai/images/coin.png',
    '/samurai/images/special.png',
    '/samurai/images/start.png',
];
var images = imageurls.map((url) => {
    var img = new Image();
    img.src = url;
    return img;
});
//todo
//suggest best move
//suggest random move
//improve treeview
//special tile fix
//fix non deterministic bug
//uneven to do heuristic on enemy, tells you how bad the enemy is doing
//even to get heuristic on self, tells you how good you're doing
var searchdepth = 3;
var rng = new RNG(0);
var Cel;
(function (Cel) {
    Cel[Cel["empty"] = 0] = "empty";
    Cel[Cel["dragon"] = 1] = "dragon";
    Cel[Cel["eagle"] = 2] = "eagle";
    Cel[Cel["sword"] = 3] = "sword";
    Cel[Cel["coin"] = 4] = "coin";
    Cel[Cel["special"] = 5] = "special";
})(Cel || (Cel = {}));
var celcolors = ["white", "red", "blue", "brown", "yellow", "purple"];
var board = [
    [0, 4, 3, 0, 0, 4, 0, 0, 1, 2, 0],
    [1, 0, 0, 4, 2, 0, 1, 3, 0, 0, 4],
    [2, 0, 0, 1, 3, 0, 2, 4, 0, 0, 1],
    [0, 4, 1, 0, 0, 3, 0, 0, 2, 3, 0],
    [0, 3, 2, 0, 1, 2, 4, 0, 1, 4, 0],
    [1, 0, 0, 4, 3, 5, 1, 2, 0, 0, 3],
    [0, 2, 3, 0, 2, 4, 3, 0, 4, 1, 0],
    [0, 1, 4, 0, 0, 1, 0, 0, 3, 2, 0],
    [3, 0, 0, 1, 2, 0, 3, 4, 0, 0, 2],
    [2, 0, 0, 4, 3, 0, 1, 2, 0, 0, 3],
    [0, 4, 2, 0, 0, 2, 0, 0, 1, 4, 0],
];
var directions = [
    new Vector(1, 0),
    new Vector(-1, 0),
    new Vector(0, 1),
    new Vector(0, -1),
    new Vector(1, 1),
    new Vector(-1, -1),
    new Vector(1, -1),
    new Vector(-1, 1),
];
var displaygame = new Game();
displaygame.teamturn = 0;
displaygame.legalMoves = generateLegalMoves(displaygame);
let suggestedmove = null;
startContext(document.querySelector('#buttons'));
crend('button', 'heuristic').on('click', () => {
    console.log(heuristic(displaygame));
});
crend('button', 'search').on('click', () => {
    suggestedmove = findBestMoves(displaygame, searchdepth)[0];
    rendergametreeRoot(displaygame);
});
crend('button', 'random').on('click', () => {
    suggestedmove = rng.choose(displaygame.legalMoves);
    rendergametreeRoot(displaygame);
});
crend('br');
var hashinput = crend('input', '');
crend('button', 'load json', {}).on('click', () => {
    displaygame = Game.load(hashinput['value']);
    displaygame.legalMoves = generateLegalMoves(displaygame);
    rendergametreeRoot(displaygame);
});
endContext();
//mouseclick-------------------------
document.addEventListener('mousedown', (e) => {
    let x = Math.floor(e.clientX / 50);
    let y = Math.floor(e.clientY / 50);
    var mousepos = new Vector(x, y);
    if (displaygame.selected == null) {
        let sam = displaygame.samurailist.find((s) => s.pos.equals(mousepos));
        displaygame.selected = sam;
    }
    else {
        var legalmove = displaygame.legalMoves.find(m => m.from.equals(displaygame.selected.pos) && m.to.equals(mousepos));
        if (legalmove == null) {
            displaygame.selected = null;
            return;
        }
        // displaygame.copy()
        moveSamurai(displaygame, legalmove);
        displaygame.selected = null;
        console.log(displaygame.stringify());
        if (displaygame.legalMoves.length == 0) {
            console.log('game over');
            console.log('team ' + displaygame.teamturn + ' lost');
        }
        // findBestMoves(displaygame,searchdepth)
        suggestedmove = null;
        rendergametreeRoot(displaygame);
    }
});
loop((dt) => {
    //rendering-------------------------
    ctxt.fillStyle = "black";
    ctxt.fillRect(0, 0, screensize.x, screensize.y);
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            let x = j * 50;
            let y = i * 50;
            // ctxt.fillStyle = celcolors[board[i][j]]
            // ctxt.fillRect(x + 10,y + 10,30,30)
            ctxt.drawImage(images[board[i][j]], x, y, 50, 50);
        }
    }
    let shownmoves = displaygame.legalMoves;
    if (displaygame.selected) {
        shownmoves = displaygame.legalMoves.filter((m) => m.from.equals(displaygame.selected.pos));
    }
    // for(let move of shownmoves){
    //     ctxt.fillStyle = "grey"
    //     ctxt.fillRect(move.to.x * 50,move.to.y * 50,50,50)
    // }
    if (suggestedmove) {
        ctxt.fillStyle = "deeppink";
        drawRectCentered(suggestedmove.to.x * 50, suggestedmove.to.y * 50, 30, 30);
    }
    for (let i = 0; i < displaygame.samurailist.length; i++) {
        let x = displaygame.samurailist[i].pos.x * 50;
        let y = displaygame.samurailist[i].pos.y * 50;
        if (displaygame.samurailist[i].team == 0) {
            ctxt.fillStyle = "green";
        }
        if (displaygame.samurailist[i].team == 1) {
            ctxt.fillStyle = "orange";
        }
        drawRectCentered(x, y, 30, 30);
    }
    ctxt.textAlign = "center";
    ctxt.textBaseline = "middle";
    for (let move of shownmoves) {
        ctxt.font = "20px Arial";
        ctxt.fillStyle = "red";
        var text = gameText(move.dest);
        ctxt.fillText(text, move.to.x * 50 + 25, move.to.y * 50 + 25);
    }
    if (displaygame.selected != null) {
        ctxt.fillStyle = "rgba(0,0,0,0.5)";
        ctxt.fillRect(displaygame.selected.pos.x * 50, displaygame.selected.pos.y * 50, 50, 50);
    }
    ctxt.textAlign = "left";
    ctxt.font = "12px Arial";
    ctxt.fillStyle = "white";
    ctxt.fillText('teamturn: ' + displaygame.teamturn.toString(), 570, 10);
    ctxt.fillText('active icon: ' + displaygame.activeIcon.toString(), 570, 20);
    ctxt.fillText('movelength: ' + displaygame.lastmovelength.toString(), 570, 30);
});
function drawRectCentered(x, y, w, h) {
    ctxt.fillRect(x - w / 2 + celsize.x / 2, y - h / 2 + celsize.y / 2, w, h);
}
function moveSamurai(game, move) {
    let sam = game.samurailist.find((s) => s.pos.equals(move.from));
    //todo check if valid movement
    //check if first touchedicon is activeicon
    if (game.teamturn != sam.team) {
        console.log('invalid : not your turn');
        return;
    }
    if (game.legalMoves.some(m => m.from.equals(move.from) && m.to.equals(move.to)) == false) {
        console.log('invalid : not a legal move');
        return;
    }
    sam.moved = true;
    if (board[move.to.y][move.to.x] == Cel.special) {
        game.lastmovelength = -1;
        game.activeIcon = Cel.empty;
        game.specialUsed[game.teamturn] = true;
    }
    else {
        var src2dst = move.from.to(move.to);
        var movedist = Math.max(Math.abs(src2dst.x), Math.abs(src2dst.y));
        game.activeIcon = board[move.to.y][move.to.x];
        game.teamturn = (game.teamturn + 1) % 2;
        game.lastmovelength = movedist;
    }
    sam.pos.overwrite(move.to);
    game.legalMoves = generateLegalMoves(game);
}
function generateLegalMoves(game, teamturn = game.teamturn) {
    var legalMoves = [];
    let current = new Vector(0, 0);
    for (var sam of game.samurailist.filter((s) => s.team == teamturn)) { //foreach samurai of current team
        loop: for (var dir of directions) { //foreach direction
            current.overwrite(sam.pos);
            var hasIconBeenTouched = false;
            var maxlength = game.lastmovelength == -1 ? maxSpecialMoveLength : game.lastmovelength + 1;
            for (var i = 1; i <= maxlength; i++) {
                current.add(dir);
                if (current.x < 0 || current.x >= board[0].length || current.y < 0 || current.y >= board.length) {
                    continue loop;
                }
                if (game.samurailist.find((s) => s.pos.equals(current) && s != sam)) {
                    continue loop;
                }
                var currentIcon = board[current.y][current.x];
                if (game.activeIcon != Cel.empty && currentIcon != Cel.empty) {
                    if (currentIcon == game.activeIcon) {
                        hasIconBeenTouched = true;
                    }
                    else if (hasIconBeenTouched == false) {
                        continue loop;
                    }
                }
                if (currentIcon == Cel.special && game.specialUsed[teamturn] == true) {
                    continue;
                }
                if ((Math.abs(to(i, game.lastmovelength)) <= 1 || game.lastmovelength == -1) && (hasIconBeenTouched == true || game.activeIcon == Cel.empty)) {
                    legalMoves.push(new Move({ from: sam.pos.c(), to: current.c() }));
                }
            }
        }
    }
    return legalMoves;
}
function rendergametreeRoot(game) {
    document.querySelector('#treebase').innerHTML = '';
    startContext(document.querySelector('#treebase'));
    // cr('ul',{id:'myUL'})
    rendergametree2(game);
    // end()
    endContext();
}
function rendergametree2(game) {
    let children = game.legalMoves.filter(m => m.dest != null);
    if (children.length == 0) {
        game.element = crend('div', gameText(game), { style: 'cursor:pointer; padding-left:10px' }).on('click', () => {
            displaygame = game;
        });
    }
    else {
        game.element = cr('div', { style: 'padding-left:10px' });
        let caret = crend('span', '', { style: 'cursor:pointer;' }).on('click', () => {
            if (container.style.display == 'none') {
                container.style.display = 'block';
                caret.innerHTML = '&#9660;';
            }
            else {
                container.style.display = 'none';
                caret.innerHTML = '&#9658;';
            }
        });
        caret.innerHTML = '&#9658;';
        crend('span', gameText(game), { style: 'cursor:pointer;' }).on('click', () => {
            displaygame = game;
        });
        let container = cr('span', { style: 'display:none' });
        for (let child of children) {
            rendergametree2(child.dest);
        }
        end();
        end();
    }
    if (game.teamturn == 0) {
        game.element.style.background = 'green';
    }
    else {
        game.element.style.background = 'orange';
    }
}
function gameText(game) {
    var _a, _b;
    if (game == null) {
        return 'null';
    }
    if (game.score > 99999) {
        return 'Infinity';
    }
    else if (game.score < -99999) {
        return '-Infinity';
    }
    return `${(_b = (_a = game.score) === null || _a === void 0 ? void 0 : _a.toFixed(1)) !== null && _b !== void 0 ? _b : '?'}`;
    // if(game.children.length == 0){
    //     return `${game.score.toFixed(1)}`
    // }else{
    //     return `${game.children.length}:${game.score.toFixed(1)}`
    // }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpYnMvdmVjdG9yL3ZlY3RvcjIudHMiLCJsaWJzL3V0aWxzL3JuZy50cyIsImxpYnMvdXRpbHMvc3RvcmUudHMiLCJsaWJzL3V0aWxzL3RhYmxlLnRzIiwibGlicy91dGlscy91dGlscy50cyIsImxpYnMvdXRpbHMvc3RvcHdhdGNoLnRzIiwibGlicy91dGlscy9hYmlsaXR5LnRzIiwibGlicy91dGlscy9hbmltLnRzIiwibGlicy9yZWN0L3JlY3QudHMiLCJsaWJzL2V2ZW50L2V2ZW50cXVldWUudHMiLCJsaWJzL2V2ZW50L2V2ZW50c3lzdGVtLnRzIiwibGlicy91dGlscy9jYW1lcmEudHMiLCJsaWJzL25ldHdvcmtpbmcvZW50aXR5LnRzIiwibGlicy9uZXR3b3JraW5nL3NlcnZlci50cyIsImxpYnMvdXRpbHMvZG9tdXRpbHMuanMiLCJzcmMvc2FtdXJhaUFJLnRzIiwic3JjL2dhbWUudHMiLCJzcmMvbW92ZS50cyIsInNyYy9zYW11cmFpLnRzIiwic3JjL3V0aWxzLnRzIiwibWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE1BQU07SUFJUixZQUFZLENBQVEsRUFBQyxDQUFRO1FBQ3pCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDZCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQVE7UUFDUixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDYixPQUFPLElBQUksQ0FBQTtJQUNmLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBUTtRQUNSLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNiLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMs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LElBQUcsUUFBUSxFQUFDLENBQUM7UUFDVCxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzFELENBQUM7SUFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLFFBQVEsRUFBQyxDQUFDLEVBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFDbEcsSUFBRyxLQUFLLEVBQUMsQ0FBQztRQUNOLElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM3RCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDWCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2pDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFdkMsQ0FBQztJQUNELGNBQWMsQ0FBQyxHQUFHLEVBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxTQUFTLENBQUMsVUFBVSxFQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM5SCxJQUFHLEtBQUssRUFBQyxDQUFDO1FB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QUFDLFFBQVEsRUFBQyxRQUFRLENBQUMsQ0FBQTtBQUNoRSxJQUFJLEtBQUssR0FBRztJQUNSLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQ3ZCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUN2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