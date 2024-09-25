import jwt from "jsonwebtoken";
<<<<<<< HEAD
import environmentConfig from "../env/environmentConfig.js";
=======
import environmentConfig from '../env/environmentConfig.js'
>>>>>>> 3ae172a (work on client changes)

function signJwt(payload, exp, tType) {
  let token = "";

  if (tType === "access") {
<<<<<<< HEAD
    token = jwt.sign(payload, environmentConfig.JWT_ACCESS_KEY, {
      expiresIn: exp,
    });
  }

  if (tType === "refresh") {
    token = jwt.sign(payload, environmentConfig.JWT_REFRESH_KEY, {
      expiresIn: exp,
    });
=======
    token = jwt.sign(payload, environmentConfig.JWT_ACCESS_KEY, { expiresIn: exp });
  }

  if (tType === "refresh") {
    token = jwt.sign(payload, environmentConfig.JWT_REFRESH_KEY, { expiresIn: exp });
>>>>>>> 3ae172a (work on client changes)
  }

  return token;
}

function jwtVerify(token, tType) {
  let decodedStatus = {};

  try {
    if (tType === "access") {
      decodedStatus = jwt.verify(token, environmentConfig.JWT_ACCESS_KEY);
    }

    if (tType === "refresh") {
      decodedStatus = jwt.verify(token, environmentConfig.JWT_REFRESH_KEY);
    }

    return decodedStatus;
  } catch (error) {
    throw new Error(error.message);
  }
}

//
export { signJwt, jwtVerify };
