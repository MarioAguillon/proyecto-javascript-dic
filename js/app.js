import { Gift } from "./clases.js";

// URL base del backend
const API_URL = "http://localhost:3000/api/gifts";

// Elementos del DOM
const cuerpoTabla = document.querySelector("#cuerpo-tabla");
const formAgregar = document.querySelector("#form-gift");
const formModal = document.querySelector("#form-modal");
const myModal = new bootstrap.Modal(document.getElementById("modal-gift"));

let idGiftUpdate = null;

// =========================
//  READ (GET)
// =========================
const cargarTabla = async () => {
    cuerpoTabla.innerHTML = "";

    const respuesta = await fetch(API_URL);
    const data = await respuesta.json();

    // Los datos vienen en data.data por la paginación del server
    const gifts = data.data;

    gifts.forEach(item => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${item.gift}</td>
            <td>${item.tipo}</td>
            <td>${item.tiempo}</td>
            <td>$${item.precio}</td>
            <td>
                <button class="btn btn-warning" onclick="window.MostrarModal(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="window.BorrarGift(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        cuerpoTabla.appendChild(fila);
    });
};

window.addEventListener("DOMContentLoaded", cargarTabla);

// =========================
//  CREATE (POST)
// =========================
formAgregar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoGift = {
        gift: document.querySelector("#gift").value,
        tipo: document.querySelector("#tipo").value,
        tiempo: document.querySelector("#tiempo").value,
        precio: document.querySelector("#precio").value,
        imagen: document.querySelector("#imagen").value
    };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoGift)
    });

    formAgregar.reset();
    cargarTabla();
});

// =========================
//  DELETE (DELETE)
// =========================
window.BorrarGift = async (id) => {

    const validar = confirm("¿Seguro que deseas eliminar esta Gift Card?");
    if (!validar) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    cargarTabla();
};

// =========================
//  UPDATE (MODAL)
// =========================
window.MostrarModal = async (id) => {
    idGiftUpdate = id;

    const res = await fetch(`${API_URL}/${id}`);
    const gift = await res.json();

    document.querySelector("#gift-modal").value = gift.gift;
    document.querySelector("#tipo-modal").value = gift.tipo;
    document.querySelector("#tiempo-modal").value = gift.tiempo;
    document.querySelector("#precio-modal").value = gift.precio;
    document.querySelector("#imagen-modal").value = gift.imagen;

    myModal.show();
};

// =========================
//  UPDATE (PUT)
// =========================
formModal.addEventListener("submit", async (e) => {
    e.preventDefault();

    const giftActualizado = {
        gift: document.querySelector("#gift-modal").value,
        tipo: document.querySelector("#tipo-modal").value,
        tiempo: document.querySelector("#tiempo-modal").value,
        precio: document.querySelector("#precio-modal").value,
        imagen: document.querySelector("#imagen-modal").value
    };

    await fetch(`${API_URL}/${idGiftUpdate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(giftActualizado)
    });

    cargarTabla();
    myModal.hide();
});
