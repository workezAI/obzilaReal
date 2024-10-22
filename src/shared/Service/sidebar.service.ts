import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(false);
  sidebarVisible$ = this.sidebarVisibleSubject.asObservable();

  toggleSidebar() {
    this.sidebarVisibleSubject.next(!this.sidebarVisibleSubject.value);
  }
}
