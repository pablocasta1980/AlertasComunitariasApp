import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { AuthService } from '../../servicios/auth.service';
import { RecuperarCuentaDTO } from '../../dto/RecuperarCuentaDTO';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar-cuenta',
  templateUrl: './recuperar-cuenta.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  styleUrls: ['./recuperar-cuenta.component.css']
})
export class RecuperarCuentaComponent {
  email: string = '';
  recuperarDTO: RecuperarCuentaDTO;

  constructor(private router: Router, private authService: AuthService ) { 
    this.recuperarDTO = new RecuperarCuentaDTO();
  }

  recuperarContrasena() {
    this.recuperarDTO.email = this.email;

    this.authService.enviarLinkRecuperacionPass(this.recuperarDTO).subscribe({
      next: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Revise su bandeja de entrada. Si el correo existe, se ha enviado un correo de recuperación.',
          confirmButtonColor: '#0d6efd'
        }).then(() => {
          this.router.navigate(['/cambiar-contrasena', this.recuperarDTO.email]);
        });
      },
      error: (error) => {
        let mensajeError = 'Se produjo un error. Verifica tus datos o intenta más tarde.';

        if (error.status === 500) {
          mensajeError = 'Error de conexión con el servidor.';
        } else if (error.error && error.error.mensaje) {
          mensajeError = error.error.mensaje;
        } else if (error.error?.data?.[0]?.mensaje) {
          mensajeError = error.error.data[0].mensaje;
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensajeError,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}
