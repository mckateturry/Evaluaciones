const jwt = require("jsonwebtoken");

function auth(req, res, next) {

  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token requerido"
    });
  }

  const [tipo, token] = authorization.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido"
    });
  }

  try {

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = payload;

    next();

  } catch {

    return res.status(401).json({
      ok: false,
      mensaje: "Token inválido o expirado"
    });

  }

}

module.exports = auth;