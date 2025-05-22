export class RegistroClienteDTO {
    constructor(
        public nombre: string = '',
        public telefono: string = '',
        public ciudad: string = '',
        public direccion: string = '',
        public email: string = '',
        public password: string = '',
        public confirmaPassword?: string,
    ) { }
}

