SELECT
    s.nombre,
    s.sueldo AS sueldo_soltera,
    p.sueldo AS sueldo_papi,
    (s.sueldo + p.sueldo) AS sueldo_total
FROM reparto_soltera_otra_vez s
INNER JOIN reparto_papi_ricky p
    ON s.nombre = p.nombre
ORDER BY s.nombre;