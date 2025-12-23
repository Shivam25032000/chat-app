import { Component, signal, HostListener, Inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chat-frontend');
  private lastActivity: number = Date.now();
  private readonly TIMEOUT_MS = 5 * 60 * 1000; // 5 Minutes

  constructor(private authService: AuthService, private router: Router) {
    this.startActivityTimer();
  }

  @HostListener('window:mousemove')
  @HostListener('window:click')
  @HostListener('window:keypress')
  refreshActivity() {
    this.lastActivity = Date.now();
  }

  private startActivityTimer() {
    setInterval(() => {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - this.lastActivity;

      if (this.authService.isAuthenticated() && timeSinceLastActivity > this.TIMEOUT_MS) {
        console.log('User inactive for 5+ minutes. Auto-logging out.');
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }, 1000); // Check every second
  }
}
