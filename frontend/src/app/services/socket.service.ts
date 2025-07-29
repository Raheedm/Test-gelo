import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { NearbyUser } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private nearbyUsersSubject = new BehaviorSubject<NearbyUser[]>([]);
  public nearbyUsers$ = this.nearbyUsersSubject.asObservable();

  constructor(private authService: AuthService) {
    this.socket = io('http://localhost:3000');
    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    this.socket.on('nearby-users', (users: NearbyUser[]) => {
      console.log('Received nearby users via Socket.IO:', users);
      this.nearbyUsersSubject.next(users);
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });
  }

  connect(user: any): void {
    console.log('Connecting socket for user:', user.username);
    this.socket.emit('user-online', {
      userId: user.id,
      username: user.username,
      name: user.name
    });
  }

  updateLocation(latitude: number, longitude: number): void {
    console.log('Updating location via socket:', { latitude, longitude });
    this.socket.emit('location-update', { latitude, longitude });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}