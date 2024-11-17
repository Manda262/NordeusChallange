import { Component, OnInit } from '@angular/core';
import { TerrainService } from '../service/terrain.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
})
export class MainMenuComponent implements OnInit {
  constructor(private terrainService: TerrainService, private router: Router) {}

  ngOnInit(): void {
    this.currHighscore = this.terrainService.getHighscore();
    this.lastScore = this.terrainService.getLevel();
    if (
      !this.currHighscore ||
      (this.lastScore && this.currHighscore < this.lastScore)
    ) {
      this.terrainService.setHighscore(this.lastScore);
    }
  }

  onOptionChange(event: any): void {
    const selectedValue = event.value;
    this.terrainService.setNumberOfCells(selectedValue);
  }

  play() {
    this.terrainService.setNumberOfLives(3);
    this.terrainService.setLevel(1);
    this.router.navigate(['/game']);
  }

  numOfCells: number;
  currHighscore: number;
  lastScore: number;
}
