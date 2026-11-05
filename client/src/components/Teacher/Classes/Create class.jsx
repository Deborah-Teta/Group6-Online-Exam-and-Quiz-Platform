import { useState } from "react";
import { Plus } from "lucide-react";
import ActionButton from "../../common/ActionButton";
import Input from "../../common/Input";
import Modal from "../../common/Modal";

function CreateClass({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({ name: "", description: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    if (!name) return;

    onCreate({
      name,
      description: formData.description.trim() || "Class",
    });

    setFormData({ name: "", description: "" });
  }

  function handleClose() {
    setFormData({ name: "", description: "" });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create a class"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Class name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Biology 10A"
          required
        />

        <Input
          label="Year and subject"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Year 10 · Biology"
        />

        <p className="text-xs leading-5 text-slate-500">
          A joining code will be created for this class.
        </p>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <ActionButton
            type="submit"
            label="Create class"
            icon={<Plus size={15} />}
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateClass;