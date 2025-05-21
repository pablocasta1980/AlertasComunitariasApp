import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormGroup, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { CategoriaDTO } from '../../dto/CategoriaDTO';
import { CategoriasService } from '../../servicios/categorias.service';
import { TokenService } from '../../servicios/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit {
  //Inicializar Clase
  categoriaDTO = new CategoriaDTO();

  //Lista Categorias 
  categorias: CategoriaDTO[]; 

  //monstrar boton agregar y actualizar
  mostrarBotonAgregar: boolean = true;
  
  terminoBusqueda: string = '';

  categoriaSeleccionada: CategoriaDTO = { 
    id: '', 
    nombre: '', 
    descripcion: '' 
  };

  constructor(private router: Router, 
    private categoriasService: CategoriasService, 
    private tokenService:TokenService){
      this.categoriaDTO = new CategoriaDTO();
      this.categorias = [];
    }

  ngOnInit(): void {
    // No se necesita cargar datos de un servicio
    this.getCategorias();
  }

  // Formulario*
  editarFormulario(categoria: CategoriaDTO): void {
    this.mostrarBotonAgregar = false;
    this.categoriaSeleccionada = { ...categoria };
  }

  //Limpiar Campos
  limpiarCampos(){
    this.categoriaSeleccionada.nombre = ""; 
    this.categoriaSeleccionada.descripcion = "";
  }

  //Crear*
 agregarCategoria() {
  // Validación de campos
  const nombre = this.categoriaSeleccionada.nombre;
  const descripcion = this.categoriaSeleccionada.descripcion;

  if (!nombre || !descripcion) {
    Swal.fire({
      title: 'Campos requeridos',
      text: 'Por favor completa el nombre y la descripción de la categoría.',
      icon: 'warning',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  // Asignar valores al DTO
  this.categoriaDTO.nombre = nombre;
  this.categoriaDTO.descripcion = descripcion;
  delete this.categoriaDTO.id;

  // Llamar al servicio
  this.categoriasService.crearCategoria(this.categoriaDTO).subscribe({
    next: (data) => {
      console.log('Categoría registrada', JSON.stringify(data));

      Swal.fire({
        text: 'Categoría registrada exitosamente',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000
      });

      this.getCategorias(); // Recargar categorías
    },
    error: (error) => {
      console.error(JSON.stringify(error));

      const mensaje =
        error.error?.mensaje || error.error?.data || 'Se produjo un error inesperado.';

      Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    },
  });
}

  //Actualizar
  actualizarCategoria(): void {

    this.categoriaDTO.nombre = this.categoriaSeleccionada.nombre;
    this.categoriaDTO.descripcion = this.categoriaSeleccionada.descripcion;

    delete this.categoriaDTO.id;

    this.categoriasService.actualizarCategoria(this.categoriaDTO, this.categoriaSeleccionada.id).subscribe({
      next: (data) => {
        console.log('Categoria actualizada', JSON.stringify(data));
        
        this.getCategorias();
        this.limpiarCampos();
        this.mostrarBotonAgregar = true;
        // this.router.navigate(["/categoria"]).then(() => {
        //   window.location.reload();
        // });
      },
      error: (error) => {
        console.error(JSON.stringify(error));

        if (error.status === 500) {
          console.error('Error en el servidor');
        } else {
          if (error.error && error.error.mensaje) {
            console.log(error.error.mensaje);
          } else {
            console.log('Se produjo un error, por favor verifica tus datos o intenta más tarde.');
          }
        }
      },
    });
  }

  //Eliminar*
 eliminarCategoria(id: string | undefined): void {
    if (!id) {
        Swal.fire({
            title: 'Error',
            text: 'No se ha proporcionado un ID válido para eliminar',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esta acción!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            this.categoriasService.eliminarCategoria(id).subscribe({
                next: (data) => {
                    console.log("Categoria eliminada", JSON.stringify(data));

                    Swal.fire({
                        text: 'Categoría eliminada exitosamente',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2000
                    });

                    this.getCategorias();
                },
                error: (error) => {
                    console.error(JSON.stringify(error));

                    const mensaje = error.error?.mensaje || 
                                   (error.status === 500 ? 'Error en el servidor' : 
                                    'Se produjo un error, por favor verifica tus datos o intenta más tarde.');

                    Swal.fire({
                        title: 'Error',
                        text: mensaje,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }
    });
}

  getCategorias(): void {
    this.categoriasService.obtenerCategorias().subscribe({
      next:(data) => {
        this.categorias = data.data;
        console.log("Categorias encontradas: ", JSON.stringify(data));
      },
      error: (error) => {
        console.error(JSON.stringify(error));

        if (error.status === 500) {
          console.error('Error en el servidor');
        } else {
          if (error.error && error.error.mensaje) {
            console.log(error.error.mensaje);
          } else {
            console.log('Se produjo un error, por favor verifica tus datos o intenta más tarde.');
          }
        }
      }
    })
  }

  //Buscador Palabras
  categoriasFiltradas(): CategoriaDTO[] {
    
    if (!this.terminoBusqueda.trim()) {
      return this.categorias;
      
    }
  
    const termino = this.terminoBusqueda.toLowerCase();
    const filtradas = this.categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(termino) ||
      categoria.descripcion.toLowerCase().includes(termino)
    );
  
    // Si no hay coincidencias, retornar todas las categorías
    return filtradas.length > 0 ? filtradas : this.categorias;
  }

}
