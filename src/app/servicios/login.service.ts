import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginDTO } from '../dto/LoginDTO';
import { delay, Observable } from 'rxjs';
import { RutasDeNavegacion } from './rutadenavegacion';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = RutasDeNavegacion.apiUrl+"/auth";

  constructor(private http: HttpClient) {}

login(loginData: LoginDTO): Observable<any> {
  console.log(`Endpoint de login: ${this.apiUrl}/login`);
  return this.http.post(`${this.apiUrl}/login`, loginData).pipe();
}
  
  recuperarContrasena(loginData: LoginDTO): Observable<any> {
    return this.http.post(this.apiUrl+"/recuperarPassword", loginData);
  }
  
  cambiarContrasena(loginData: LoginDTO): Observable<any> {
    return this.http.post(this.apiUrl+"/cambiar-password", loginData);
  }
}