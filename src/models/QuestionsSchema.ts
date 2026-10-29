import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
    text: string;
    isCorrect: boolean;
}

