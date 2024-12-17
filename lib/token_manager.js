import Jwt from 'jsonwebtoken';

const create_token = (userData) => {
    let data = {
        user_id: userData.id,
        type: userData.type,
    }
    const token = Jwt.sign(data, process.env.JWT_SEC);
    return token
}

const verifyToken = async (token) => {
    return new Promise((resolve, reject) => {
        Jwt.verify(token, process.env.JWT_SEC, (err, result) => {
            if (err) return resolve(null)
            resolve(result)
        });
    });

}

export default { create_token, verifyToken }
