import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import session from "express-session";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Sesiones
app.use(
  session({
    secret: "creativos-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API del panel funcionando correctamente");
});

// ===============================
//      LOGIN CON DISCORD
// ===============================

// 1. Ruta para iniciar sesión
app.get("/auth/login", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;

  res.redirect(redirect);
});

// 2. Callback de Discord
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send("No se recibió el código de Discord");

  try {
    const data = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
    });

    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      data,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    req.session.token = tokenRes.data.access_token;

    res.send("Login correcto. Ya puedes cerrar esta ventana.");
  } catch (err) {
    console.error(err);
    res.send("Error al obtener el token.");
  }
});

// 3. Obtener datos del usuario autenticado
app.get("/auth/me", async (req, res) => {
  if (!req.session.token) return res.send("No estás autenticado.");

  try {
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${req.session.token}` },
    });

    res.json(userRes.data);
  } catch (err) {
    console.error(err);
    res.send("Error al obtener datos del usuario.");
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Panel backend corriendo en el puerto ${PORT}`);
});

