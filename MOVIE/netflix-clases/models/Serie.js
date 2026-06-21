class Serie {
  constructor(nombre, anio, temporadas) {
    this.nombre = nombre;
    this.anio = Number(anio);
    this.temporadas = Number(temporadas);
  }
}

module.exports = Serie;