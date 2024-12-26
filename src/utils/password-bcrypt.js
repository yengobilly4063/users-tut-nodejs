import { default as bcrypt } from 'bcrypt';

export const saltRounds = 10;

export async function hashPassword(password) {
    let salt = await bcrypt.genSalt(saltRounds);

    return await bcrypt.hash(password, salt);
}

export async function comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}
