'use client'

import React, { useState, useEffect, useRef } from "react";
import { Card, CardBody, Input, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import OpenAI from "openai";

import { Loading } from "@nextui-org/react";

// Initialize OpenAI API
const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_KEY, dangerouslyAllowBrowser: true // Accessing the API key from system environment variables
});

// Example student performance data
const studentData = [
    { name: "John Doe", english1: 75, english2: 80, math2: 65, math3: 70, science1: 85, science2: 90 },
    { name: "Jane Smith", english1: 85, english2: 88, math2: 78, math3: 82, science1: 89, science2: 91 },
    { name: "Bob Johnson", english1: 60, english2: 62, math2: 55, math3: 58, science1: 70, science2: 72 },
    // Add more student data as needed
];

const systemPrompt = `
You are an educational assistant. You will help generate lesson plans tailored to the needs of students, with a focus on those who are struggling the most. 

I will provide you with the performance data for the bottom 3 students, including their overall performance and their scores in specific subjects. 

Please use this information to:
1. Identify the subject the teacher wants to focus on (English, Math, or Science).
2. Analyze the performance data for the bottom 3 students.
3. Suggest a course of action, such as targeted activities, specific areas of focus, and additional support.
4. Summarize your suggested lesson plan in 1-2 sentences.
5. Ask the teacher if they approve the plan before proceeding to generate the full lesson plan card.

The student data will be provided in the following format:
- Student: [Name]
  - Overall Average: [Overall Percentage]%
  - English Average: [English Percentage]% (English 1: [Score]%, English 2: [Score]%)
  - Math Average: [Math Percentage]% (Math 2: [Score]%, Math 3: [Score]%)
  - Science Average: [Science Percentage]% (Science 1: [Score]%, Science 2: [Score]%)

Your output should be clear, concise, and tailored to the needs of the students based on the provided data. Please ask for confirmation before finalizing the lesson plan.
`;


export const ChatbotInterface = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("You are an educational assistant.");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [lessonPlan, setLessonPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [subject, setSubject] = useState("");
    const chatWindowRef = useRef(null);

    // Auto-scroll to the bottom of the chat window
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // Convert student data to a string summary for the bottom 3 students
    const generateStudentSummary = () => {
        // Calculate overall average for each student and sort by it
        const studentsWithAverages = studentData.map(student => {
            const overallAverage = (
                (student.english1 + student.english2 + student.math2 + student.math3 + student.science1 + student.science2) / 6
            ).toFixed(2);

            return {
                name: student.name,
                overallAverage,
                englishAverage: ((student.english1 + student.english2) / 2).toFixed(2),
                mathAverage: ((student.math2 + student.math3) / 2).toFixed(2),
                scienceAverage: ((student.science1 + student.science2) / 2).toFixed(2),
                details: {
                    english1: student.english1,
                    english2: student.english2,
                    math2: student.math2,
                    math3: student.math3,
                    science1: student.science1,
                    science2: student.science2,
                }
            };
        });

        // Sort by overall average in ascending order
        studentsWithAverages.sort((a, b) => a.overallAverage - b.overallAverage);

        // Take the bottom 3 students
        const bottomStudents = studentsWithAverages.slice(0, 3);

        // Format the summary
        const summary = bottomStudents.map(student => `
    Student: ${student.name}
    - Overall Average: ${student.overallAverage}%
    - English Average: ${student.englishAverage}% (English 1: ${student.details.english1}%, English 2: ${student.details.english2}%)
    - Math Average: ${student.mathAverage}% (Math 2: ${student.details.math2}%, Math 3: ${student.details.math3}%)
    - Science Average: ${student.scienceAverage}% (Science 1: ${student.details.science1}%, Science 2: ${student.details.science2}%)
    `).join('\n');

        return `Here are the details of the bottom 3 students based on overall performance:\n${summary}`;
    };


    const handleSendMessage = async () => {
        const userMessage = {
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "system", content: `Student Performance Summary:\n${generateStudentSummary()}` },
                    ...messages,
                    userMessage,
                ],
            });

            const assistantMessage = {
                role: "assistant",
                content: completion.choices[0].message.content,
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setLoading(false);

            if (!subject) {
                if (assistantMessage.content.toLowerCase().includes("english")) {
                    setSubject("English");
                } else if (assistantMessage.content.toLowerCase().includes("math")) {
                    setSubject("Math");
                } else if (assistantMessage.content.toLowerCase().includes("science")) {
                    setSubject("Science");
                }
            }

            if (assistantMessage.content.toLowerCase().includes("do you approve")) {
                onOpen();
            }
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
            alert("An error occurred. Please try again.");
        }
    };


    const handleApprove = () => {
        setMessages((prev) => [...prev, { role: "system", content: "Teacher approved the lesson plan." }]);
        // Generate the lesson plan card
        setLessonPlan(
            `Introduction: Teaching ${subject}. Learning: Focus on key areas where students need improvement. Homework: Assignments based on recent topics. Dates: Complete by next class.`
        );
        onOpenChange(false);
    };

    const handleDisapprove = () => {
        setMessages((prev) => [...prev, { role: "system", content: "Teacher disapproved the lesson plan." }]);
        setInput(""); // Reset input for additional teacher feedback
        onOpenChange(false);
    };

    return (
        <>
            <Card className="w-full p-4">
                <CardBody>
                    <div
                        ref={chatWindowRef}
                        className="chat-window"
                        style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            padding: "10px",
                            borderRadius: "8px",
                            backgroundColor: "#f1f1f1",
                            marginBottom: "20px",
                        }}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.role}`}
                                style={{
                                    textAlign: message.role === "user" ? "right" : "left",
                                    margin: "10px 0",
                                }}
                            >
                                <p
                                    style={{
                                        display: "inline-block",
                                        padding: "10px",
                                        borderRadius: "10px",
                                        backgroundColor: message.role === "user" ? "#007bff" : "#e0e0e0",
                                        color: message.role === "user" ? "#fff" : "#000",
                                        maxWidth: "70%",
                                    }}
                                >
                                    {message.content}
                                </p>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ textAlign: "center", marginTop: "10px" }}>
                                {/* <Loading type="points" /> */}
                                <p>loading...</p>
                            </div>
                        )}
                    </div>
                    <Input
                        clearable
                        bordered
                        fullWidth
                        placeholder="Ask the chatbot..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onPress={handleSendMessage} className="mt-2">
                        Send
                    </Button>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Do you approve this lesson plan?</ModalHeader>
                            <ModalBody>
                                <p>The suggested lesson plan is focused on {subject}. Would you like to proceed?</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={handleDisapprove}>
                                    Disapprove
                                </Button>
                                <Button color="primary" onPress={handleApprove}>
                                    Approve
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {lessonPlan && (
                <Card className="mt-4 w-full p-4">
                    <CardBody>
                        <p>{lessonPlan}</p>
                    </CardBody>
                </Card>
            )}
        </>
    );
};
