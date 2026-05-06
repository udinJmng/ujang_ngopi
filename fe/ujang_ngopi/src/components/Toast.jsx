export default function Toast({ msg, show }) {
  return (
    <div className={`un-toast${show ? " show" : ""}`}>{msg}</div>
  );
}
