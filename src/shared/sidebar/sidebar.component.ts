import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { filter } from 'rxjs/operators';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule] // Add CommonModule to imports
})
export class SidebarComponent implements OnInit {

  isSidebarOpen = false;


  constructor(private route: Router, private renderer: Renderer2, private el: ElementRef,private authService: AuthService) {}

  ngOnInit() {
    this.route.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setActiveButton();
      });

    // Initial call to set the active button on load
    this.setActiveButton();
  }
  async logout() {
    await this.authService.logout();
    this.route.navigate(['/login']);
    console.log('Logout bem-sucedido!');
  }
  goToRoute(route: string) {
    this.route.navigate([route]);
  }

  private setActiveButton(): void {
    // Remove the active class from all buttons
    const buttons = this.el.nativeElement.querySelectorAll('.sideBtn');
    buttons.forEach((button: HTMLElement) => {
      this.renderer.removeClass(button, 'activeSideBtn');
    });

    // Get the last segment of the URL
    const urlSegments = this.route.url.split('/');
    const lastSegment = urlSegments[urlSegments.length - 1];

    // Find the matching button and add the active class
    const activeButton = this.el.nativeElement.querySelector(`#sbt-${lastSegment}`);
    if (activeButton) {
      this.renderer.addClass(activeButton, 'activeSideBtn');
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

}
