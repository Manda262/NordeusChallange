import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cell } from '../models/cell';

@Injectable({
  providedIn: 'root',
})
export class TerrainService {
  constructor(private http: HttpClient) {}

  private colorPalette = [
    { height: 0, color: '#5dade2' }, // Voda (plava)
    { height: 50, color: '#a3d9a5' }, // Svetlo toplija zelena
    { height: 100, color: '#8dc381' }, // Srednje toplija zelena
    { height: 150, color: '#7dae6d' }, // Srednje tamna zelena
    { height: 200, color: '#6e965c' }, // Tamnija zelena
    { height: 250, color: '#5f7f4a' }, // Tamno maslinasto zelena (prvi braon prelaz)

    // Toplije braon nijanse za više visine
    { height: 300, color: '#c79b76' }, // Svetla peskovito braon
    { height: 350, color: '#b38463' }, // Svetlija karamel braon
    { height: 400, color: '#a3714f' }, // Svetlo toplija braon
    { height: 450, color: '#956445' }, // Srednje svetla braon
    { height: 500, color: '#87583b' }, // Srednje braon
    { height: 550, color: '#7a4d32' }, // Tamno braon
    { height: 600, color: '#6c4128' }, // Tamna zemljasto braon
    { height: 650, color: '#5f3721' }, // Čokoladno braon
    { height: 700, color: '#54301b' }, // Tamna čokoladna braon
    { height: 750, color: '#4a2917' }, // Tamno smeđa
    { height: 800, color: '#402212' }, // Tamnija smeđa
    { height: 850, color: '#361c0f' }, // Vrlo tamna zemljasta braon
    { height: 900, color: '#2d170d' }, // Najtamnija zemljasta braon
    { height: 950, color: '#25120a' }, // Skoro crna braon za najviše nadmorske visine
    { height: 1000, color: '#1f0f08' }, // Vrlo tamna braon za najvišu tačku
  ];

  private originalCellSize = 20;

  getColorForHeight(height: number): string {
    if (height <= 0) return this.colorPalette[0].color;
    if (height >= 1000)
      return this.colorPalette[this.colorPalette.length - 1].color;

    // Find the two closest color stops
    const lower = this.colorPalette.find(
      (stop, i, arr) => stop.height <= height && arr[i + 1]?.height > height
    );
    const upper =
      this.colorPalette.find((stop) => stop.height > height) || lower;

    // Calculate the interpolation ratio
    const ratio =
      (height - (lower?.height || 0)) /
      ((upper?.height || 1) - (lower?.height || 1));
    return this.interpolateColor(lower!.color, upper!.color, ratio);
  }

  // Helper function to interpolate between two hex colors
  private interpolateColor(
    color1: string,
    color2: string,
    ratio: number
  ): string {
    const hex = (color: string) =>
      color
        .replace('#', '')
        .match(/.{1,2}/g)!
        .map((h) => parseInt(h, 16));
    const [r1, g1, b1] = hex(color1);
    const [r2, g2, b2] = hex(color2);
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  getTerrainMatrix(): Observable<Cell[][]> {
    return this.http
      .get('https://jobfair.nordeus.com/jf24-fullstack-challenge/test', {
        responseType: 'text',
      })
      .pipe(map((responseText) => this.parseTextToMatrix(responseText)));
  }

  // Parsing logic to convert text to a 2D array of Cell objects
  private parseTextToMatrix(text: string): Cell[][] {
    return text
      .trim()
      .split('\n')
      .map((row, y) =>
        row.split(' ').map((cellValue, x) => ({
          height: parseFloat(cellValue),
          x: x,
          y: y,
          visited: false,
          highest: false,
        }))
      );
  }

  setNumberOfCells(numOfCells: number) {
    localStorage.setItem('numOfCells', JSON.stringify(numOfCells));
  }

  getNumberOfCells(): number {
    return JSON.parse(localStorage.getItem('numOfCells'));
  }

  getOriginalCellSize() {
    return this.originalCellSize;
  }

  setNumberOfLives(numOfLives: number) {
    localStorage.setItem('numOfLives', JSON.stringify(numOfLives));
  }

  getNumberOfLives() {
    return JSON.parse(localStorage.getItem('numOfLives'));
  }

  getLevel() {
    return JSON.parse(localStorage.getItem('level'));
  }

  setLevel(level: number) {
    localStorage.setItem('level', JSON.stringify(level));
  }

  getHighscore() {
    return JSON.parse(localStorage.getItem('highscore'));
  }

  setHighscore(score: number) {
    localStorage.setItem('highscore', JSON.stringify(score));
  }
}
