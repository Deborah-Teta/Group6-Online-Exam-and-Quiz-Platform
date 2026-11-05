import Modal from "../../common/Modal";
import QuestionForm from "./QuestionForm";

function EditQuestion({ question, onClose, onSave }) {
  return (
    <Modal
      isOpen={Boolean(question)}
      onClose={onClose}
      title="Edit question"
      size="xl"
    >
      {question && (
        <QuestionForm
          key={question.id}
          isOpen={Boolean(question)}
          initialQuestion={question}
          onSubmit={onSave}
          onCancel={onClose}
          submitLabel="Save changes"
        />
      )}
    </Modal>
  );
}

export default EditQuestion;