import HttpStatus from "../../utils/HttpStatus.js";

export const response201 = (res, message = "Created successfully", response) => {
    return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        message,
        response: response || []
    })
}

export const response200 = (res, message = "fetch successfully", response) => {
    return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message,
        response: response || []
    })
}

export const response400 = (res, message = "Bad Request") => {
    return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message
    })
}

export const response401 = (res, message = "Unauthorized Request") => {
    return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        message
    })
}

export const response500 = (res, message = "Internal Server Error") => {
    return res.status(HttpStatus.ERROR).json({
        status: HttpStatus.ERROR,
        message
    })
}