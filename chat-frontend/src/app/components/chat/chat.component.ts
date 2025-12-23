import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router'; // Added Router import
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models/chat-message';
import { Subscription, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatInputModule, MatButtonModule, MatIconModule, MatToolbarModule, MatListModule, MatAutocompleteModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

    inputMessage = '';
    messages: ChatMessage[] = [];
    currentUser: string | null = '';
    recipientId = '';
    private messageSub: Subscription | undefined;

    users: any[] = [];
    filteredUsers: Observable<any[]> | undefined;
    recipientControl = new FormControl('');

    constructor(
        private chatService: ChatService,
        private authService: AuthService,
        private router: Router,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.currentUser();
        if (this.currentUser) {
            this.chatService.connect(this.currentUser);
            this.messageSub = this.chatService.getMessages().subscribe(msg => {
                this.ngZone.run(() => {
                    console.log('ChatComponent applied message:', msg);
                    this.messages = [...this.messages, msg]; // Create new array reference
                    this.cdr.detectChanges(); // Force UI Update
                });
            });

            this.authService.getUsers().subscribe(users => {
                this.users = users.filter((u: any) => u.username !== this.currentUser);
                this.filteredUsers = this.recipientControl.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(value || ''))
                );
            });

            this.recipientControl.valueChanges.subscribe(val => {
                this.recipientId = val || '';
            });
        }
    }

    private _filter(value: string): any[] {
        const filterValue = value.toLowerCase();
        return this.users.filter(user => user.username.toLowerCase().includes(filterValue));
    }

    ngOnDestroy() {
        if (this.messageSub) {
            this.messageSub.unsubscribe();
        }
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    sendMessage() {
        if (!this.inputMessage.trim() || !this.recipientId) return;

        const message: ChatMessage = {
            senderId: this.currentUser!,
            recipientId: this.recipientId,
            content: this.inputMessage,
            timestamp: new Date().toLocaleString()
        };

        this.chatService.sendMessage(message);
        this.messages.push(message);
        this.inputMessage = '';
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']); // Use router navigation
    }
}
