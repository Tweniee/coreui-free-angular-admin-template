import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Module {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  displayIcon?: string;
  displayColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModulesService {
  private apiUrl = `${environment.apiUrl}${environment.apiEndpoints.modules}`;

  constructor(private http: HttpClient) {}

  getAllModules(): Observable<Module[]> {
    return this.http.get<Module[]>(this.apiUrl);
  }

  getModuleById(id: string): Observable<Module> {
    return this.http.get<Module>(`${this.apiUrl}/${id}`);
  }

  createModule(module: Partial<Module>): Observable<Module> {
    return this.http.post<Module>(this.apiUrl, module);
  }

  updateModule(id: string, module: Partial<Module>): Observable<Module> {
    return this.http.put<Module>(`${this.apiUrl}/${id}`, module);
  }

  deleteModule(id: string): Observable<Module> {
    return this.http.delete<Module>(`${this.apiUrl}/${id}`);
  }
}
