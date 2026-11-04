function StudentFooter({ student }) {
  return (
    <footer className="flex flex-col gap-[4px] px-[20px] py-[20px] text-[10px] leading-[1.55] text-[#6d7180] sm:flex-row sm:items-start sm:justify-between sm:px-[40px]">
      <p>Examly · A little more clarity. A better way to learn.</p>
      <p>
        {student.school} / {student.academicYear}
      </p>
    </footer>
  );
}

export default StudentFooter;
