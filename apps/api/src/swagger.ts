import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food360 API",
      version: "1.0.0",
      description:
        "Documentación interactiva de la API de restaurantes y órdenes",
    },
    servers: [
      {
        url: "http://localhost:3002",
        description: "Servidor Local",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Lee los comentarios JSDoc dentro de la carpeta routes
};

export const swaggerSpec = swaggerJSDoc(options);
