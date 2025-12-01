// ===========================================
// 1. IMPORTACIONES
// ===========================================

// Importa la Clase Gift para crear nuevos objetos
import { Gift } from './clases.js'; 
// Importa el arreglo de datos iniciales
import datos from '../Data/Data.json' assert { type: 'json' };

// ===========================================
// 2. VARIABLES GLOBALES y SELECTORES DEL DOM
// ===========================================

// Selector del cuerpo de la tabla para insertar filas (READ)
const cuerpoTabla = document.querySelector('#cuerpoTabla');
// Selector del formulario de agregar (CREATE)
const formAgregar = document.querySelector('#formAgregar');
// Se usará para guardar el ID del Gift que se está editando
let idGiftUpdate = null;

// Inicializa el objeto Modal de Bootstrap para poder mostrarlo y ocultarlo
const modalEditar = new bootstrap.Modal(document.getElementById('modalEditar'));

// ===========================================
// 3. FUNCIONES CRUD
// ===========================================

/**
 * READ: Carga y muestra los datos en la tabla HTML.
 */
const cargarTabla = () => {
  // Limpia el contenido anterior del cuerpo de la tabla
  cuerpoTabla.innerHTML = ''; 

  // Itera sobre el arreglo 'datos' y crea una fila (<tr>) por cada objeto
  datos.forEach(gift => {
    // Crea la fila completa con los datos y botones de acción
    const fila = `
      <tr>
        <td>${gift.id}</td>
        <td>${gift.gift}</td>
        <td>${gift.tipo}</td>
        <td>${gift.tiempo}</td>
        <td>$${gift.precio}</td>
        <td>
          <img src="${gift.imagen}" alt="${gift.gift}" style="width: 50px; height: 50px; object-fit: cover;">
        </td>
        <td>
          <button class="btn btn-warning btn-sm me-2" onclick="MostrarModal(${gift.id})">
            Editar ✏️
          </button>
          <button class="btn btn-danger btn-sm" onclick="BorrarGift(${gift.id})">
            Eliminar ❌
          </button>
        </td>
      </tr>
    `;
    // Inserta la fila al final del cuerpo de la tabla
    cuerpoTabla.innerHTML += fila;
  });
};

/**
 * DELETE: Elimina un Gift Card del arreglo.
 * Se define en 'window' para ser accesible desde el atributo onclick del HTML.
 * @param {number} id - El ID del Gift Card a eliminar.
 */
window.BorrarGift = (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta Gift Card?')) {
    // Busca el índice (posición) del objeto con el ID coincidente
    const index = datos.findIndex(gift => gift.id === id);
    
    if (index !== -1) {
      // Elimina 1 elemento en la posición encontrada
      datos.splice(index, 1);
      // Recarga la tabla para reflejar el cambio en la interfaz
      cargarTabla(); 
      alert('✅ Gift Card eliminada con éxito.');
    }
  }
};

/**
 * CREATE: Agrega un nuevo Gift Card al arreglo.
 * @param {Event} e - El evento submit del formulario.
 */
const agregarGift = (e) => {
  e.preventDefault(); // Evita que la página se recargue al enviar el formulario

  // Captura los valores del formulario
  const giftNombre = document.querySelector('#giftNombre').value;
  const giftTipo = document.querySelector('#giftTipo').value;
  const giftTiempo = document.querySelector('#giftTiempo').value;
  const giftPrecio = parseFloat(document.querySelector('#giftPrecio').value);
  const giftImagen = document.querySelector('#giftImagen').value;

  // Genera un nuevo ID único
  // Si hay datos, toma el ID del último elemento y le suma 1. Si no hay, usa 1.
  const nuevoId = datos.length > 0 ? datos.at(-1).id + 1 : 1; 

  // Crea una nueva instancia de la clase Gift
  const nuevoGift = new Gift(
    nuevoId,
    giftNombre,
    giftTipo,
    giftTiempo,
    giftPrecio,
    giftImagen
  );

  // Agrega el nuevo objeto al arreglo de datos
  datos.push(nuevoGift);

  // 1. Limpia el formulario
  formAgregar.reset();
  // 2. Actualiza la tabla
  cargarTabla();
  
  alert('✨ Gift Card creada con éxito!');
};

/**
 * UPDATE (Paso 1): Muestra el modal de edición y precarga los datos.
 * Se define en 'window' para ser accesible desde el atributo onclick del HTML.
 * @param {number} id - El ID del Gift Card a editar.
 */
window.MostrarModal = (id) => {
  // Guarda el ID globalmente para usarlo en la función giftUpdate()
  idGiftUpdate = id; 
  
  // Encuentra el objeto Gift Card en el arreglo por su ID
  const giftAEditar = datos.find(gift => gift.id === id);
  
  if (giftAEditar) {
    // Precarga los inputs del modal con los datos actuales
    document.querySelector('#editGiftNombre').value = giftAEditar.gift;
    document.querySelector('#editGiftTipo').value = giftAEditar.tipo;
    document.querySelector('#editGiftTiempo').value = giftAEditar.tiempo;
    document.querySelector('#editGiftPrecio').value = giftAEditar.precio;
    document.querySelector('#editGiftImagen').value = giftAEditar.imagen;
    
    // Muestra el modal
    modalEditar.show();
  }
};

/**
 * UPDATE (Paso 2): Guarda los cambios hechos en el modal.
 * Se define en 'window' para ser accesible desde el botón "Guardar Cambios" del modal.
 */
window.giftUpdate = () => {
  // Encuentra el índice (posición) del Gift Card que se está editando
  const index = datos.findIndex(gift => gift.id === idGiftUpdate);
  
  if (index !== -1) {
    // 1. Captura los nuevos valores del formulario del modal
    const nuevoNombre = document.querySelector('#editGiftNombre').value;
    const nuevoTipo = document.querySelector('#editGiftTipo').value;
    const nuevoTiempo = document.querySelector('#editGiftTiempo').value;
    const nuevoPrecio = parseFloat(document.querySelector('#editGiftPrecio').value);
    const nuevaImagen = document.querySelector('#editGiftImagen').value;

    // 2. Actualiza las propiedades del objeto en el arreglo
    datos[index].gift = nuevoNombre;
    datos[index].tipo = nuevoTipo;
    datos[index].tiempo = nuevoTiempo;
    datos[index].precio = nuevoPrecio;
    datos[index].imagen = nuevaImagen;
    
    // 3. Oculta el modal y actualiza la tabla
    modalEditar.hide();
    cargarTabla();
    alert('🎉 Gift Card actualizada con éxito!');
  }
};


// ===========================================
// 4. EVENTOS Y EJECUCIÓN INICIAL
// ===========================================

// Escucha el evento 'submit' del formulario para crear nuevos elementos
formAgregar.addEventListener('submit', agregarGift);

// Llama a la función de carga inicial para mostrar los datos del Data.json
document.addEventListener('DOMContentLoaded', cargarTabla);