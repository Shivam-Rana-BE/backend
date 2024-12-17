import swaggerAutogen from 'swagger-autogen';
import { kidSwaggerSchemas } from './routes/kid.routes.js';
import { parentSwaggerSchemas } from './routes/parent.routes.js';
import { therapistCenterSwaggerSchemas } from './routes/therapist_center.routes.js';
import { therapistSwaggerSchemas } from './routes/therapist.routes.js';
import { commonSwaggerRoutes } from './routes/common.routes.js';
import { adminSwaggerSchemas } from './routes/admin.routes.js';

const doc = {
  info: {
    title: 'Ability-advocacy  API Documentation',
    description: 'API documentation',
  },
  host: "localhost:3000",//process.env.HOST || 'localhost:3000',
  schemes: "http", //[process.env.SCHEME || 'http'],
  basePath: '/api/v1',
  components: {
    schemas: {},
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [],
};
const endpointsFiles = ['./routes/index.js'];

const outputFile = './swagger_output.json';


kidSwaggerSchemas(doc);
parentSwaggerSchemas(doc);
therapistCenterSwaggerSchemas(doc)
therapistSwaggerSchemas(doc)
commonSwaggerRoutes(doc)
adminSwaggerSchemas(doc)

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});

// import joiToSwagger from 'joi-to-swagger';
// import swaggerJSDoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';
// import { parentValidator, therapistValidator, therapistCenterValidator, commonValidator } from './utils/Validations/index.js';

// const options = {
//   swaggerDefinition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'Ability-advocacy  API Documentation',
//       version: '1.0.0',
//     },
//     host: process.env.HOST || 'localhost:3000',
//     components: {
//       schemas: {},
//       securitySchemes: {
//         BearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//         },
//       },
//     },
//   },
//   apis: ['./routes/**/*.js'], // Adjust the path as necessary
// };

// const swaggerSpec = swaggerJSDoc(options);

// const validators = [
//   { name: 'ParentSignup', validator: parentValidator.parentSignUpValidator },
//   { name: 'AddChild', validator: parentValidator.addKidValidator },
//   { name: 'UpdateParentProfile', validator: parentValidator.updateProfileValidator },
//   { name: 'ChangePassword', validator: parentValidator.changePasswordValidator },
//   { name: 'TherapistSignup', validator: therapistValidator.therapistSignUpValidator },
//   { name: 'TherapistCenterSignup', validator: therapistCenterValidator.therapistCenterSignUpValidator },
//   { name: "Login", validator: commonValidator.signInValidator },
// ];

// // Function to add Joi schemas to Swagger spec
// const addSchemasFromValidators = () => {
//   validators.forEach(({ name, validator }) => {
//     const { swagger } = joiToSwagger(validator); // Convert Joi to Swagger
//     swaggerSpec.components.schemas[name] = swagger; // Register schema under components.schemas
//   });
// };

// addSchemasFromValidators(validators);

// export const setupSwaggerDocs = (app) => {
//   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//   console.log('Swagger docs available at /api-docs');
// };