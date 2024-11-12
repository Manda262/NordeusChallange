import { Component, OnInit } from '@angular/core';
import { TerrainService } from '../service/terrain.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  constructor(private terrainService: TerrainService) {}

  ngOnInit(): void {
    this.loadPercentage = 0;
    this.numOfCells = this.terrainService.getNumberOfCells();
    if (!this.numOfCells) this.numOfCells = 20;
    const matrixSize = this.numOfCells * 29 + 1;
    this.pixelMatrix = [];
    this.terrainService.getTerrainMatrix().subscribe(
      (matrixBE: number[][]) => {
        this.terrainMatrix = matrixBE;
        console.log(matrixSize);
        for (let i = 0; i < matrixSize; i++) {
          this.pixelMatrix[i] = [];
          for (let j = 0; j < matrixSize; j++) {
            this.pixelMatrix[i][j] = this.getHeight(i, j);
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

  getColorForHeight(height: number): string {
    return this.terrainService.getColorForHeight(height);
  }

  getHeight(x: number, y: number): number {
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
    let height =
      field1 *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (x % this.numOfCells) -
          this.numOfCells * (y % this.numOfCells) +
          (x % this.numOfCells) * (y % this.numOfCells)) +
      field2 *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (this.numOfCells - (x % this.numOfCells)) -
          this.numOfCells * (y % this.numOfCells) +
          (this.numOfCells - (x % this.numOfCells)) * (y % this.numOfCells)) +
      field3 *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (x % this.numOfCells) -
          this.numOfCells * (this.numOfCells - (y % this.numOfCells)) +
          (x % this.numOfCells) * (this.numOfCells - (y % this.numOfCells))) +
      field4 *
        (this.numOfCells * this.numOfCells -
          this.numOfCells * (this.numOfCells - (x % this.numOfCells)) -
          this.numOfCells * (this.numOfCells - (y % this.numOfCells)) +
          (this.numOfCells - (x % this.numOfCells)) *
            (this.numOfCells - (y % this.numOfCells)));
    height = Math.round(height / (this.numOfCells * this.numOfCells));
    return height;
  }

  getGridTemplate(): string {
    let numRepeat = this.numOfCells * 29 + 1;
    let sizeRepeat =
      this.terrainService.getOriginalCellSize() / this.numOfCells;
    return `repeat(${numRepeat}, ${sizeRepeat}px)`;
  }

  terrainMatrix: number[][] = [];
  pixelMatrix: number[][] = [];
  numOfCells: number;
  loadPercentage: number;
}
