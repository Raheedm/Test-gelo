import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface NearbyUser {
  id: string;
  username: string;
  name: string;
  distance: number;
  latitude?: number;
  longitude?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api';
  private currentLocationSubject = new BehaviorSubject<Location | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('Requesting geolocation...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position);
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.currentLocationSubject.next(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location access denied';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access was denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  updateLocation(location: Location): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/location/update`, location, { headers });
  }

  getNearbyUsers(location: Location, radius: number = 50): Observable<NearbyUser[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<NearbyUser[]>(`${this.apiUrl}/users/nearby`, {
      headers,
      params: {
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        radius: radius.toString()
      }
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Mock Bluetooth scanning (since real Bluetooth requires native app)
  scanBluetoothDevices(): Promise<any[]> {
    return new Promise((resolve) => {
      // Simulate Bluetooth scan delay
      setTimeout(() => {
        const mockDevices = [
          { name: 'Alex\'s iPhone', address: '00:11:22:33:44:55' },
          { name: 'Sarah\'s Android', address: '00:11:22:33:44:56' },
          { name: 'Mike\'s Laptop', address: '00:11:22:33:44:57' },
          { name: 'Emma\'s MacBook', address: '00:11:22:33:44:58' },
          { name: 'David\'s Phone', address: '00:11:22:33:44:59' }
        ];
        resolve(mockDevices);
      }, 2000);
    });
  }
}