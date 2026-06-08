DROP TABLE IF EXISTS reparto_actores;
DROP TABLE IF EXISTS actores;
DROP TABLE IF EXISTS teleseries;

CREATE TABLE actores(
    id_actor SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE teleseries(
    id_teleserie SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE reparto_actores(
    id_reparto SERIAL PRIMARY KEY,
    id_actor INTEGER NOT NULL,
    id_teleserie INTEGER NOT NULL,
    sueldo INTEGER,
    protagonico BOOLEAN,

    FOREIGN KEY(id_actor) REFERENCES actores(id_actor),
    FOREIGN KEY(id_teleserie) REFERENCES teleseries(id_teleserie)
);

-- telee

INSERT INTO teleseries(nombre)
VALUES
('Soltera Otra Vez'),
('Papi Ricky');


INSERT INTO actores(nombre)
SELECT nombre FROM reparto_soltera_otra_vez
UNION
SELECT nombre FROM reparto_papi_ricky;


INSERT INTO reparto_actores(id_actor, id_teleserie, sueldo, protagonico)
SELECT 
    a.id_actor,
    t.id_teleserie,
    s.sueldo,
    s.protagonico
FROM reparto_soltera_otra_vez s
INNER JOIN actores a
    ON s.nombre = a.nombre
INNER JOIN teleseries t
    ON t.nombre = 'Soltera Otra Vez';


INSERT INTO reparto_actores(id_actor, id_teleserie, sueldo, protagonico)
SELECT 
    a.id_actor,
    t.id_teleserie,
    p.sueldo,
    p.protagonico
FROM reparto_papi_ricky p
INNER JOIN actores a
    ON p.nombre = a.nombre
INNER JOIN teleseries t
    ON t.nombre = 'Papi Ricky';

SELECT
    t.nombre AS teleserie,
    a.nombre AS actor,
    r.sueldo
FROM reparto_actores r
INNER JOIN actores a
    ON r.id_actor = a.id_actor
INNER JOIN teleseries t
    ON r.id_teleserie = t.id_teleserie
WHERE r.protagonico = true
ORDER BY t.nombre, a.nombre;