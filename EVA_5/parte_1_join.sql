SELECT
    s.nombre,
    s.sueldo AS sueldo_soltera,
    p.sueldo AS sueldo_papi,
    (s.sueldo + p.sueldo) AS sueldo_total
FROM reparto_soltera_otra_vez s
INNER JOIN reparto_papi_ricky p
    ON s.nombre = p.nombre
ORDER BY s.nombre;

SELECT
    s.nombre,
    s.sueldo
FROM reparto_soltera_otra_vez s
LEFT JOIN reparto_papi_ricky p
    ON s.nombre = p.nombre
WHERE p.nombre IS NULL
AND s.sueldo > 90;

SELECT nombre, sueldo
FROM reparto_soltera_otra_vez
WHERE sueldo < 85
AND nombre NOT IN (
    SELECT nombre
    FROM reparto_papi_ricky
)

UNION

SELECT nombre, sueldo
FROM reparto_papi_ricky
WHERE sueldo < 85
AND nombre NOT IN (
    SELECT nombre
    FROM reparto_soltera_otra_vez
);

