import Link from "next/link";
import { formatOrderCode } from "@/lib/format-order";
import { getOrderDivision } from "@/lib/orders";
import { DIVISION_BRAND } from "@/lib/divisions";
import CauchosHeader from "../../components/cauchos-header";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ pedido?: string; pagado?: string }>;
}) {
  const params = await searchParams;
  const paymentConfirmed = params.pagado === "1";
  const division = params.pedido ? (await getOrderDivision(params.pedido)) ?? "Cauchos" : "Cauchos";
  const brand = DIVISION_BRAND[division];

  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <CauchosHeader division={division} />
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-2xl items-center justify-center px-6 py-16">
      <div className="w-full rounded-[2rem] bg-white p-8 text-center shadow-lg shadow-black/10 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: brand.accent }}>
          {paymentConfirmed ? "Pago confirmado" : "Pedido creado"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#16384f] md:text-4xl">
          {paymentConfirmed
            ? "Tu pago demo quedó aprobado"
            : "Recibimos tu solicitud correctamente"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          {paymentConfirmed
            ? "El pedido quedó pagado dentro del flujo demo y ya puedes mostrar el seguimiento completo en tu cuenta."
            : "Tu pedido quedó guardado en la base de datos y ya aparece dentro de tu cuenta. El siguiente paso será conectar el pago con Wompi sobre esta misma orden."}
        </p>

        {params.pedido && (
          <div className="mt-8 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
              Código de pedido
            </p>
            <p className="mt-2 text-lg font-semibold text-[#16384f]">{formatOrderCode(params.pedido)}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/mi-cuenta"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors duration-200"
            style={{ backgroundColor: brand.accent }}
          >
            Ver mis pedidos
          </Link>
          <Link
            href={brand.basePath}
            className="rounded-full border border-[#16384f]/20 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
      </section>
    </main>
  );
}
