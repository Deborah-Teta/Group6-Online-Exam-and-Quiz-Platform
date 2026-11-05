import Modal from "../../common/Modal";
import QuestionForm from "./QuestionForm";

function AddQuestion({ isOpen, onClose, onAdd, error }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a question" size="xl">
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <QuestionForm
        isOpen={isOpen}
        onSubmit={onAdd}
        onCancel={onClose}
        submitLabel="Add question"
      />
    </Modal>
  );
}
export default AddQuestion;