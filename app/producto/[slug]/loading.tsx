import Image from "next/image";

export default function CargandoProducto() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f5] text-[#111]">
      <section className="mx-auto flex max-w-[960px] flex-col items-center px-6 py-20 text-center">
        <Image
          src="/geu-gus-loading.png"
          alt="Gus, la mascota de GEU"
          width={180}
          height={180}
          priority
          className="h-40 w-40 animate-bounce object-contain md:h-44 md:w-44"
        />
        <p className="mt-6 text-xl font-black tracking-[-0.02em] text-slate-950">
          ¡Un momento! Gus está buscando tu producto...
        </p>
        <p className="mt-2 text-base text-[#6e7379]">Ya casi está listo.</p>
      </section>
    </main>
  );
}
