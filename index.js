require("dotenv").config();
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// SESSION
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

// SERVIR FRONTEND DESDE /public
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LOGIN DISCORD
app.get("/auth/login", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&scope=identify`;
  res.redirect(redirect);
});

// CALLBACK DISCORD
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("No se recibió el código.");

  try {
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    req.session.user = userResponse.data;

    // ⭐ REDIRECCIÓN DIRECTA AL PANEL BONITO
    res.redirect("/");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error en el login.");
  }
});

// INFO DEL USUARIO
app.get("/auth/me", (req, res) => {
  if (!req.session.user) return res.json({});
  res.json(req.session.user);
});

// LOGOUT
app.get("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// PUERTO
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend funcionando en puerto " + PORT));
