import { useState } from "react";
import { Plus } from "lucide-react";
import ActionButton from "../../common/ActionButton";
import Input from "../../common/Input";
import Modal from "../../common/Modal";

function CreateClass({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    if (!name) {
      setError("Enter a class name.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const created = await onCreate({
        name,
        description: formData.description.trim(),
      });
      if (created) {
        setFormData({ name: "", description: "" });
        onClose();
      }
    } catch (requestError) {
      setError(requestError.message || "Could not create the class.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setError("");
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
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g. Introductory biology course covering cellular structures and genetics"
        />

        <p className="text-xs leading-5 text-slate-500">
          A joining code will be created for this class.
        </p>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

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
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
}

export default CreateClass;