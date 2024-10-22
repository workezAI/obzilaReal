import { Component } from '@angular/core';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [NavbarComponent,SidebarComponent],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.scss'
})
export class PainelComponent {
  sidebarVisible: boolean = false;

  constructor() { }

  ngOnInit() {

  }
}
