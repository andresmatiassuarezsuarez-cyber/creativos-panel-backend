import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API del panel funcionando correctamente");
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Panel backend corriendo en el puerto ${PORT}`);
});
