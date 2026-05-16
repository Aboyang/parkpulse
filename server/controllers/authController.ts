import type { Request, Response } from "express";
import { AuthService } from "../services/authService.js";

const auth = new AuthService();

export async function signUp(req: Request, res: Response): Promise<void> {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        res.status(400).json({ error: "Email, password, and name are required" });
        return;
    }

    try {
        const user = await auth.signUp(email, password, name);
        res.status(201).json({ message: "User created", user });
    } catch (err) {
        console.error("signUp error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function confirmSignUp(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400).json({ error: "Email and confirmation code are required" });
        return;
    }

    try {
        const result = await auth.confirmSignUp(email, code);
        res.status(200).json(result);
    } catch (err) {
        console.error("confirmSignUp error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    try {
        const result = await auth.login(email, password);
        res.status(200).json(result);
    } catch (err) {
        console.error("login error:", err);
        res.status(401).json({ error: (err as Error).message });
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    const { accessToken } = req.body;

    if (!accessToken) {
        res.status(400).json({ error: "Access token is required to logout" });
        return;
    }

    try {
        const result = await auth.logout(accessToken);
        res.status(200).json(result);
    } catch (err) {
        console.error("logout error:", err);
        res.status(500).json({ error: (err as Error).message });
    }
}

export async function getUserProfile(req: Request, res: Response): Promise<void> {
    const userId = req.params['userId'] as string;

    try {
        const profile = await auth.getUserProfile(userId);
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
