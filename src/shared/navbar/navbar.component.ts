import { Component, OnInit, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../Service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  constructor(private route: Router,
    private renderer: Renderer2,
     private el: ElementRef,
     private authService: AuthService) { }

  ngOnInit() {
    this.route.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.toggleDashboardClass(event.urlAfterRedirects);
      });
  }
  async logout() {
    await this.authService.logout();
    this.route.navigate(['/login']);
    console.log('Logout bem-sucedido!');
  }
  ngAfterViewInit() {
    // Initial check in case the route is already on "dashboard"
    this.toggleDashboardClass(this.route.url);
  }

  private toggleDashboardClass(currentUrl: string): void {
    const navElement = this.el.nativeElement.querySelector('.nav') as HTMLElement;
    if (currentUrl.includes('dashboard')) {
      this.renderer.addClass(navElement, 'dashboard-route');
    } else {
      this.renderer.removeClass(navElement, 'dashboard-route');
    }
  }

  goToRoute(route: string) {
    this.route.navigate([route]);
  }

  goToDash() {
    this.route.navigate(['/dashboard/settings']);

  }
}
