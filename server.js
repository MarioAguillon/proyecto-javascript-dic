// server.js (FINAL - con persistencia y sintaxis limpia)
const express = require('express');
const cors = require('cors');
const fs = require('fs/promises'); 
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'Data', 'Data.json'); 

// --- Middleware ---
app.use(cors());
app.use(express.json());

// ===============================================
// FUNCIONES DE MANEJO DE ARCHIVOS (Clean Code)
// ===============================================

const readGifts = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe o está vacío, devuelve un array vacío
        if (error.code === 'ENOENT') {
            return []; 
        }
        throw error;
    }
};

const writeGifts = async (gifts) => {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(gifts, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error al escribir en el archivo:", error);
        throw new Error("Error de persistencia de datos.");
    }
};

// ===============================================
// ENDPOINTS CRUD (Las rutas de la API)
// ===============================================

// 1. READ (GET /api/gifts)
app.get('/api/gifts', async (req, res) => {
    try {
        const gifts = await readGifts();
        res.json(gifts);
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

// 3. CREATE (POST /api/gifts)
app.post('/api/gifts', async (req, res) => {
    try {
        const gifts = await readGifts();
        const nuevoGift = req.body;
        
        // Generar el nuevo ID basado en el último ID existente
        const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : 0;
        nuevoGift.id = maxId + 1;
        
        gifts.push(nuevoGift);
        await writeGifts(gifts); 
        
        res.status(201).json(nuevoGift); 
    } catch (error) {
        res.status(500).send({ message: "Error al crear la Gift Card." });
    }
});

// 4. UPDATE (PUT /api/gifts/:id)
app.put('/api/gifts/:id', async (req, res) => {
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
        gifts = gifts.filter(g => g.id !== id);
        
        if (gifts.length < initialLength) {
            await writeGifts(gifts);
            res.status(204).send();
        } else {
            res.status(404).send({ message: "Gift Card no encontrada para eliminar" });
        }
    } catch (error) {
        res.status(500).send({ message: "Error al eliminar la Gift Card." });
    }
});

// --- Servir archivos estáticos (Permite acceder a index.html y js/app.js) ---
app.use(express.static(__dirname)); 

// Servir index.html cuando se accede a la ruta raíz (http://localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor de backend con persistencia corriendo en http://localhost:${PORT}`);
    console.log(`Accede a la aplicación en: http://localhost:${PORT}`); // Ahora funciona sin /index.html
});