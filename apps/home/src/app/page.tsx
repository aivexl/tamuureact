import { getShopData } from "@/lib/api";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Typography";

export default async function HomePage() {
  const data = await getShopData();

  return (
    <main className="py-20">
      <Container>
        <header className="mb-12">
          <Heading level={1}>Inspirasi Pernikahan Terbaik</Heading>
          <p className="text-slate-500 mt-4 text-lg">Temukan vendor pilihan untuk hari spesial Anda.</p>
        </header>
        
        {/* Placeholder for Components in next tasks */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.products.slice(0, 8).map((p: any) => (
            <div key={p.id} className="aspect-[4/5] bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </section>
      </Container>
    </main>
  );
}
