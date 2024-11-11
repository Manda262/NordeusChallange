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
    this.numOfCells = this.terrainService.getNumberOfCells();
    this.terrainService.getTerrainMatrix().subscribe(
      (matrixBE: number[][]) => {
        this.terrainMatrix = matrixBE;
      },
      (error) => {
        console.error('Error fetching terrain matrix:', error);
      }
    );
    this.columns = Array(this.numOfCells * 29 + 1)
      .fill(null)
      .map((x, i) => i);
    this.rows = Array(this.numOfCells * 29 + 1)
      .fill(null)
      .map((x, i) => i);
  }

  getColorForHeight(x: number, y: number): string {
    return this.terrainService.getColorForHeight(this.getHeight(x, y));
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
    console.log(x, y, height, field1, field2, field3, field4);
    return height;
  }

  getGridTemplate(): string {
    let numRepeat = this.numOfCells * 29 + 1;
    let sizeRepeat =
      this.terrainService.getOriginalCellSize() / this.numOfCells;
    return `repeat(${numRepeat}, ${sizeRepeat}px)`;
  }

  terrainMatrix: number[][] = [];
  rows: number[];
  columns: number[];
  numOfCells: number;
}
