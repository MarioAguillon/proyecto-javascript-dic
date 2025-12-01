// La palabra clave 'export' permite que esta clase sea importada en app.js
export class Gift {
  // El constructor define las propiedades que tendrá cada objeto Gift
  constructor(id, gift, tipo, tiempo, precio, imagen) {
    this.id = id;
    this.gift = gift;
    this.tipo = tipo;
    this.tiempo = tiempo;
    this.precio = precio;
    this.imagen = imagen;
  }
}