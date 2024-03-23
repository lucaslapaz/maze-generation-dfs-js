const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;
let lastTimestamp = 0;
let deltatime = 0;

const mouse = {
  x: 0,
  y: 0,
};
canvas.addEventListener("mousemove", function (event) {
  mouse.x = event.offsetX;
  mouse.y = event.offsetY;
});

class Grid {
  constructor(width, height) {
    this.gridSchema = [];
    this.width = width;
    this.height = height;
    this.tileWidth = 19; //canvas.width / gridSchema[0].length;
    this.tileHeight = 19; //canvas.height / gridSchema.length;
    this.generateGrid();
  }

  generateGrid() {
    for (let h = 0; h < this.height; h++) {
      this.gridSchema.push([]);
      for (let w = 0; w < this.width; w++) {
        let tile = new Tile(
          this.tileWidth * w,
          this.tileHeight * h,
          this.tileWidth,
          this.tileHeight,
          1
        );
        this.gridSchema[h][w] = tile;
        renderList.push(tile);
      }
    }
    this.generateMaze();
  }
  generateMaze() {
    const origem = {
      x: Math.round(Math.random() * (this.gridSchema[0].length - 1)),
      y: Math.round(Math.random() * (this.gridSchema.length - 1)),
    };
    const destino = {
      x: Math.round(Math.random() * (this.gridSchema[0].length - 1)),
      y: Math.round(Math.random() * (this.gridSchema.length - 1)),
    };
    if (origem.x == destino.x && origem.y == destino.y) {
      this.generateMaze();
      console.log("Gerando nova origem e destino pois eram iguais.");
    }

    //origem.y = 1;
    //origem.x = 0;
    this.gridSchema[origem.y][origem.x].changeType(0);
    this.gridSchema[origem.y][origem.x].changeParent(null);
    let actualTile = [origem.y, origem.x];
    let secondTile = null;

    
    // this.gridSchema[destino.y][destino.x].changeType(2);

    let intervalo = setInterval(() => {

        let yy = actualTile[0];
        let xx = actualTile[1];

        let left = this.verifyTile(yy, xx, [yy, xx-1], [yy, xx-2]);
        let right = this.verifyTile(yy, xx, [yy, xx+1], [yy, xx+2]);
        let top = this.verifyTile(yy, xx, [yy-1, xx], [yy-2, xx]);
        let bottom = this.verifyTile(yy, xx, [yy+1, xx], [yy+2, xx]);

        let possibilidades = [];

        if(left){
            possibilidades.push('left');
        }
        if(right){
            possibilidades.push('right');
        }
        if(top){
            possibilidades.push('top');
        }
        if(bottom){
            possibilidades.push('bottom');
        }

        let direcao = possibilidades[Math.floor(Math.random() * possibilidades.length)];
        
        if(direcao){
            let nextPositions = [];
            switch(direcao){
                case 'left':
                    nextPositions = left;
                    break;
                case 'right':
                    nextPositions = right;
                    break;
                case 'top':
                    nextPositions = top;
                    break;
                case 'bottom':
                    nextPositions = bottom;
                    break;
                default:
                    nextPositions = [];
                    break;
            }
            
            if(nextPositions.length > 0){
                for(let position of nextPositions){
                    let nextTile = this.gridSchema[position[0]][position[1]]
                    nextTile.changeType(0);
                    nextTile.changeParent(actualTile);
                    actualTile = [position[0],position[1]]
                    if(secondTile == null){
                        secondTile = position;
                    }
                }
            }
        }else{
            for(let i = 0; i < 2; i++){
                let actual = this.gridSchema[actualTile[0]][actualTile[1]];
                let previousPosition = actual.parent;
                if(previousPosition){
                    actualTile = previousPosition
                }else{
                    location.reload();
                    clearInterval(intervalo);
                }
                actual.changeType(4);
            }
        }
    }, 10)

  }
  verifyTile(yy, xx, first, second){
    if(this.gridSchema[yy] && this.gridSchema[yy][xx]){
        if(this.gridSchema[first[0]] && this.gridSchema[second[0]] && this.gridSchema[first[0]][first[1]] && this.gridSchema[second[0]][second[1]]){
            if(this.gridSchema[first[0]][first[1]].type == 1 && this.gridSchema[second[0]][second[1]].type == 1){
                return [first, second];
            }
        }
    }
    return null;
  }

  draw() {}
  update() {
    this.draw();
  }
}

class Tile {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.parent = null;
    this.changeType(type);
  }
  changeParent(parent){
    this.parent = parent;
  }
  changeType(type = 0) {
    switch (type) {
      case 0: // caminho
        this.color = "white";
        break;
      case 1: // parede
        this.color = "black";
        break;
      case 2: // destino
        this.color = "blue";
        break;
      case 3: // origem
        this.color = "yellow";
        break;
      case 4: // voltou
        this.color = "crimson";
        break;
      default: // caminho
        type = 1;
        this.color = "black";
        break;
    }
    this.type = type;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = "0.1";
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.stroke();
  }
  update() {
    this.draw();
  }
}

const renderList = [];
renderList.push(new Grid(31, 31));

const animate = function (timestamp) {
  delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const object of renderList) {
    object.update();
  }

  requestAnimationFrame(animate);
};

animate();
