import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { LocationService, Location, NearbyUser } from '../services/location.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

// Fix for default Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard-base.css', './dashboard.css', './dashboard-markers.css']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  currentUser: User | null = null;
  currentLocation: Location | null = null;
  nearbyUsers: NearbyUser[] = [];
  bluetoothDevices: any[] = [];

  isScanning = false;
  locationPermissionGranted = false;
  lastUpdated: Date | null = null;
  showUserProfile = false;
  selectedUser: NearbyUser | null = null;

  private map: L.Map | null = null;
  private currentUserMarker: L.Marker | null = null;
  private nearbyUserMarkers: L.Marker[] = [];
  private subscriptions: Subscription[] = [];
  private locationUpdateInterval: any;

  constructor(
    private authService: AuthService,
    private locationService: LocationService,
    private socketService: SocketService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        console.log('Dashboard received user change:', user?.username);
        
        // Clear previous user data when switching users
        if (this.currentUser && user && this.currentUser.id !== user.id) {
          console.log('Different user detected, clearing data');
          this.clearUserData();
        }
        
        this.currentUser = user;
        if (user) {
          this.socketService.connect(user);
        }
      })
    );

    // Subscribe to Socket.IO nearby users updates
    this.subscriptions.push(
      this.socketService.nearbyUsers$.subscribe(users => {
        console.log('Received nearby users from socket for:', this.currentUser?.username, users);
        this.nearbyUsers = users;
        this.lastUpdated = new Date();
        this.updateNearbyUserMarkers();
      })
    );
  }

  private clearUserData(): void {
    this.nearbyUsers = [];
    this.currentLocation = null;
    this.locationPermissionGranted = false;
    this.lastUpdated = null;
    
    // Clear map markers
    if (this.currentUserMarker) {
      this.map?.removeLayer(this.currentUserMarker);
      this.currentUserMarker = null;
    }
    this.nearbyUserMarkers.forEach(marker => this.map?.removeLayer(marker));
    this.nearbyUserMarkers = [];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }
    if (this.map) {
      this.map.remove();
    }
    this.socketService.disconnect();
  }

  async requestLocationPermission(): Promise<void> {
    try {
      const location = await this.locationService.getCurrentPosition();
      this.currentLocation = location;
      this.locationPermissionGranted = true;

      this.locationService.updateLocation(location).subscribe({
        next: () => console.log('Location updated on server'),
        error: (error) => console.error('Failed to update location:', error)
      });

      this.updateCurrentUserMarker();
      this.detectNearbyUsers();
      this.startLocationUpdates();
    } catch (error) {
      console.error('Location permission denied:', error);
      this.locationPermissionGranted = false;
    }
  }

  useMockLocation(): void {
    const mockLocation: Location = {
      latitude: 37.7749,
      longitude: -122.4194
    };

    this.currentLocation = mockLocation;
    this.locationPermissionGranted = true;

    this.locationService.updateLocation(mockLocation).subscribe({
      next: () => console.log('Mock location updated'),
      error: (error) => console.error('Failed to update mock location:', error)
    });

    this.socketService.updateLocation(mockLocation.latitude, mockLocation.longitude);
    this.updateCurrentUserMarker();
    
    setTimeout(() => {
      this.detectNearbyUsers();
    }, 500);
  }

  detectNearbyUsers(): void {
    if (!this.currentLocation) {
      alert('Location permission required');
      return;
    }

    this.isScanning = true;
    console.log('Detecting nearby users at:', this.currentLocation, 'for user:', this.currentUser?.username);

    this.locationService.getNearbyUsers(this.currentLocation)
      .subscribe({
        next: (users) => {
          console.log('Found nearby users:', users, 'for user:', this.currentUser?.username);
          this.nearbyUsers = users;
          this.lastUpdated = new Date();
          this.updateNearbyUserMarkers();
          this.isScanning = false;
        },
        error: (error) => {
          console.error('Failed to get nearby users:', error);
          this.isScanning = false;
        }
      });
  }

  refreshNearbyUsers(): void {
    if (this.currentLocation) {
      this.detectNearbyUsers();
      this.socketService.updateLocation(this.currentLocation.latitude, this.currentLocation.longitude);
    }
  }

  startLocationUpdates(): void {
    this.locationUpdateInterval = setInterval(async () => {
      try {
        const location = await this.locationService.getCurrentPosition();
        this.currentLocation = location;
        console.log('Updating location for user:', this.currentUser?.username, location);
        this.socketService.updateLocation(location.latitude, location.longitude);
        this.locationService.updateLocation(location).subscribe();
        this.updateCurrentUserMarker();
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }, 5000); // Reduced to 5 seconds for better testing
  }

  private initializeMap(): void {
    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }

    try {
      const defaultLat = 37.7749;
      const defaultLng = -122.4194;

      this.map = L.map(this.mapContainer.nativeElement, {
        center: [defaultLat, defaultLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);

      console.log('Map initialized successfully');

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private updateCurrentUserMarker(): void {
    if (!this.map || !this.currentLocation) return;

    // Remove existing current user marker
    if (this.currentUserMarker) {
      this.map.removeLayer(this.currentUserMarker);
    }

    // Create current user marker with enhanced design
    const currentUserIcon = L.divIcon({
      className: 'current-user-marker',
      html: `
        <div class="map-user-indicator current-user">
          <div class="user-pulse"></div>
          <div class="user-avatar">
            <div class="avatar-inner">${this.currentUser?.name?.charAt(0) || 'Me'}</div>
          </div>
          <div class="user-status-dot"></div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.currentUserMarker = L.marker([this.currentLocation.latitude, this.currentLocation.longitude], {
      icon: currentUserIcon
    }).addTo(this.map);

    this.currentUserMarker.bindPopup(`
      <div class="custom-popup">
        <strong>You are here!</strong><br>
        ${this.currentUser?.name || 'Current User'}
      </div>
    `);

    // Center map on current user
    this.map.setView([this.currentLocation.latitude, this.currentLocation.longitude], 15);
  }

  private updateNearbyUserMarkers(): void {
    if (!this.map) return;

    // Clear existing nearby user markers
    this.nearbyUserMarkers.forEach(marker => this.map!.removeLayer(marker));
    this.nearbyUserMarkers = [];

    // Add markers for each nearby user
    this.nearbyUsers.forEach(user => {
      if (user.latitude && user.longitude) {
        const userIcon = L.divIcon({
          className: 'nearby-user-marker',
          html: `
            <div class="map-user-indicator nearby-user">
              <div class="user-avatar">
                <div class="avatar-inner">${user.name.charAt(0)}</div>
              </div>
              <div class="user-status-dot"></div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19]
        });

        const marker = L.marker([user.latitude, user.longitude], {
          icon: userIcon
        }).addTo(this.map!);

        marker.bindPopup(`
          <div class="custom-popup">
            <div class="popup-avatar">${user.name.charAt(0)}</div>
            <div class="popup-info">
              <strong>${user.name}</strong><br>
              @${user.username}<br>
              <span class="popup-distance">${user.distance}m away</span>
            </div>
          </div>
        `);

        marker.on('click', () => {
          this.selectUser(user);
        });

        this.nearbyUserMarkers.push(marker);
      }
    });

    console.log(`Added ${this.nearbyUserMarkers.length} user markers to map`);
  }

  selectUser(user: NearbyUser): void {
    this.selectedUser = user;
    this.showUserProfile = true;
  }

  closeUserProfile(): void {
    this.showUserProfile = false;
    this.selectedUser = null;
  }

  getDistanceColor(distance: number): string {
    if (distance <= 10) return '#27ae60';
    if (distance <= 25) return '#f39c12';
    return '#e74c3c';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  async scanBluetoothDevices(): Promise<void> {
    this.isScanning = true;
    try {
      this.bluetoothDevices = await this.locationService.scanBluetoothDevices();
    } catch (error) {
      console.error('Bluetooth scan failed:', error);
    } finally {
      this.isScanning = false;
    }
  }

  // Helper methods for the mobile UI
  getCardPosition(index: number): { top: number; left: number } {
    const positions = [
      { top: 80, left: 20 },
      { top: 200, left: 250 },
      { top: 350, left: 30 },
      { top: 150, left: 180 },
      { top: 300, left: 200 }
    ];
    return positions[index % positions.length];
  }

  getUserAvatar(user: NearbyUser): string {
    // Generate a placeholder avatar URL based on user name
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff&size=128`;
  }

  // Method to manually clear nearby users if needed
  clearNearbyUsers(): void {
    this.nearbyUsers = [];
    this.updateNearbyUserMarkers();
    console.log('Cleared nearby users');
  }
}