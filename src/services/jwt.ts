import jwt from "jsonwebtoken";
import { env } from "../lib/env.js";

export type JwtPayload = { sub: string };

export function signToken(userId: string) {
    const secret = env.JWT_SECRET as jwt.Secret;
    const options: jwt.SignOptions = {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };

    return jwt.sign({ sub: userId } satisfies JwtPayload, secret, options);
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
