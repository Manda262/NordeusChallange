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

  ngOnInit(): void {}

  onOptionChange(event: any): void {
    const selectedValue = event.value;
    this.terrainService.setNumberOfCells(selectedValue);
  }

  numOfCells: number;
}
