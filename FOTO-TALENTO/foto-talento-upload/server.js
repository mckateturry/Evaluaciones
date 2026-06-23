const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const nombreUnico = `${Date.now()}${extension}`;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/png", "image/gif"];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo se permiten JPG, JPEG, PNG o GIF."));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

app.post("/upload", upload.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      mensaje: "No se recibió una imagen válida"
    });
  }

  res.status(201).json({
    ok: true,
    mensaje: "Imagen subida correctamente",
    archivo: req.file.filename,
    ruta: `/uploads/${req.file.filename}`,
    tipo: req.file.mimetype,
    size: req.file.size
  });
});

app.get("/galeria", (req, res) => {
  fs.readdir(UPLOAD_DIR, (error, archivos) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        mensaje: "No se pudo leer la galería"
      });
    }

    const imagenes = archivos
      .filter(archivo => archivo !== ".gitkeep")
      .map(archivo => {
        const rutaArchivo = path.join(UPLOAD_DIR, archivo);
        const stats = fs.statSync(rutaArchivo);

        return {
          nombre: archivo,
          ruta: `/uploads/${archivo}`,
          size: stats.size
        };
      });

    res.status(200).json({
      ok: true,
      data: imagenes
    });
  });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        ok: false,
        mensaje: "La imagen supera el límite máximo de 5 MB"
      });
    }

    return res.status(400).json({
      ok: false,
      mensaje: err.message
    });
  }

  if (err) {
    return res.status(415).json({
      ok: false,
      mensaje: err.message
    });
  }

  next();
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});