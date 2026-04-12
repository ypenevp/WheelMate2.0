import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as encoding from 'text-encoding';

Object.assign(global, {
    TextEncoder: encoding.TextEncoder,
    TextDecoder: encoding.TextDecoder,
});

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.isConnected = false;
        this.pendingSubscriptions = [];
    }

    connect(url) {
        if (this.stompClient) return;

        const socket = new SockJS(url);
        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => { console.log('STOMP: ', str); },
            onConnect: () => {
                console.log('Connected to WebSocket server!');
                this.isConnected = true;

                this.pendingSubscriptions.forEach((sub) => {
                    sub.subscriptionObj = this.stompClient.subscribe(sub.topic, sub.callback);
                });
                this.pendingSubscriptions = [];
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
            }
        });

        this.stompClient.activate();
    }

    disconnect() {
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
            this.isConnected = false;
            console.log('Disconnected from WebSocket server.');
        }
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.isConnected) {
            const subObj = { topic, callback, subscriptionObj: null };
            this.pendingSubscriptions.push(subObj);

            return {
                unsubscribe: () => {
                    const index = this.pendingSubscriptions.indexOf(subObj);
                    if (index > -1) this.pendingSubscriptions.splice(index, 1);
                }
            };
        }

        const subscription = this.stompClient.subscribe(topic, callback);
        return subscription;
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
