type WhatsAppFloatButtonProps = {
  whatsappNumber: string | null;
};

export default function WhatsAppFloatButton({ whatsappNumber }: WhatsAppFloatButtonProps) {
  if (!whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola GEU, quiero más información.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-105"
      style={{ position: "fixed", left: "1.5rem", bottom: "1.5rem", zIndex: 90 }}
    >
      <svg viewBox="0 0 32 32" className="h-8 w-8 fill-white" aria-hidden="true">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.352.615 4.646 1.784 6.667L2.667 29.333l6.83-1.766a13.28 13.28 0 0 0 6.507 1.706h.006c7.362 0 13.333-5.97 13.333-13.333S23.366 2.667 16.004 2.667Zm7.82 18.81c-.332.933-1.65 1.71-2.694 1.933-.716.153-1.652.276-4.802-1.032-4.03-1.67-6.626-5.75-6.828-6.014-.194-.267-1.64-2.183-1.64-4.166 0-1.982 1.036-2.955 1.404-3.36.368-.406.803-.507 1.07-.507.267 0 .535.003.767.014.246.011.577-.093.902.688.332.798 1.128 2.767 1.226 2.968.098.2.164.435.033.7-.13.267-.196.434-.39.667-.196.234-.41.522-.586.7-.196.196-.4.408-.172.8.229.392 1.017 1.68 2.183 2.72 1.5 1.34 2.764 1.755 3.156 1.95.392.196.62.164.85-.1.229-.267.98-1.144 1.243-1.535.264-.392.527-.327.884-.196.36.13 2.28 1.075 2.672 1.27.392.196.653.294.751.457.098.163.098.947-.234 1.88Z" />
      </svg>
    </a>
  );
}
