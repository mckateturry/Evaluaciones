# Foto Talento - Subida de Imágenes

## Instalación

npm install

## Ejecutar en desarrollo

npm run dev

## Ejecutar normal

npm start

## Frontend

http://localhost:3000

## Endpoints

GET /

POST /upload

GET /galeria

## Validaciones

- Solo imágenes JPG, JPEG, PNG o GIF.
- Tamaño máximo: 5 MB.
- Campo del formulario: foto.
- Nombre único con Date.now() + extensión.

## Respuestas

Éxito:

{
  "ok": true,
  "mensaje": "Imagen subida correctamente"
}

Error:

{
  "ok": false,
  "mensaje": "Tipo de archivo no permitido"
}