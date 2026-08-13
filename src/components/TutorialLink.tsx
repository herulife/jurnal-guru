import Link from "next/link";

export default function TutorialLink({
  href,
  label,
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label || "Buka panduan"}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D7C66] hover:text-[#0a6250] hover:underline"
    >
      <i className="fas fa-circle-question"></i>
      {label && <span>{label}</span>}
    </Link>
  );
}