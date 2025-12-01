// server.js (Actividades 1 y 2 Completas: CRUD, Validación, Búsqueda y Paginación)
const express = require('express');
const cors = require('cors');
// Importa el módulo fs con API de promesas para usar async/await
const fs = require('fs/promises'); 
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'Data', 'Data.json'); 

// --- Middleware de Configuración ---
app.use(cors());
app.use(express.json());

// ===============================================
// MIDDLEWARE DE VALIDACIÓN (Actividad 1 - Robustez)
// ===============================================

// Función flecha para validar datos
const validarGiftCard = (req, res, next) => {
    const { gift, tipo, tiempo, precio, imagen } = req.body;

    // 1. Verificar campos obligatorios
    if (!gift || !tipo || !tiempo || !precio || !imagen) {
        return res.status(400).json({ 
            message: "Error: Faltan campos obligatorios. Todos los campos deben ser proporcionados y no pueden estar vacíos."
        });
    }

    // 2. Verificar que el precio sea un número positivo
    if (isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
        return res.status(400).json({ 
            message: "Error: El precio debe ser un número positivo válido." 
        });
    }
    
    // Si pasa todas las validaciones, continúa con la ruta
    next();
};


// ===============================================
// FUNCIONES DE MANEJO DE ARCHIVOS (Persistencia con Funciones Flecha Asíncronas)
// ===============================================

// Función flecha asíncrona para leer el archivo
const readGifts = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, devuelve un array vacío
        if (error.code === 'ENOENT') {
            return []; 
        }
        throw error;
    }
};

// Función flecha asíncrona para escribir el archivo
const writeGifts = async (gifts) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(gifts, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al escribir en el archivo:", error);
        throw new Error("Error de persistencia de datos.");
    }
};

// ===============================================
// ENDPOINTS CRUD 
// ===============================================

// 1. READ (GET /api/gifts) - Implementa BÚSQUEDA, FILTRADO Y PAGINACIÓN (Actividad 2)
app.get('/api/gifts', async (req, res) => {
    try {
        let gifts = await readGifts(); // Cargar todos los datos
        
        // --- 1. BÚSQUEDA Y FILTRADO (req.query) ---
        const { q, tipo } = req.query; 
        
        if (q) {
            const query = q.toLowerCase();
            // Filtrar por nombre del regalo (gift) o por tipo
            gifts = gifts.filter(gift => 
                gift.gift.toLowerCase().includes(query) || 
                gift.tipo.toLowerCase().includes(query)
            );
        }

        if (tipo) {
            const tipoQuery = tipo.toLowerCase();
            // Filtrar para coincidencia exacta en el campo 'tipo'
            gifts = gifts.filter(gift => 
                gift.tipo.toLowerCase() === tipoQuery
            );
        }

        // --- 2. PAGINACIÓN ---
        // Obtener página (por defecto 1) y límite (por defecto 10)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Calcular los índices de inicio y fin para el corte (.slice)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        
        const results = {};
        
        // Metadatos de paginación
        results.totalItems = gifts.length;
        results.totalPages = Math.ceil(gifts.length / limit);
        results.currentPage = page;

        // Calcular la página siguiente (si existe) y anterior (si no es la primera)
        if (endIndex < gifts.length) {
            results.next = { page: page + 1, limit: limit };
        }
        if (startIndex > 0) {
            results.previous = { page: page - 1, limit: limit };
        }

        // Aplicar la paginación a los datos finales
        results.data = gifts.slice(startIndex, endIndex);

        // Devolver el objeto de respuesta completo
        res.json(results);
        
    } catch (error) {
        res.status(500).send({ message: "Error al leer los datos del servidor." });
    }
});


// 2. READ (GET /api/gifts/:id)
app.get('/api/gifts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const gifts = await readGifts();
        const gift = gifts.find(g => g.id === id);
        if (gift) {
            res.json(gift);
        } else {
            res.status(404).send({ message: "Gift Card no encontrada" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al obtener un solo dato." });
    }
});

// 3. CREATE (POST /api/gifts) -> CON VALIDACIÓN
app.post('/api/gifts', validarGiftCard, async (req, res) => {
    try {
        const gifts = await readGifts();
        const nuevoGift = req.body;
        
        // Generar el nuevo ID
        const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : 0;
        nuevoGift.id = maxId + 1;
        
        gifts.push(nuevoGift);
        await writeGifts(gifts); 
        
        res.status(201).json(nuevoGift); 
    } catch (error) {
        res.status(500).send({ message: "Error al crear la Gift Card." });
    }
});

// 4. UPDATE (PUT /api/gifts/:id) -> CON VALIDACIÓN
app.put('/api/gifts/:id', validarGiftCard, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const gifts = await readGifts();
        const index = gifts.findIndex(g => g.id === id);
        
        if (index !== -1) {
            gifts[index] = { ...req.body, id: id };
            await writeGifts(gifts); 
            res.json(gifts[index]);
        } else {
            res.status(404).send({ message: "Gift Card no encontrada para actualizar" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al actualizar la Gift Card." });
    }
});

// 5. DELETE (DELETE /api/gifts/:id)
app.delete('/api/gifts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let gifts = await readGifts();
        
        const initialLength = gifts.length;
        // Filtrar para eliminar el elemento
        gifts = gifts.filter(g => g.id !== id);
        
        if (gifts.length < initialLength) {
            await writeGifts(gifts);
            res.status(204).send(); // 204 No Content para eliminación exitosa
        } else {
            res.status(404).send({ message: "Gift Card no encontrada para eliminar" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la Gift Card." });
    }
});

// --- Servir archivos estáticos y ruta raíz ---
// Permite acceder a index.html, css/styles.css y js/app.js
app.use(express.static(__dirname)); 

// Sirve index.html cuando se accede a la ruta raíz (http://localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor de backend con VALIDACIÓN, BÚSQUEDA Y PAGINACIÓN corriendo en http://localhost:${PORT}`);
    console.log(`Accede a la aplicación en: http://localhost:${PORT}`);
});