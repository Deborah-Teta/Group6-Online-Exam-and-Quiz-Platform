import Modal from "../../common/Modal";
import QuestionForm from "./QuestionForm";

function AddQuestion({ isOpen, onClose, onAdd }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add a question" size="xl">
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