class Pelicula {
  constructor(nombre, director, anio) {
    this.nombre = nombre;
    this.director = director;
    this.anio = Number(anio);
  }
}

module.exports = Pelicula;