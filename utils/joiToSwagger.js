// import doc from "../swagger.js";
import JoiToSwagger from 'joi-to-swagger';

const joiToSwagger = (schema) => {
    const swaggerSchema = {};

    // Iterate through the schema keys
    for (const key in schema.describe().keys) {
        const { type, flags, meta } = schema.describe().keys[key];

        swaggerSchema[key] = {
            type: type === 'string' ? 'string' : type,
            required: flags.presence === 'required',
        };

        if (meta?.length > 0) {
            swaggerSchema[key].description = meta[0].message;
        }
    }

    // console.log("🚀 ~ joiToSwagger ~ swaggerSchema:", swaggerSchema)
    return swaggerSchema;
};

const swaggerJoi = (validator) => {
    return (req, res, next) => {
        req.swaggerSchema = joiToSwagger(validator);
        next();
    };
};

const convertJoiSchemaToSwagger = (joiSchema) => {
    const { swagger } = JoiToSwagger(joiSchema);
    return swagger;
  };

export { swaggerJoi,convertJoiSchemaToSwagger };