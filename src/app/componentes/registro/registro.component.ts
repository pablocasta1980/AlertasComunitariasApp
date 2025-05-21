import { Component } from '@angular/core';
import { 
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistroUsuarioService } from '../../servicios/registro-usuario.service';
import { RegistroClienteDTO } from '../../dto/registro-cliente-dto';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule], // Habilitar ngModel
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  // Instanciar Clase
  registroClienteDTO: RegistroClienteDTO;

  // Lista de ciudades
  ciudades: string[];

  salidaTexto = '';

  // Para alternar visibilidad
  mostrarPassword: boolean = false; 

  loginForm: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(7)]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(7)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    ciudad: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required, Validators.minLength(7)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(7)])
  });

  constructor(private router: Router, private RegistroService: RegistroUsuarioService) {
    this.registroClienteDTO = new RegistroClienteDTO();
    this.ciudades = [];
    this.cargarCiudades(); // Llamado para llenar las ciudades
  }

  public obtenerInformacion(idUsuario: string) {
    this.RegistroService.obtenerUsuario(idUsuario).subscribe({
      next: (data) => {
        console.log(JSON.stringify(data));
        
        if (data) {
          const r = data.data;
          
          this.salidaTexto = `Nombre: ${r.nombre}, Email: ${r.email}, ciudad: ${r.ciudad}
          Telefono: ${r.telefono}, Direccion: ${r.direccion}`;

        } else {
          this.salidaTexto = 'No se encontró el usuario.';
        }
      },
      error: (error) => {

        if (error.status === 404) {
          console.error(error.error.data);
          
          this.salidaTexto = 'Usuario no encontrado.';
        } else if (error.status === 403) {
          this.salidaTexto = 'Usuario no autentificado';
        } else {
          this.salidaTexto = 'Error al obtener la información.';
        }

        // console.error(JSON.stringify(error));
      },
    });
  }

  public registrar() {

  this.registroClienteDTO.nombre = this.loginForm.get('nombre')?.value;
  this.registroClienteDTO.telefono = this.loginForm.get('telefono')?.value;
  this.registroClienteDTO.ciudad = this.loginForm.get('ciudad')?.value;
  this.registroClienteDTO.direccion = this.loginForm.get('direccion')?.value;
  this.registroClienteDTO.email = this.loginForm.get('email')?.value;
  this.registroClienteDTO.password = this.loginForm.get('password')?.value;

  delete this.registroClienteDTO.confirmaPassword;

  this.RegistroService.registrarUsuario(this.registroClienteDTO).subscribe({
    next: (data) => {
      console.log(JSON.stringify(data));

      if (data) {
        Swal.fire({
          title: 'Registro exitoso',
          text: 'Cliente registrado correctamente. Revisa tu bandeja de entrada.\nSi el correo existe, se te ha enviado un enlace para activar tu cuenta.',
          icon: 'success',
          showConfirmButton: true
        }).then(() => {
          this.router.navigate(['/activar-token', this.registroClienteDTO.email]);
        });
      }
    },
    error: (error) => {
      console.error(JSON.stringify(error));

      let mensajeError = 'Se produjo un error, por favor verifica tus datos o intenta más tarde.';

      if (error.status === 500) {
        mensajeError = error.error.data || 'Error interno del servidor';
      } else if (error.error && error.error.mensaje) {
        mensajeError = error.error.mensaje;
      }

      Swal.fire({
        title: 'Error en el registro',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  });
}

  private cargarCiudades() {
    this.ciudades = ['CALI', 'MEDELLIN', 'ARMENIA', 'MANIZALES', 'PEREIRA', 'BOGOTA'];
  }
}
