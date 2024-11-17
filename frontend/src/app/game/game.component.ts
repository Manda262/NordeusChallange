import { Component, OnInit } from '@angular/core';
import { TerrainService } from '../service/terrain.service';
import { Cell } from '../models/cell';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private terrainService: TerrainService, private router: Router) {}

  ngOnInit(): void {
    this.currHighscore = this.terrainService.getHighscore();
    this.numOfLives = this.terrainService.getNumberOfLives();
    this.currLevel = this.terrainService.getLevel();
    this.loadPercentage = 0;
    this.numOfCells = this.terrainService.getNumberOfCells();
    if (!this.numOfCells) this.numOfCells = 2;
    const matrixSize = this.numOfCells * 29 + 1;
    this.pixelMatrix = [];
    this.islandsList = [];
    this.terrainService.getTerrainMatrix().subscribe(
      (matrixBE: Cell[][]) => {
        this.terrainMatrix = matrixBE;

        for (let i = 0; i < 30; i++) {
          for (let j = 0; j < 30; j++) {
            let [totalHeight, totalCells] = this.calcHighest(0, 0, i, j);
            if (totalCells != 0) {
              let cell = new Cell();
              cell.height = totalHeight / totalCells;
              cell.x = i;
              cell.y = j;
              this.islandsList.push(cell);
            }
          }
        }

        let highestIslandCell = this.findHighestCell(this.islandsList);
        this.setHeighestIsland(highestIslandCell.x, highestIslandCell.y);

        for (let i = 0; i < matrixSize; i++) {
          this.pixelMatrix[i] = [];
          for (let j = 0; j < matrixSize; j++) {
            this.pixelMatrix[i][j] = new Cell();
            this.setPixel(i, j);
            if (j == 0) {
              this.loadPercentage =
                (100 * (i * matrixSize + j)) / (matrixSize * matrixSize);
            }
          }
        }
        this.loadPercentage = 100;
      },
      (error) => {
        console.error('Error fetching terrain matrix:', error);
      }
    );
  }

  calcHighest(
    totalHeight: number,
    totalCells: number,
    x: number,
    y: number
  ): [number, number] {
    if (
      x < 0 ||
      x >= 30 ||
      y < 0 ||
      y >= 30 ||
      this.terrainMatrix[x][y].height == 0 ||
      this.terrainMatrix[x][y].visited
    )
      return [0, 0];

    this.terrainMatrix[x][y].visited = true;
    let [totalHeight11, totalCells11] = this.calcHighest(
      totalHeight,
      totalCells,
      x - 1,
      y - 1
    );
    let [totalHeight12, totalCells12] = this.calcHighest(
      totalHeight,
      totalCells,
      x,
      y - 1
    );
    let [totalHeight13, totalCells13] = this.calcHighest(
      totalHeight,
      totalCells,
      x + 1,
      y - 1
    );
    let [totalHeight21, totalCells21] = this.calcHighest(
      totalHeight,
      totalCells,
      x - 1,
      y
    );
    let [totalHeight23, totalCells23] = this.calcHighest(
      totalHeight,
      totalCells,
      x + 1,
      y
    );
    let [totalHeight31, totalCells31] = this.calcHighest(
      totalHeight,
      totalCells,
      x - 1,
      y + 1
    );
    let [totalHeight32, totalCells32] = this.calcHighest(
      totalHeight,
      totalCells,
      x,
      y + 1
    );
    let [totalHeight33, totalCells33] = this.calcHighest(
      totalHeight,
      totalCells,
      x + 1,
      y + 1
    );
    let myTotalHeight =
      totalHeight11 +
      totalHeight12 +
      totalHeight13 +
      totalHeight21 +
      totalHeight23 +
      totalHeight31 +
      totalHeight32 +
      totalHeight33 +
      this.terrainMatrix[x][y].height;
    let myTotalCells =
      totalCells11 +
      totalCells12 +
      totalCells13 +
      totalCells21 +
      totalCells23 +
      totalCells31 +
      totalCells32 +
      totalCells33 +
      1;
    return [myTotalHeight, myTotalCells];
  }

  getColorForHeight(height: number): string {
    return this.terrainService.getColorForHeight(height);
  }

  setPixel(x: number, y: number) {
    let xQuart = Math.floor(x / this.numOfCells);
    let yQuart = Math.floor(y / this.numOfCells);
    let field1 = this.terrainMatrix[xQuart][yQuart];
    let field2;
    let field3;
    let field4;
    if (xQuart != 29) field2 = this.terrainMatrix[xQuart + 1][yQuart];
    else field2 = this.terrainMatrix[xQuart][yQuart];
    if (yQuart != 29) field3 = this.terrainMatrix[xQuart][yQuart + 1];
    else field3 = this.terrainMatrix[xQuart][yQuart];
    if (xQuart == 29 && yQuart == 29)
      field4 = this.terrainMatrix[xQuart][yQuart];
    if (xQuart == 29 && yQuart != 29)
      field4 = this.terrainMatrix[xQuart][yQuart + 1];
    if (xQuart != 29 && yQuart == 29)
      field4 = this.terrainMatrix[xQuart + 1][yQuart];
    if (xQuart != 29 && yQuart != 29)
      field4 = this.terrainMatrix[xQuart + 1][yQuart + 1];
    this.setPixeHeight(x, y, field1, field2, field3, field4);
    this.setPixelHighest(x, y, field1, field2, field3, field4);
  }

  setPixeHeight(
    x: number,
    y: number,
    field1: Cell,
    field2: Cell,
    field3: Cell,
    field4: Cell
  ) {
    let height =
      field1.height *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (x % this.numOfCells) -
          this.numOfCells * (y % this.numOfCells) +
          (x % this.numOfCells) * (y % this.numOfCells)) +
      field2.height *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (this.numOfCells - (x % this.numOfCells)) -
          this.numOfCells * (y % this.numOfCells) +
          (this.numOfCells - (x % this.numOfCells)) * (y % this.numOfCells)) +
      field3.height *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (x % this.numOfCells) -
          this.numOfCells * (this.numOfCells - (y % this.numOfCells)) +
          (x % this.numOfCells) * (this.numOfCells - (y % this.numOfCells))) +
      field4.height *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (this.numOfCells - (x % this.numOfCells)) -
          this.numOfCells * (this.numOfCells - (y % this.numOfCells)) +
          (this.numOfCells - (x % this.numOfCells)) *
            (this.numOfCells - (y % this.numOfCells)));
    height = Math.round(height / (this.numOfCells * this.numOfCells));
    this.pixelMatrix[x][y].height = height;
  }

  setPixelHighest(
    x: number,
    y: number,
    field1: Cell,
    field2: Cell,
    field3: Cell,
    field4: Cell
  ) {
    this.pixelMatrix[x][y].highest =
      this.pixelMatrix[x][y].height > 0 &&
      (field1.highest || field2.highest || field3.highest || field4.highest);
  }

  getGridTemplate(): string {
    let numRepeat = this.numOfCells * 29 + 1;
    let sizeRepeat =
      this.terrainService.getOriginalCellSize() / this.numOfCells;
    return `repeat(${numRepeat}, ${sizeRepeat}px)`;
  }

  findHighestCell(cells: Cell[]): Cell | null {
    if (cells.length === 0) return null;

    return cells.reduce((maxCell, currentCell) =>
      currentCell.height > maxCell.height ? currentCell : maxCell
    );
  }

  setHeighestIsland(x: number, y: number) {
    if (
      x < 0 ||
      x >= 30 ||
      y < 0 ||
      y >= 30 ||
      this.terrainMatrix[x][y].height == 0 ||
      this.terrainMatrix[x][y].highest
    )
      return;

    this.terrainMatrix[x][y].highest = true;

    this.setHeighestIsland(x - 1, y - 1);
    this.setHeighestIsland(x, y - 1);
    this.setHeighestIsland(x + 1, y - 1);
    this.setHeighestIsland(x - 1, y);
    this.setHeighestIsland(x + 1, y);
    this.setHeighestIsland(x - 1, y + 1);
    this.setHeighestIsland(x, y + 1);
    this.setHeighestIsland(x + 1, y + 1);
  }

  guess(highest: boolean) {
    if (highest) {
      this.triggerCorrectGuessEffect();
    } else {
      this.triggerWrongGuessEffect();
    }
  }

  private triggerWrongGuessEffect() {
    this.isWrongGuess = true;
    setTimeout(() => {
      this.isWrongGuess = false;
      this.terrainService.setNumberOfLives(this.numOfLives - 1);
      this.numOfLives--;
    }, 300);
  }

  backToMainMenu() {
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });
  }

  private triggerCorrectGuessEffect() {
    this.isCorrectGuess = true;
    setTimeout(() => {
      this.isCorrectGuess = false;
      this.increaseLevel();
      window.location.reload();
    }, 300);
  }

  isLive(i: number) {
    return this.numOfLives >= i;
  }

  increaseLevel() {
    this.terrainService.setLevel(this.currLevel + 1);
  }

  terrainMatrix: Cell[][] = [];
  pixelMatrix: Cell[][] = [];
  numOfCells: number;
  loadPercentage: number;
  islandsList: Cell[] = [];
  livesArray = [1, 2, 3];
  numOfLives: number;
  currLevel: number;
  currHighscore: number;
  isWrongGuess = false;
  isCorrectGuess = false;
}
