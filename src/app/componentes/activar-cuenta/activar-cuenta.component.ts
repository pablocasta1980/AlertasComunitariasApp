import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CambioPasswordDTO } from '../../dto/CambioPasswordDTO';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistroUsuarioService } from '../../servicios/registro-usuario.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activar-cuenta',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './activar-cuenta.component.html',
  styleUrl: './activar-cuenta.component.css'
})
export class ActivarCuentaComponent implements OnInit {
  tokenEmail: string = '';
  contraseniasNoCoinciden: boolean = false;

  mostrarPassword: boolean = false;

  cambioPassword = {
    token: '',
    correo: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private RegistroUsuarioService: RegistroUsuarioService
  ) {
    this.route.paramMap.subscribe(params => {
      this.tokenEmail = params.get('email') || '';
    });
  }

  ngOnInit(): void {
    this.cambioPassword.correo = this.tokenEmail;
  }

ActivarCuenta() {
  this.RegistroUsuarioService.activarUsuario(this.cambioPassword.correo, this.cambioPassword.token).subscribe({
    next: (data) => {
      Swal.fire({
        title: 'Cuenta activada',
        text: data.mensaje,
        icon: 'success',
        confirmButtonText: 'Ir al login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    },
    error: (error) => {
      console.error(JSON.stringify(error));

      let mensajeError = error.error?.mensaje || 'Se produjo un error al activar la cuenta';

      if (error.status === 200) {
        mensajeError = 'No se puede activar la cuenta';
        this.router.navigate(['/']);
      }

      Swal.fire({
        title: 'Error de activación',
        text: mensajeError,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });

      if (error.status === 500) {
        console.error('Error en el servidor');
      }
    },
  });
}
}

