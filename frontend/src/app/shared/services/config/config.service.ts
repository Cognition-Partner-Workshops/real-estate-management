import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AppConfig {
  googleAuthClientId: string;
  mapKey: string;
  webSocketUrl: string;
}

const url = environment.api.server;

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configSub = new BehaviorSubject<AppConfig | null>(null);
  public config$: Observable<AppConfig | null> = this.configSub.asObservable();
  private configLoaded = false;

  constructor(private http: HttpClient) {}

  public get config(): AppConfig | null {
    return this.configSub.getValue();
  }

  public async loadConfig(): Promise<AppConfig> {
    if (this.configLoaded && this.config) {
      return this.config;
    }

    try {
      const config = await firstValueFrom(
        this.http.get<AppConfig>(url + 'config')
      );
      this.configSub.next(config);
      this.configLoaded = true;
      return config;
    } catch (error) {
      console.error('Failed to load config from server, using defaults:', error);
      const defaultConfig: AppConfig = {
        googleAuthClientId: environment.api.googleAuthClientId || '',
        mapKey: environment.api.mapKey || '',
        webSocketUrl: environment.api.webSocketUrl || '',
      };
      this.configSub.next(defaultConfig);
      this.configLoaded = true;
      return defaultConfig;
    }
  }

  public getGoogleAuthClientId(): string {
    return this.config?.googleAuthClientId || environment.api.googleAuthClientId || '';
  }

  public getMapKey(): string {
    return this.config?.mapKey || environment.api.mapKey || '';
  }

  public getWebSocketUrl(): string {
    return this.config?.webSocketUrl || environment.api.webSocketUrl || '';
  }
}
