import { GoogleGenAI } from "@google/genai";

interface GenerateQuestionsInput {
    sourceNotes: string;
    requestedCount: number;
    questionType: "multiple_choice" | "true_false";
    difficulty: "easy" | "medium" | "hard";
}

interface GeneratedOption {
    text: string;
    isCorrect: boolean;
}

export interface GeneratedQuestion {
    type: "multiple_choice" | "true_false";
    questionText: string;
    options: GeneratedOption[];
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
    points: number;
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateQuestions = async (
    input: GenerateQuestionsInput
): Promise<GeneratedQuestion[]> => {
    const prompt = `
You are an educational question generator.

Generate questions using ONLY the lesson notes provided below.

LESSON NOTES:
${input.sourceNotes}

REQUIREMENTS:
- Generate ${input.requestedCount} questions.
- Question type: ${input.questionType}.
- Difficulty: ${input.difficulty}.
- Do not use information outside the supplied notes.
- Do not invent facts.
- If the notes do not contain enough information, generate fewer questions.
- Every question must have exactly one correct answer.
- Multiple-choice questions must have at least two options.
- True/false questions must have exactly two options: True and False.
- Provide a short explanation based only on the notes.
- Assign 1 point to each question.

Return JSON only, following the required response schema.
`;

    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-flash-latest",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseJsonSchema: {
                type: "object",
                properties: {
                    questions: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: {
                                    type: "string",
                                    enum: ["multiple_choice", "true_false"],
                                },
                                questionText: { type: "string" },
                                options: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            text: { type: "string" },
                                            isCorrect: { type: "boolean" },
                                        },
                                        required: ["text", "isCorrect"],
                                    },
                                },
                                explanation: { type: "string" },
                                difficulty: {
                                    type: "string",
                                    enum: ["easy", "medium", "hard"],
                                },
                                points: { type: "integer" },
                            },
                            required: [
                                "type",
                                "questionText",
                                "options",
                                "explanation",
                                "difficulty",
                                "points",
                            ],
                        },
                    },
                },
                required: ["questions"],
            },
        },
    });

    if (!response.text) {
        throw new Error("Gemini returned an empty response.");
    }

    const result = JSON.parse(response.text);

    if (!Array.isArray(result.questions)) {
        throw new Error("Gemini returned an invalid question format.");
    }

    return result.questions as GeneratedQuestion[];
};
