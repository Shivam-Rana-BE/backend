import ErrorHandler from "../utils/ErrorHandling.js";

const errorMiddleware = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something is wrong";
    console.log("called", err);

    //wrong Id error 
    if (err.name === "CastError") {
        const message = `Resource not found.Invalid :${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //E11000 error
    if (err.code == "11000") {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        // console.log(Object.keys(err.keyValue)),
        err = new ErrorHandler(message, 400)
    }

    //Wrong JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json web Token is invalid`;
        err = new ErrorHandler(message, 401);
    }

    //JWT Expired Token
    if (err.name === "TokenExpiredError") {
        const message = `Json web token is expired`;
        err = new ErrorHandler(message, 401);
    }

    res.status(err.statusCode).json({
        success: false,
        status: err.statusCode,
        message: err.message,
    });
}

export default errorMiddleware