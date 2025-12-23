import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Stomp } from 'stompjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {

    private stompClient: any;
    private messageSubject = new Subject<any>();

    constructor() { }

    connect(username: string): void {
        const socket = new SockJS('http://localhost:8082/ws'); // Connecting directly to Chat Service to debug Gateway issues
        // Note: Gateway routing for WebSocket might need specific config or direct service URL
        // If Gateway strips prefix, we might need http://localhost:8080/chat-service/ws or configure route
        // For now assuming Gateway routes /ws to chat-service
        this.stompClient = Stomp.over(socket);

        const _this = this;
        this.stompClient.connect({}, function (frame: any) {
            console.log('Connected: ' + frame);
            const topic = '/topic/messages/' + username;
            console.log('Subscribing to: ' + topic);
            _this.stompClient.subscribe(topic, function (msg: any) {
                console.log('Received raw message:', msg.body);
                _this.messageSubject.next(JSON.parse(msg.body));
            });
        });
    }

    sendMessage(message: any): void {
        this.stompClient.send("/app/chat", {}, JSON.stringify(message));
    }

    getMessages() {
        return this.messageSubject.asObservable();
    }
}
