import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger.json";
import swaggerDefinition from "./swagger-definition.js";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const PORT = process.env.PORT || 5000;

//Swagger init
const swaggerJsdocOptions = {
  definition: swaggerDefinition,
  apis: ["./routes/*.yaml"],
};
const specs = swaggerJsdoc(swaggerJsdocOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use(express.json());
app.use(cors());
app.use("/api", routes);

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
