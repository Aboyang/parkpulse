import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";
import {
    validateSignUpBody,
    validateConfirmSignUpBody,
    validateLoginBody,
    validateLogoutBody,
    validateGetUserProfileParam,
} from "../validators/authValidator.js";

const auth = new AuthService();

export async function signUp(req: Request, res: Response): Promise<void> {
    const result = validateSignUpBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { email, password, name } = result.data;
        const user = await auth.signUp(email, password, name);
        res.status(201).json({ message: "User created", user });
    } catch (err) {
        console.error("signUp error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function confirmSignUp(req: Request, res: Response): Promise<void> {
    const result = validateConfirmSignUpBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { email, code } = result.data;
        const response = await auth.confirmSignUp(email, code);
        res.status(200).json(response);
    } catch (err) {
        console.error("confirmSignUp error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    const result = validateLoginBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { email, password } = result.data;
        const response = await auth.login(email, password);
        res.status(200).json(response);
    } catch (err) {
        console.error("login error:", err);
        res.status(401).json({ error: (err as Error).message });
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    const result = validateLogoutBody(req.body as Record<string, unknown>);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const { accessToken } = result.data;
        const response = await auth.logout(accessToken);
        res.status(200).json(response);
    } catch (err) {
        console.error("logout error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
    const result = validateGetUserProfileParam(req.params['userId']);
    if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
    }

    try {
        const profile = await auth.getUserProfile(result.data);
        if (!profile) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(profile);
    } catch (err) {
        console.error("getUserProfile error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}
