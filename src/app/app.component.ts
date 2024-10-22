import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastrModule],
  templateUrl: './app.component.html' ,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nome-do-projeto';
}
