import { Component } from '@angular/core';
import { 
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators,
  FormsModule 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegistroUsuarioService } from '../../servicios/registro-usuario.service';
import { ActualizarClienteDTO } from '../../dto/actualizar-cliente-dto';
import { UsuarioDTO } from '../../dto/usuario-dto';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { TokenService } from '../../servicios/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule,
    FormsModule
  ], // Habilitar ngModel
  templateUrl: './cuenta.component.html',
  styleUrl: './cuenta.component.css'
})
export class CuentaComponent{
  // Instanciar Clase
  ActualizarClienteDTO: ActualizarClienteDTO;

  // Lista de ciudades
  ciudades: string[];

  //Lista Usuarios 
  usuarios: UsuarioDTO[]; 

  terminoBusqueda: string = '';

  salidaTexto = '';

  // Para alternar visibilidad
  mostrarPassword: boolean = false;

  email: string = '';

  loginForm: FormGroup = new FormGroup({
    idUsuario: new FormControl('', [Validators.required]),
    nombre: new FormControl('', [Validators.required, Validators.minLength(7)]),
    telefono: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.minLength(7)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    ciudad: new FormControl('', [Validators.required]),
    direccion: new FormControl('', [Validators.required, Validators.minLength(7)]),
    // password: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(7)])
  });

  constructor(private router: Router, 
    private RegistroService: RegistroUsuarioService,
    private tokenService: TokenService) {
    this.ActualizarClienteDTO = new ActualizarClienteDTO();
    this.ciudades = [];
    this.cargarCiudades(); // Llamado para llenar las ciudades

    const id = this.tokenService.getId();  // ✔️ Esto sí usa el ID real
    console.log("ID extraído del token:", id);
this.obtenerInformacion(id);
    this.usuarios = [];
  }

 public obtenerInformacion(idUsuario: string) {
  console.log("Iniciando búsqueda de usuario con id/email:", idUsuario);
  
  if (!idUsuario) {
    console.error("ID de usuario vacío o nulo");
    return;
  }
  
  this.RegistroService.obtenerUsuario(idUsuario).subscribe({
    next: (data) => {
      console.log("Respuesta completa del servidor:", data);
      
      if (!data) {
        console.error("No hay respuesta del servidor");
        this.mostrarErrorDatos("No se recibió respuesta del servidor");
        return;
      }
      
      if (!data.data) {
        console.error("Respuesta sin datos de usuario");
        this.mostrarErrorDatos("La respuesta no contiene datos de usuario");
        return;
      }
      
      const userData = data.data;
      console.log("Datos del usuario recibidos:", userData);
      
      // Verificar si al menos hay algún dato válido
      const hayDatosValidos = 
        userData.id !== null || 
        userData.nombre !== null || 
        userData.email !== null;
      
      if (hayDatosValidos) {
        this.usuarios = [userData];
        
        // Asignar valores con verificación
        this.asignarValorSiExiste('idUsuario', userData.id);
        this.asignarValorSiExiste('nombre', userData.nombre);
        this.asignarValorSiExiste('telefono', userData.telefono);
        this.asignarValorSiExiste('email', userData.email);
        this.asignarValorSiExiste('ciudad', userData.ciudad);
        this.asignarValorSiExiste('direccion', userData.direccion);
        
        console.log("Formulario actualizado con datos:", this.loginForm.value);
      } else {
        console.error("Todos los datos del usuario son nulos");
        this.mostrarErrorDatos("No se encontraron datos válidos para el usuario");
      }
    },
    error: (error) => {
      console.error("Error en la petición:", error);
      
      if (error.status === 404) {
        this.mostrarErrorDatos("Usuario no encontrado");
      } else if (error.status === 403) {
        this.mostrarErrorDatos("No tienes permisos para acceder a esta información", true);
      } else {
        this.mostrarErrorDatos("Error al obtener la información del usuario");
      }
    }
  });
}

// Método auxiliar para asignar valores al formulario
private asignarValorSiExiste(control: string, valor: any) {
  if (valor !== null && valor !== undefined) {
    this.loginForm.get(control)?.setValue(valor);
    console.log(`Asignado ${control} = ${valor}`);
  } else {
    console.log(`No se asignó ${control} porque es nulo`);
  }
}

// Método para mostrar errores de manera consistente
private mostrarErrorDatos(mensaje: string, redirigirLogin: boolean = false) {
  this.salidaTexto = mensaje;
  
  Swal.fire({
    title: 'Error de datos',
    text: mensaje,
    icon: 'error',
    confirmButtonText: 'Entendido'
  }).then(() => {
    if (redirigirLogin) {
      this.tokenService.logout();
      this.router.navigate(['/login']);
    }
  });
}

 public actualizarCuenta() {
  if (this.loginForm.invalid) {
    Swal.fire({
      text: 'Por favor completa todos los campos requeridos',
      icon: 'error',
      showConfirmButton: false,
      timer: 2000
    });
    return;
  }

  // Mostrar confirmación
  Swal.fire({
    title: '¿Actualizar cuenta?',
    text: '¿Estás seguro de que deseas actualizar tu información?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#0d6efd',
    cancelButtonColor: '#dc3545'
  }).then((result) => {
    if (result.isConfirmed) {
      // Crear DTO con los datos del formulario
      this.ActualizarClienteDTO = new ActualizarClienteDTO(
        this.loginForm.get('nombre')?.value,
        this.loginForm.get('ciudad')?.value,
        this.loginForm.get('direccion')?.value,
        this.loginForm.get('telefono')?.value
      );

      console.log("Datos a enviar para actualización:", this.ActualizarClienteDTO);

      // Llamar al servicio
      this.RegistroService.actualizarUsuario(
        this.loginForm.get('idUsuario')?.value,
        this.ActualizarClienteDTO
      ).subscribe({
        next: (data) => {
          Swal.fire({
            text: data.mensaje,
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
          });

          const id = this.tokenService.getId();
          this.obtenerInformacion(id);
        },
        error: (error) => {
          console.error("Error en actualización:", JSON.stringify(error));

          let mensajeError = 'Se produjo un error, por favor verifica tus datos o intenta más tarde.';

          if (error.status === 500) {
            mensajeError = error.error.data || 'Error interno del servidor';
          } else if (error.status === 400) {
            mensajeError = error.error.mensaje || 'Datos inválidos';
          }

          Swal.fire({
            text: mensajeError,
            icon: 'error',
            showConfirmButton: true
          });
        }
      });
    }
  });
}


  private cargarCiudades() {
    this.ciudades = ['CALI', 'MEDELLIN', 'ARMENIA', 'MANIZALES', 'PEREIRA', 'BOGOTA'];
  }

 public eliminarCuenta() {
  const idUsuario = this.loginForm.get('idUsuario')?.value;

  if (!idUsuario) {
    Swal.fire({
      title: 'Error',
      text: 'No se encontró el ID del usuario para eliminar.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará tu cuenta permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.RegistroService.eliminarUsuario(idUsuario).subscribe({
        next: (data) => {
          console.log("Usuario eliminado", JSON.stringify(data));

          Swal.fire({
            text: data.mensaje || 'Cuenta eliminada exitosamente.',
            icon: 'success',
            showConfirmButton: false,
            timer: 2000
          });

          this.tokenService.logout();
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error("Error al eliminar:", JSON.stringify(error));

          let mensajeError = 'Se produjo un error, por favor verifica tus datos o intenta más tarde.';

          if (error.status === 500) {
            mensajeError = error.error.data || 'Error interno del servidor';
          } else if (error.error && error.error.mensaje) {
            mensajeError = error.error.mensaje;
          }

          Swal.fire({
            title: 'Error al eliminar cuenta',
            text: mensajeError,
            icon: 'error',
            confirmButtonText: 'Entendido'
          });
        }
      });
    }
  });
}

  //Buscador Palabras
  categoriasFiltradas(): UsuarioDTO[] {
    
    if (!this.terminoBusqueda.trim()) {
      return this.usuarios;
      
    }
  
    const termino = this.terminoBusqueda.toLowerCase();
    const filtradas = this.usuarios.filter(categoria =>
      categoria.nombre.toLowerCase().includes(termino) ||
      categoria.ciudad.toLowerCase().includes(termino)
    );
  
    // Si no hay coincidencias, retornar todas las categorías
    return filtradas.length > 0 ? filtradas : this.usuarios;
  }
}