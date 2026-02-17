let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

class Mino{
    constructor(id){
        this.id = id;
        this.shape = this.getMino(id);
    }
    getMino(id){
        switch(id){
            case 1: return [[0,-1],[0,0],[0,1],[0,2]]; //I
            case 2: return [[0,-1],[0,0],[0,1],[1,-1]]; //J
            case 3: return [[0,-1],[0,0],[0,1],[1,1]]; //L
            case 4: return [[0,0],[0,1],[1,0],[1,1]]; //O
            case 5: return [[1,1],[1,0],[0,0],[0,-1]]; //S
            case 6: return [[0,-1],[0,0],[0,1],[1,0]]; //T
            case 7: return [[0,1],[0,0],[1,0],[1,-1]]; //Z
        }
    }
    static minoColor(id){
        switch(id){
            case 0: return "gray"; //背景色
            case 1: return "cyan";
            case 2: return "blue";
            case 3: return "orange";
            case 4: return "yellow";
            case 5: return "green";
            case 6: return "purple";
            case 7: return "red";
        }
    }
    rotateRight(){
        let newShape = [];
        for(let i=0;i<this.shape.length;i++){
            let x = this.shape[i][0], y = this.shape[i][1];
            newShape.push([-y,x])
        }
        this.shape = newShape;
    }
    rotateLeft(){
        let newShape = [];
        for(let i=0;i<this.shape.length;i++){
            let x = this.shape[i][0], y = this.shape[i][1];
            newShape.push([y,-x])
        }
        this.shape = newShape;
    }
}

class Field{
    constructor(width=10,height=20){
        this.width = width;
        this.height = height;
        this.field = Array.from({length: height}, () => Array(width).fill(0));
        this.cellSize = Math.trunc(canvas.height / height);
        this.buf = [];
        this.mino = null;
        this.minoX = -1;
        this.minoY = -1;
        this.groundTime = 0;
    }
    createMino(){
        if(this.buf.length === 0){
            this.buf = [1,2,3,4,5,6,7];
            this.buf.sort(() => Math.random()-0.5);
        }
        this.mino = new Mino(this.buf.pop());
        this.minoX = this.height;
        this.minoY = this.width / 2 - 1;
    }
    gameover(){
        for(let j=0;j<this.width;j++){
            if(this.field[this.height-1][j] != 0) return true;
        }return false;
    }
    *getAllMinoCoordinate(){
        for(let [i,j] of this.mino.shape){
            yield [this.minoX+i, this.minoY+j];
        }
    }
    fallHeight(){
        for(let k=0;k<=this.minoX;k++){
            for(let [i,j] of this.getAllMinoCoordinate()){
                if(i-k < 0 || i-k < this.height && this.field[i-k][j] != 0){
                    return k-1;
                }
            }
        }return this.minoX;
    }
    setMino(){
        for(let [i,j] of this.getAllMinoCoordinate()){
            if(0 <= i && i < this.height && 0 <= j && j < this.width){
                this.field[i][j] = this.mino.id;
            }
        }
    }
    fullLine(i){
        for(let j=0;j<this.width;j++){
            if(this.field[i][j] == 0){
                return false;
            }
        }return true;
    }
    removeLine(){
        for(let i=this.height-1;i>=0;i--){
            if(this.fullLine(i)){
                this.field.splice(i,1);
                this.field.push(Array(this.width).fill(0));
            }
        }
    }
    advanceOneStep(){
        if(this.mino == null){
            this.createMino();
        }
        if(this.fallHeight() > 0){
            this.minoX--;
            this.groundTime = 0;
        }else{
            this.groundTime++;
        }
        if(this.groundTime >= 3){
            this.setMino();
            this.mino = null;
            this.removeLine();
        }
        this.draw();
    }
    draw(){
        for(let i=0;i<this.height;i++){
            for(let j=0;j<this.width;j++){
                ctx.fillStyle = Mino.minoColor(this.field[i][j]);
                ctx.fillRect(this.cellSize*j, this.cellSize*(this.height-i), this.cellSize-1, this.cellSize-1);
            }
        }
        if(this.mino != null){
            for(let [i,j] of this.getAllMinoCoordinate()){
                if(0 <= i && i < this.height && 0 <= j && j < this.width){
                    ctx.fillStyle = Mino.minoColor(this.mino.id);
                    ctx.fillRect(this.cellSize*j, this.cellSize*(this.height-i), this.cellSize-1, this.cellSize-1);
                }
            }
            let h = this.fallHeight();
            for(let [i,j] of this.getAllMinoCoordinate()){
                if(0 <= i-h && i-h < this.height && 0 <= j && j < this.width){
                    ctx.beginPath();
                    ctx.rect(this.cellSize*j+1, this.cellSize*(this.height-i+h)+1, this.cellSize-3, this.cellSize-3);
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = Mino.minoColor(this.mino.id);
                    ctx.stroke();
                }
            }
        }
    }
    canset(x,y){
        for(let [i,j] of this.mino.shape){
            if(!(0 <= x+i && x+i < this.height && 0 <= y+j && y+j < this.width)){
                return false;
            }if(this.field[x+i][y+j] != 0){
                return false;
            }
        }return true;
    }
    adjust(){
        const d = 3;
        let diff = 2*d+1;
        let ni,nj;
        for(let i=-d;i<=d;i++){
            for(let j=-d;j<=d;j++){
                if(this.canset(this.minoX+i,this.minoY+j) && Math.abs(i)+Math.abs(j) < diff){
                    ni = i;
                    nj = j;
                    diff = Math.abs(i)+Math.abs(j);
                }
            }
        }
        if(ni === undefined) return false;
        this.minoX += ni;
        this.minoY += nj;
        return true;
    }
    moveRight(){
        this.minoY++;
        this.adjust();
        this.draw();
    }
    moveLeft(){
        this.minoY--;
        this.adjust();
        this.draw();
    }
    moveDown(){
        if(this.fallHeight() > 0){
            this.minoX--;
        }
        this.draw();
    }
    rotateRight(){
        this.mino.rotateRight();
        if(!this.adjust()){
            this.mino.rotateLeft();
        }
        this.draw();
    }
    rotateLeft(){
        this.mino.rotateLeft();
        if(!this.adjust()){
            this.mino.rotateRight();
        }
        this.draw();
    }
    drop(){
        this.minoX -= this.fallHeight();
        this.setMino();
        this.removeLine();
        this.mino = null;
        this.draw();
    }
}

function play(){
    canvas.style.display = "block";
    let field = new Field();
    let keys = {};
    const intervalId = setInterval(() => {
        field.advanceOneStep();
        if (field.gameover()) {
            clearInterval(intervalId);
            clearInterval(actionId);
            canvas.style.display = "none";
            gameover();
        }
    }, 500);
    const actionId = setInterval(() => {
        if(keys["ArrowRight"]){
            field.moveRight();
        }if(keys["ArrowLeft"]){
            field.moveLeft();
        }if(keys["ArrowDown"]){
            field.moveDown();
        }
    },75);
    document.addEventListener('keydown',(event) => {
        keys[event.key] = true;
        if(event.key === "a"){
            field.rotateLeft();
        }if(event.key === "d"){
            field.rotateRight();
        }if(event.key === "ArrowUp"){
            field.drop();
        }
    });
    document.addEventListener('keyup',(event) => {
        keys[event.key] = false;
    })
}

function gameover(){
    const gameoverScene = document.getElementById("gameoverScene");
    gameoverScene.style.display = "block";
    const retryButton = document.getElementById("retryButton");
    const titleButton = document.getElementById("titleButton");
    retryButton.onclick = () => {
        gameoverScene.style.display = "none";
        play();
    };
    titleButton.onclick = () => {
        gameoverScene.style.display = "none";
        main();
    }
}

function main(){
    const titleScene = document.getElementById("titleScene");
    titleScene.style.display = "block";
    const playButton = document.getElementById("playButton");
    playButton.onclick = () => {
        titleScene.style.display = "none";
        play();
    };
}

main();