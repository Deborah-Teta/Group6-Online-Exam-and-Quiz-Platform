import Modal from "../../common/Modal";
import QuestionForm from "./QuestionForm";

function EditQuestion({ question, onClose, onSave, error }) {
  return (
    <Modal
      isOpen={Boolean(question)}
      onClose={onClose}
      title="Edit question"
      size="xl"
    >
      {question && (
        <>
          {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
          <QuestionForm
            key={question.id}
            initialQuestion={question}
            onSubmit={onSave}
            onCancel={onClose}
            submitLabel="Save changes"
          />
        </>
      )}
    </Modal>
  );
}

export default EditQuestion;