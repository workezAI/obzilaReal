import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../../../shared/sidebar/sidebar.component';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../shared/Service/auth.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, CalendarModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  isPopupVisible: boolean = false; // Controls popup visibility
  currentDate?: Date;
  userID: string = '';
  affiliateData: any;
  affiliateUrls = { basic: '', gold: '' }; // To store the URLs with the ref parameter

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.currentDate = new Date();
    this.setUserIDFromToken();
    this.fetchAffiliateDetails();
    if (this.userID) {
      this.auth.getUserById(this.userID).then((data) => {
        if (data) {
          this.userID = data.id;
          console.log('User data:', this.userID);
        }
      }).catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }

  setUserIDFromToken(): void {
    const token = localStorage.getItem('authToken');
    console.log('Token:', token);
    if (token) {
      const decodedToken = this.auth.decodeToken(token);
      console.log('Decoded token:', decodedToken);
      if (decodedToken && decodedToken.id) {
        this.userID = decodedToken.id;
      }
    }
  }

  async fetchAffiliateDetails(): Promise<void> {
    if (!this.userID) {
      console.error('User ID is not set');
      return;
    }

    const url = `https://webhook.workez.online/webhook/4ba7842e-4fcd-49ac-8c05-d6856a1e08fa/getAffiliateDetails/${this.userID}`;

    this.http.get(url).subscribe({
      next: (data: any) => {
        this.affiliateData = data;
        const codigoAfiliado = this.affiliateData?.data?.codigo_afiliado;

        if (codigoAfiliado) {
          // Set the URLs with the ref parameter
          this.affiliateUrls.basic = `https://checkout.perfectpay.com.br/pay/PPU38CP4O1P?ref=${codigoAfiliado}`;
          this.affiliateUrls.gold = `https://checkout.perfectpay.com.br/pay/PPU38CP4O1Q?ref=${codigoAfiliado}`;
        }

        console.log('Affiliate URLs:', this.affiliateUrls);
      },
      error: (error) => {
        console.error('Error fetching affiliate details:', error);
      }
    });
  }

  copyToClipboard(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      console.log('URL copied to clipboard:', url);
    }).catch((error) => {
      console.error('Failed to copy URL:', error);
    });
  }
  handlePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

}
