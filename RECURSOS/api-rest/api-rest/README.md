# API REST - Usuarios y Productos

## Instalación

npm install

## Ejecutar en desarrollo

npm run dev

## Ejecutar normal

npm start

## Frontend

http://localhost:3000

## Endpoints

GET http://localhost:3000/api/v1/usuarios

GET http://localhost:3000/api/v1/usuarios/1

GET http://localhost:3000/api/v1/productos

GET http://localhost:3000/api/v1/productos/1

## Respuestas

Éxito:

{
  "ok": true,
  "data": []
}

Error:

{
  "ok": false,
  "mensaje": "Usuario no encontrado"
}