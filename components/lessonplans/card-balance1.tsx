import React from "react";
import { Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";

export const CardBalance1 = ({
  introduction = "Introduction to Unit 3: Grammar Rules",
  learning = "Focus on punctuation, sentence structure, and verb usage",
  homework = "Complete the exercises on pages 45-50 in the textbook",
  dates = "Assignment due on September 15th",
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Card
        className="xl:max-w-sm bg-primary rounded-xl shadow-md px-3 w-full cursor-pointer"
        isHoverable
        isPressable
        onClick={onOpen}
      >
        <CardBody className="py-5">
          <div className="flex flex-col gap-2">
            <div>
              <span className="text-white text-lg font-semibold">Introduction</span>
              <p className="text-white text-md">{introduction}</p>
            </div>
            <div>
              <span className="text-white text-lg font-semibold">Learning</span>
              <p className="text-white text-md">{learning}</p>
            </div>
            <div>
              <span className="text-white text-lg font-semibold">Homework</span>
              <p className="text-white text-md">{homework}</p>
            </div>
            <div>
              <span className="text-white text-lg font-semibold">Dates</span>
              <p className="text-white text-md">{dates}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Lesson Plan Details</ModalHeader>
              <ModalBody>
                <p>
                  This modal contains detailed information about the lesson plan. It includes an in-depth overview of the topics, learning objectives, and key points covered in the lesson.
                </p>
                <p>
                  <strong>Introduction:</strong> This section introduces the lesson, setting the stage for the learning activities to follow. It explains why the lesson is important and what students should focus on.
                </p>
                <p>
                  <strong>Learning Objectives:</strong> The main goals of the lesson are outlined here, including what students should understand and be able to do by the end of the lesson.
                </p>
                <p>
                  <strong>Homework (Check for Understanding):</strong> Detailed instructions for homework assignments are provided, including any specific tasks students need to complete to reinforce their learning.
                </p>
                <p>
                  <strong>Important Dates:</strong> Key dates related to the lesson, such as assignment due dates and exam schedules, are listed here.
                </p>
                <p>
                  Additional placeholder text can be added here to simulate a more detailed lesson plan. The content should be formatted appropriately to match the structure and flow of a real lesson plan document.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
